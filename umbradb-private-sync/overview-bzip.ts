// What bzip2 -9 does to each transfer of the overview page, for both schemes, from the example's own code.
//
//   node overview-bzip.ts <work dir> [today] [1m]
//
// - "1m": the two stored snapshots of the proof of concept's stack, padded to 1,000,000 entries (one per scheme). Their
//   public artifacts are compressed as stored; a call of 32 requests is made with the wallet's code and answered from
//   the stored table with the server's.
// - "today": no snapshot of the real size is stored and the database was unreachable, so the real records are read out
//   of the stored SimplePIR snapshot (the padding puts record i at slot ⌊i·N/R⌋; the nullifier noise is regenerated
//   and removed) and each scheme builds its three tables from them, as a build does.
// - The commitment file is measured on the real entries only: a padded file repeats real points in its noise entries,
//   which bzip2 finds, so its own ratio says nothing about a chain of that size.
import { execFileSync } from "node:child_process";
import { createCipheriv, createHash, randomInt } from "node:crypto";
import { closeSync, mkdirSync, openSync, readdirSync, readFileSync, writeFileSync, writeSync } from "node:fs";
import { join } from "node:path";

const ex = `${process.env.HOME}/todo/Umbra/experiments/poc-ipir/examples/private-shielded-sync`;
const SNAPSHOTS = `${process.env.HOME}/todo/Umbra/resources/00058-poc-ipir/stack/pss-data/snapshots`;
const { openServerScheme } = await import(`${ex}/pir/server-schemes.ts`);
const { openWalletScheme } = await import(`${ex}/pir/wallet-schemes.ts`);
const { compileIpirWasm } = await import(`${ex}/ipir/wallet-node.ts`);
const { nullifierSource, decodeNullifierRecord } = await import(`${ex}/pir/buckets.ts`);
const { deserializeGrid, readRecord, positionOf } = await import(`${ex}/pir/grid.ts`);
const { encodeQueryBody, encodeAnswerBody, fromHex, slotOf } = await import(`${ex}/shared/index.ts`);

const [work, ...which] = process.argv.slice(2);
if (!work) throw new Error("usage: node overview-bzip.ts <work dir> [today] [1m]");
mkdirSync(work, { recursive: true });
const want = (name: string): boolean => which.length === 0 || which.includes(name);

const tmp = join(work, "payload.bin");
function bzPath(path: string): number {
  return Number(execFileSync("sh", ["-c", 'bzip2 -9 -c "$1" | wc -c', "sh", path], { maxBuffer: 1 << 20 }).toString().trim());
}
function writeParts(path: string, parts: readonly Uint8Array[]): { digest: string; size: number } {
  const hash = createHash("sha256");
  const fd = openSync(path, "w");
  let size = 0;
  try {
    for (const part of parts)
      for (let off = 0; off < part.length; off += 1 << 24) {
        const chunk = part.subarray(off, Math.min(part.length, off + (1 << 24)));
        hash.update(chunk);
        let written = 0;
        while (written < chunk.length) written += writeSync(fd, chunk, written, chunk.length - written);
        size += chunk.length;
      }
  } finally {
    closeSync(fd);
  }
  return { digest: hash.digest("hex"), size };
}
const bz = (bytes: Uint8Array): number => (writeParts(tmp, [bytes]), bzPath(tmp));
const sized = (bytes: number, bzip2: number) => ({ bytes, bzip2, ratio: Number((bzip2 / bytes).toFixed(4)) });

