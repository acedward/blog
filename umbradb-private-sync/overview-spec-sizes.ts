// The figures of the overview page under spec 00065 (IPIR+SP only, C′ paths, tables at every block height), from the
// proof of concept's own shape rule and size formulas, the same rule the spec's measured builds used.
//
//   node overview-spec-sizes.ts
//
// Shielded columns: outputs on Mainnet (read 2026-11-23 from its indexer, `zswapEndIndex`), 1M and 10M, one nullifier
// per output assumed, as the spec's builds do. Dust columns: Dust commitments on Mainnet in its ledger-9 era
// (`dustCommitmentEndIndex`) and 10M. Prints one JSON object.
const POC = `${process.env.HOME}/todo/Umbra/experiments/poc-dust-sync/examples/private-shielded-sync`;
const { positionalIpirShape, estimatedBucketIpirShape } = await import(`${POC}/pir/ipir/shape.ts`);
const { ipirRequestBytes, ipirResponseBytes, ipirMasksBytes, IPIR_MAX_CELLS } = await import(`${POC}/ipir/sizes.ts`);

const PACKING_PER_BLOCK = 33.6e6; // measured per column block of 2,048 columns (spec, Sizes and build times)
const CALL = 32;
const HEADER = 40;

/** A table of `records` records of `bytes`: its shape in the fewest pieces the rule accepts, and what it costs. */
function table(records: number, bytes: number, bucketed = false) {
  const cells = Math.ceil(bytes / 2);
  for (let pieces = Math.max(1, Math.ceil((records * cells) / IPIR_MAX_CELLS)); ; pieces++) {
    try {
      const n = Math.ceil(records / pieces);
      const s = bucketed ? estimatedBucketIpirShape(n, bytes) : positionalIpirShape(n, bytes);
      const up = ipirRequestBytes(s.rows), down = ipirResponseBytes(s.cols);
      return {
        shape: `${s.rows} × ${s.cols}`, pieces,
        up, down, callUp: HEADER + CALL * up, callDown: HEADER + CALL * down,
        masks: pieces * ipirMasksBytes(s.cols),
        memory: pieces * (s.rows * s.cols * 2 + (s.cols / 2048) * PACKING_PER_BLOCK),
      };
    } catch {}
  }
}

const shielded = [38_053, 1_000_000, 10_000_000].map((n) => ({
  outputs: n,
  scanFile: 36 * n,
  nullifierPrefixes: 4 * n,
  upperRoots: Math.ceil(n / 256) * 32,
  read: table(n, 98),
  nullifier: table(n, 40, true),
  groups: table(Math.ceil(n / 256), 8192),
}));

// Dust: a spend creates one commitment, and so does each first coin, so spends = commitments − generation records.
// Generation records: Mainnet's 10,410 today; 1M at the 10M column (the spec's sizing point for that tree).
const dust = [
  { commitments: 933_567, generation: 10_410 },
  { commitments: 10_000_000, generation: 1_000_000 },
].map(({ commitments, generation }) => ({
  commitments, generation,
  spends: commitments - generation,
  check: table(commitments, 32),
  groups: table(Math.ceil(commitments / 256), 8192),
  generationGroups: table(Math.ceil(generation / 256), 8192),
  // First coins by PIR (decided 2026-11-24): one 64-byte record per first coin, one first coin per Night record.
  firstCoins: table(generation, 64),
  commitmentRoots: Math.ceil(commitments / 256) * 32,
  generationRoots: Math.ceil(generation / 256) * 32,
}));

console.log(JSON.stringify({ shielded, dust }, null, 1));
