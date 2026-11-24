// Table shapes and byte lengths of both schemes at a given entry count, from the example's own rules.
const ex = `${process.env.HOME}/todo/Umbra/experiments/poc-ipir/examples/private-shielded-sync`;
const { positionalShape, widestShape } = await import(`${ex}/pir/grid.ts`);
const { cellsPerRecord } = await import(`${ex}/pir/encode.ts`);
const { noiseBoundHolds } = await import(`${ex}/pir/params.ts`);
const { positionalIpirShape, bucketIpirShape } = await import(`${ex}/pir/ipir/shape.ts`);
const { ipirRequestBytes, ipirResponseBytes, ipirMasksBytes } = await import(`${ex}/ipir/sizes.ts`);
import { randomFillSync } from "node:crypto";

const Q = 32, HDR = 40;
function loads(n: number): (bits: number) => number {
  // n random 24-bit prefixes; the fullest bucket at each cut
  const hist = new Uint32Array(1 << 24);
  const buf = new Uint8Array(3 * 1_000_000);
  for (let done = 0; done < n; ) {
    const take = Math.min(1_000_000, n - done);
    randomFillSync(buf, 0, 3 * take);
    for (let i = 0; i < take; i++) hist[(buf[3 * i]! << 16) | (buf[3 * i + 1]! << 8) | buf[3 * i + 2]!]!++;
    done += take;
  }
  const max: number[] = [];
  let cur: Uint32Array = hist;
  for (let bits = 24; bits >= 1; bits--) {
    let m = 0;
    for (let i = 0; i < cur.length; i++) if (cur[i]! > m) m = cur[i]!;
    max[bits] = m;
    const next = new Uint32Array(cur.length >> 1);
    for (let i = 0; i < next.length; i++) next[i] = cur[2 * i]! + cur[2 * i + 1]!;
    cur = next;
  }
  return (bits) => Math.max(1, max[bits]!);
}

function simple(n: number, nullifiers: number, maxLoad: (b: number) => number) {
  const read = positionalShape(n, 98);
  const path = widestShape(n, 512);
  const e = cellsPerRecord(40);
  let best: { bits: number; cap: number; cost: number } | null = null;
  for (let bits = 4; bits <= 24; bits++) {
    if (!noiseBoundHolds(2 ** bits)) continue;
    const cap = maxLoad(bits);
    const cost = cap * e + 2 ** bits;
    if (best === null || cost < best.cost) best = { bits, cap, cost };
  }
  const nul = { rows: best!.cap * e, cols: 2 ** best!.bits };
  const t = (s: { rows: number; cols: number }) => ({
    shape: `${s.rows} x ${s.cols}`, setup: s.rows * 4096, up: HDR + Q * s.cols * 4, down: HDR + Q * s.rows * 4, cells: s.rows * s.cols,
  });
  return { read: t(read), nullifier: t(nul), path: t(path) };
}

function ipir(n: number, nullifiers: number, maxLoad: (b: number) => number) {
  const t = (s: { rows: number; cols: number }) => ({
    shape: `${s.rows} x ${s.cols}`, setup: ipirMasksBytes(s.cols), up: HDR + Q * ipirRequestBytes(s.rows), down: HDR + Q * ipirResponseBytes(s.cols), cells: s.rows * s.cols,
  });
  const out: Record<string, unknown> = {};
  out.read = t(positionalIpirShape(n, 98));
  out.nullifier = t(bucketIpirShape({ records: nullifiers, recordBytes: 40, maxLoad }));
  try { out.path = t(positionalIpirShape(n, 512, "path")); } catch (e) { out.path = String((e as Error).message); }
  for (const k of [12, 10, 8, 6, 5, 4]) {
    try { out[`path_k${k}`] = t(positionalIpirShape(n, 32 * k, "path")); } catch (e) { out[`path_k${k}`] = "too large"; }
  }
  return out;
}

for (const n of process.argv.slice(2).map(Number)) {
  const ml = loads(n);
  console.log(JSON.stringify({ n, simplepir: simple(n, n, ml), ipir: ipir(n, n, ml) }, null, 1));
}
