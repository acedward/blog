# acedward @ mnf: products and proofs of concept

A single-page site that lists the products and proofs of concept we build, one
entry per product, each with a diagram, a video or image, one line, and the
code behind it.

- **Live:** https://blog.zkdojo.com/
- **Published from:** the `main` branch of this repo, via GitHub Pages (custom domain set in `CNAME`).
- **Source:**
  - `index.html`: the product index (plain HTML + inline CSS and JS, no build step).
    All entries live in the `FEATURED`, `PUBLISHED`, `PROJECTS` and `OTHER` arrays in its script.
  - `media/`: the screenshots, video posters, videos and PDFs the entries show.
  - `presentations/`: standalone slide decks (one self-contained HTML file each).
  - `updates.html`: the previous blog (weekly updates, timeline and presentations
    view), kept as a frozen archive and linked from the footer. Do not add new
    content to it.
- **Workflow:** no branches. Commit directly to `main`. Every push to `main` publishes.
- **Last updated:** the footer shows a "Last updated" date. Update it whenever the content changes.

## Style

- Do not use em dashes. Use commas, colons, parentheses, or separate sentences.

## Writing entries

- **One product per entry.** Normally one product = one repo or one branch
  (many proofs of concept live on a branch of a shared repo). PRs, specs, decks
  and follow-up work for the same product go into that entry's links, grouped
  under headings, never into a new entry.
- **Results, not process.** Internal workflow (spec approvals, plan reviews,
  audits, governance gates, "awaiting approval") is not content.
- **No test evidence and no status labels.** Do not cite check counts, pass/fail
  stats, "verified on preprod", "CI green", or merged/open/draft states.
- **The line says what the product does,** in one or two sentences, for someone
  who has never seen it.
- **Never miss a new public repo.** When updating, sweep every project folder for
  new remotes and decide which entry each belongs to (or whether it is a new product).

## Structure

The page has four sections, in this order:

1. **Featured**: the requested presentation and highlighted projects, driven by
   `FEATURED`. An optional `primary: [label, url]` gives each entry a direct action.
2. **Published POC**: apps that are live on stagenet. Each has an `app` URL
   (the "Open app" button). The video or image comes first, then the diagram.
3. **Projects**: one full-width row per product: diagram, then video or image.
4. **Other projects and support**: smaller products and supporting work, in
   compact rows about a third of the height of a project row (text on the left,
   a small diagram and a small video or image on the right).

Each entry is an object with:

- `id`: anchor id (kebab-case)
- `title`, and optional `sub` (a short qualifier such as "MIP-0018")
- `line`: the one-line description
- `flow`: the diagram, as alternating node and edge labels
  (`['EVM wallet', 'signs', 'Passport account', ...]`), ideally 3 to 4 nodes;
  `hl` is the index of the node to highlight (usually the product itself)
- `media`: `{ kind: 'video', src, poster, cap }`, `{ kind: 'img', src, cap }` or
  `{ kind: 'slides', pages, pdf, cap }`; leave it out when nothing exists yet and
  the entry shows a placeholder
  - `{ kind: 'deck', src, href, cap }` links a title-slide preview to its presentation.
  - `{ kind: 'wallets', software, hardware }` lists wallet coverage as text in place
    of a screenshot. Keep relevant compatibility limits visible.
- `links`: `[label, url]` pairs, with `grp('Heading')` to start a group.
  Helpers: `repo()`, `branch()`, `pr()`, `live()`. A link whose label starts with
  "Live" also shows a "Live" tag on the entry. Link a slide deck as
  `['Slides', 'presentations/<deck>.html']`.

## Media

- One video or image per entry; prefer a video when one exists.
- Images: JPEG, about 1400 px wide. They are shown whole (fit) over a blurred
  copy of themselves on a dark background, so any aspect ratio works.
- Videos: 1080p H.264 with burned-in subtitles (they start muted), web
  fast-start (`-movflags +faststart`), and a poster frame
  (`<name>-poster.jpg`). Keep each file under about 15 MB: re-encode with
  `-crf 23 -maxrate <kbps>` when the source copy is larger.
- Look at every image and at frames from every video before adding it: no seed
  phrases, private keys, credentials or personal names.

## Other

Do never add personal names or personal tasks into the site.
This is a public page for sharing my work.

**Private projects.** If a project folder in the workspace contains a file named
`.private`, skip that project entirely: none of its work gets an entry, a link,
or a mention anywhere on the page. When sweeping projects for updates, check for
`.private` first and move on if it is present.
