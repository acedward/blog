// The Dust check's table (32-byte commitments read by position) under both schemes, from the example's own rules.
const ex = `${process.env.HOME}/todo/Umbra/experiments/poc-ipir/examples/private-shielded-sync`;
const { positionalShape } = await import(`${ex}/pir/grid.ts`);
const { positionalIpirShape } = await import(`${ex}/pir/ipir/shape.ts`);
const { ipirRequestBytes, ipirResponseBytes, ipirMasksBytes } = await import(`${ex}/ipir/sizes.ts`);
const Q = 32, HDR = 40;
for (const n of [1_000_000, 10_000_000]) {
  const s = positionalShape(n, 32);
  const i = positionalIpirShape(n, 32);
  console.log(JSON.stringify({
    n,
    simple: { shape: `${s.rows} x ${s.cols}`, all: s, setup: s.rows * 4096, oneUp: s.cols * 4, oneDown: s.rows * 4, up: HDR + Q * s.cols * 4, down: HDR + Q * s.rows * 4 },
    ipir: { shape: `${i.rows} x ${i.cols}`, all: i, setup: ipirMasksBytes(i.cols), oneUp: ipirRequestBytes(i.rows), oneDown: ipirResponseBytes(i.cols), up: HDR + Q * ipirRequestBytes(i.rows), down: HDR + Q * ipirResponseBytes(i.cols) },
  }));
}
