// IPIR+SP's path table (512 B records) past the scheme's limit of 2^30 cells: the shape the example's own rule would
// pick if a table could hold that many cells. The row cap (32,768) is kept: it is a correctness limit of the query.
//
//   node overview-ipir-path-estimate.ts 10000000
const ex = `${process.env.HOME}/todo/Umbra/experiments/poc-ipir/examples/private-shielded-sync`;
const { IPIR_RING, IPIR_MAX_ROWS, IPIR_MAX_CELLS, ipirRequestBytes, ipirResponseBytes, ipirMasksBytes } = await import(`${ex}/ipir/sizes.ts`);
const { positionalIpirShape, ipirCellsPerRecord } = await import(`${ex}/pir/ipir/shape.ts`);
const Q = 32, HDR = 40;
function uncapped(records: number, recordBytes: number) {
  const e = ipirCellsPerRecord(recordBytes);
  let best: { rows: number; cols: number } | null = null;
  let bestCost = Infinity;
  for (let rows = IPIR_RING; rows <= IPIR_MAX_ROWS; rows += IPIR_RING) {
    const cols = Math.max(IPIR_RING, Math.ceil((Math.ceil(records / rows) * e) / IPIR_RING) * IPIR_RING);
    const cost = ipirRequestBytes(rows) + ipirResponseBytes(cols);
    if (cost < bestCost || (cost === bestCost && rows * cols < best!.rows * best!.cols)) { best = { rows, cols }; bestCost = cost; }
  }
  return best!;
}
// the rule above equals the example's wherever the example has a shape
for (const n of [69_329, 1_000_000, 4_000_000]) {
  const a = positionalIpirShape(n, 512, "path"), b = uncapped(n, 512);
  if (a.rows !== b.rows || a.cols !== b.cols) throw new Error(`rule differs at ${n}: ${a.rows} x ${a.cols} vs ${b.rows} x ${b.cols}`);
}
for (const n of process.argv.slice(2).map(Number)) {
  const s = uncapped(n, 512);
  console.log(JSON.stringify({
    n, shape: `${s.rows} x ${s.cols}`, cells: s.rows * s.cols, timesTheLimit: Number(((s.rows * s.cols) / IPIR_MAX_CELLS).toFixed(2)),
    setup: ipirMasksBytes(s.cols), oneUp: ipirRequestBytes(s.rows), oneDown: ipirResponseBytes(s.cols),
    up: HDR + Q * ipirRequestBytes(s.rows), down: HDR + Q * ipirResponseBytes(s.cols),
  }));
}