const snapshotId = new Uint8Array(32).fill(7);
/** One call of 32 random groups: made by the wallet's code, answered by the server's, one answer decoded. */
async function call(serverTable: any, walletTable: any, check?: (group: number, records: Uint8Array[]) => void) {
  const groups = Array.from({ length: 32 }, () => randomInt(0, walletTable.groups));
  const prepared = await walletTable.prepareCall(groups);
  const up = encodeQueryBody({ snapshotId, count: 32, payload: prepared.requests }, walletTable.requestBytes);
  const answers = await serverTable.answer(prepared.requests, 32);
  const down = encodeAnswerBody({ snapshotId, count: 32, payload: answers }, walletTable.responseBytes);
  const decoded = await prepared.decode(answers, 32);
  if (decoded.length !== 32 || decoded[0].length !== walletTable.perGroup) throw new Error("the answer did not decode to 32 groups");
  if (check) for (let i = 0; i < 32; i++) check(groups[i]!, decoded[i]);
  // one request and one answer of the call, each compressed alone: the mean over the 32
  const alone = (all: Uint8Array, itemBytes: number) => {
    if (all.length !== 32 * itemBytes) throw new Error(`a call's payload is ${all.length} bytes, not 32 x ${itemBytes}`);
    let total = 0;
    for (let i = 0; i < 32; i++) total += bz(all.subarray(i * itemBytes, (i + 1) * itemBytes));
    return sized(itemBytes, Math.round(total / 32));
  };
  return {
    up: sized(up.length, bz(up)),
    down: sized(down.length, bz(down)),
    oneUp: alone(prepared.requests, walletTable.requestBytes),
    oneDown: alone(answers, walletTable.responseBytes),
  };
}

const dirOf = (scheme: string): string => {
  for (const d of readdirSync(SNAPSHOTS)) {
    const m = JSON.parse(readFileSync(join(SNAPSHOTS, d, "manifest.json"), "utf8"));
    if (m.scheme === scheme && m.padding?.size === 1_000_000) return join(SNAPSHOTS, d);
  }
  throw new Error(`no stored 1M snapshot of ${scheme}`);
};
const out: Record<string, unknown> = {};
const TABLES = ["read", "nullifier", "path"] as const;

// ── 1M: the stored snapshots ─────────────────────────────────────────────────────────────────────────────────────
if (want("1m")) {
  for (const scheme of ["simplepir", "ipir-sp"]) {
    const dir = dirOf(scheme);
    const m = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
    const server = await openServerScheme(scheme, { threads: 6 });
    const wallet = await openWalletScheme(m, { ipirWasm: () => compileIpirWasm() });
    const result: Record<string, unknown> = { height: m.height, entries: m.padding.size };
    for (const name of TABLES) {
      const ref = m.artifacts[`${name}Table`];
      const pub = m.artifacts[`${name}Public`];
      const started = performance.now();
      const st = await server.loadTable(ref, join(dir, ref.digest), join(dir, pub.digest));
      const wt = await wallet.openTable(ref, readFileSync(join(dir, pub.digest)));
      result[name] = { public: sized(pub.size, bzPath(join(dir, pub.digest))), ...(await call(st, wt)) };
      st.release();
      wt.dispose();
      console.error(`1m ${scheme} ${name}: ${Math.round(performance.now() - started)} ms`);
    }
    wallet.dispose();
    await server.close();
    out[`1m ${scheme}`] = result;
  }
}

