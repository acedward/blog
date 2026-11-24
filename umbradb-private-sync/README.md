# UmbraDB private sync

The source of the private-sync overview page: how a phone syncs its shielded tokens and its Dust without the server
learning which are its own, and what it transfers at three chain sizes.

- Live, public but unlisted: https://umbradb-private-sync.pages.dev/

## Layout

| Path | What it is |
|---|---|
| `overview.html` | The page (four tabs: Shielded Tokens, Dust Sync, Sizes, Server). The only file published |
| `overview-deploy.sh` | Publishes `overview.html` as `index.html` of the Cloudflare Pages project `umbradb-private-sync`, with `robots.txt` and `_headers` asking search engines not to index it |
| `overview-bzip.ts`, `overview-bzip/` | Measures the bytes each transfer moves with `bzip2 -9`, Preprod today and 1M on a padded copy; results as JSON |
| `overview-shapes.ts`, `overview-dust-shapes.ts`, `overview-ipir-path-estimate.ts` | The table shapes and sizes the page shows, from the proof of concept's own rules |
| `overview-spec-sizes.ts`, `overview-spec-sizes.json` | The figures of the current page (the private sync modules design: IPIR+SP only, groups of 256 for paths, tables at every block height), from the proof of concept's shape rule and size formulas, at Mainnet's counts, 1M and 10M. The page embeds them |
| `overview-v1-with-split.html` | An earlier version with a fourth (Split) page |
| `scan-benchmark.html` | Browser benchmark: the ownership test on the GPU and on CPU (WASM), checked against the ledger's values |
| `pir-server-benchmark.html` | Browser benchmark: the server step of a SimplePIR query on the GPU (the earlier scheme, not IPIR+SP) |

The scripts read the proof of concept from `~/todo/Umbra/experiments/poc-ipir/examples/private-shielded-sync` and
its snapshots from `~/todo/Umbra/resources/00058-poc-ipir/stack/pss-data/snapshots`, by absolute path.

## Redeploy

```bash
sh overview-deploy.sh
```

It uploads from a temporary folder, so nothing else in this folder is published.