// ── today: each scheme's tables from the real records ───────────────────────────────────────────────────────────
if (want("today")) {
  const dir = dirOf("simplepir");
  const m = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
  const R: number = m.firstFree;
  const N: number = m.padding.size;
  const slots = { firstFree: R, padding: { size: N } };
  const a = m.artifacts;

  // the real scan entries
  const scanAll = readFileSync(join(dir, a.scan.digest));
  const scan = new Uint8Array(R * 36);
  for (let i = 0; i < R; i++) scan.set(scanAll.subarray(36 * slotOf(slots, i), 36 * slotOf(slots, i) + 36), 36 * i);
  let zeroEntries = 0;
  for (let i = 0; i < R; i++) if (!scan.subarray(36 * i, 36 * i + 36).some((b) => b !== 0)) zeroEntries++;

  // the real read and path records
  const real = (name: "read" | "path"): Uint8Array[] => {
    const grid = deserializeGrid(readFileSync(join(dir, a[`${name}Table`].digest)));
    const records: Uint8Array[] = [];
    for (let i = 0; i < R; i++) {
      const { column, slot } = positionOf(slotOf(slots, i), grid.perColumn);
      records.push(readRecord(grid, column, slot));
    }
    return records;
  };
  const readRecords = real("read");
  const pathRecords = real("path");

  // the real nullifier entries: every entry of the table that the padding's noise stream did not produce
  const noise = new Set<string>();
  {
    const seed = createHash("sha256").update("pss-padding/nullifier/").update(fromHex(m.blockHash, 32)).update(String(N)).digest();
    const cipher = createCipheriv("aes-128-ctr", seed.subarray(0, 16), seed.subarray(16, 32));
    const chunk = cipher.update(new Uint8Array(N * 32));
    for (let i = 0; i < N; i++) noise.add(Buffer.from(chunk.subarray(32 * i, 32 * i + 12)).toString("hex"));
  }
  const entries: { nullifier: Uint8Array; height: number; txIndex: number }[] = [];
  {
    const grid = deserializeGrid(readFileSync(join(dir, a.nullifierTable.digest)));
    for (let column = 0; column < grid.cols; column++)
      for (let slot = 0; slot < grid.perColumn; slot++) {
        const record = readRecord(grid, column, slot);
        if (!record.some((b: number) => b !== 0)) continue;
        const e = decodeNullifierRecord(record);
        if (!noise.has(Buffer.from(e.nullifier.subarray(0, 12)).toString("hex"))) entries.push(e);
      }
  }
  const values = new Uint8Array(entries.length * 32);
  const heights = new Uint32Array(entries.length);
  const txs = new Uint32Array(entries.length);
  entries.forEach((e, i) => {
    values.set(e.nullifier, 32 * i);
    heights[i] = e.height;
    txs[i] = e.txIndex;
  });
  console.error(`today: ${R} outputs (${zeroEntries} without a ciphertext), ${entries.length} nullifiers, height ${m.height}`);
  out.today = { height: m.height, outputs: R, withoutCiphertext: zeroEntries, nullifiers: entries.length, scan: sized(scan.length, bz(scan)) };

  const equal = (x: Uint8Array, y: Uint8Array): boolean => x.length === y.length && x.every((b, i) => b === y[i]);
  for (const scheme of ["simplepir", "ipir-sp"]) {
    const server = await openServerScheme(scheme, { threads: 6 });
    const wallet = await openWalletScheme({ scheme, pir: server.params }, { ipirWasm: () => compileIpirWasm() });
    const sources: Record<string, any> = {
      read: { name: "read", records: R, recordBytes: 98, fill: (put: any) => readRecords.forEach((r, i) => put(i, r)) },
      path: { name: "path", records: R, recordBytes: 512, fill: (put: any) => pathRecords.forEach((r, i) => put(i, r)) },
      nullifier: nullifierSource({ count: entries.length, values, heights, txs }),
    };
    const result: Record<string, unknown> = {};
    for (const name of TABLES) {
      const started = performance.now();
      const source = sources[name];
      const encoded = server.encodeTable(source);
      const filePath = join(work, `${scheme}-${name}.table`);
      const file = writeParts(filePath, encoded.file);
      const prepared = await encoded.setup(fromHex(file.digest, 32), filePath);
      const pubPath = join(work, `${scheme}-${name}.public`);
      const pub = writeParts(pubPath, prepared.public);
      const ref = {
        digest: file.digest, size: file.size, records: source.records, recordBytes: source.recordBytes,
        groups: encoded.groups, perGroup: encoded.perGroup, layout: prepared.layout,
        ...(name === "nullifier" ? { bucketBits: encoded.bucketBits, capacity: encoded.perGroup } : {}),
      };
      const st = await server.adoptTable(ref, prepared.transfer);
      const wt = await wallet.openTable(ref, readFileSync(pubPath));
      const records = name === "read" ? readRecords : name === "path" ? pathRecords : null;
      const check = records === null ? undefined : (group: number, got: Uint8Array[]) => {
        for (let s = 0; s < got.length; s++) {
          const i = group * encoded.perGroup + s;
          if (i < R && !equal(got[s]!, records[i]!)) throw new Error(`${scheme} ${name}: record ${i} decoded wrongly`);
        }
      };
      result[name] = { shape: `${prepared.layout.rows} x ${prepared.layout.cols}`, public: sized(pub.size, bzPath(pubPath)), ...(await call(st, wt, check)) };
      st.release();
      wt.dispose();
      console.error(`today ${scheme} ${name}: ${Math.round(performance.now() - started)} ms`);
    }
    wallet.dispose();
    await server.close();
    out[`today ${scheme}`] = result;
  }
}

console.log(JSON.stringify(out, null, 1));
writeFileSync(join(work, "overview-bzip.json"), JSON.stringify(out, null, 1));
