# acedward @ mnf: project briefs

A single-page site that maintains briefs and links for the projects we are
working on (and have worked on).

- **Live:** https://blog.zkdojo.com/
- **Published from:** the `main` branch of this repo, via GitHub Pages (custom domain set in `CNAME`).
- **Source:** `index.html` (plain HTML + inline CSS, no build step), plus standalone
  slide decks under `presentations/` (one self-contained HTML file each).
- **Workflow:** no branches. Commit directly to `main`. Every push to `main` publishes.
- **Last updated:** the page must show a "last updated" timestamp. Update it whenever the content changes.

## Style

- Do not use em dashes. Use commas, colons, parentheses, or separate sentences.

## Writing entries

Rules for what goes into a row, a note, or a timeline entry:

- **Results, not process.** Internal workflow (spec approvals, plan reviews,
  audits, governance gates, "awaiting approval") is not content. Write
  "Created a spec for X", never "the spec for X was approved".
- **No test evidence.** Do not cite check counts, pass/fail stats, "verified on
  preprod", "CI green", "passes twice", or similar. Shipped work is assumed
  tested; test detail adds no value to a reader.
- **Lead with the key change.** Say the one thing that matters about the work.
  Incidental cleanups (removed dead paths, refactors, harness fixes) do not
  belong unless they are themselves the story.
- **Never miss a new public repo or PR.** A newly published repo is usually the
  most important entry of its week: it always gets a row (and a timeline entry)
  even when other updates feel bigger. When updating, sweep every project for
  new remotes before writing.
- **Investigations, specs, and plans count as work.** Code is not the only
  entry type: an investigation that surfaced findings, a written spec, or a new
  plan belongs in the timeline (and gets a row when it stands alone), even with
  no repo or PR to link yet. Frame it as its result: "Created a spec for X",
  "Investigated X, found Y" — never as approval status or process.

## Structure

The page reads as a blog. A sticky sidebar on the left lists the sections and
highlights the one in view. The page is organized by **section**. A section is
usually a single project, but it can also be a **category** that groups related
work (e.g. "Games", "Other Small Projects"). Each section has:

- a **title**
- an optional **dependency line** (`p.deps`): "Depends on" and "Needed by", linking
  to other project sections by anchor. Both directions of an edge are shown.
- one or two paragraphs of **prose** explaining what the project is and why it
  matters
- a list of **rows** (`ul.work`)

Each **row** is a unit of work (a repo, a pull request, or something else),
written as one line:

- **title**: linked to the PR or repo when there is one, plain text when there isn't
- **note**: a muted clause with what it does and its status (e.g., "not merged, proof
  of concept", "Open", "not started yet")
- **links**: PR, Repo, and optionally Live and Slides, separated by `<span class="sep">·</span>`

There are no tags; status lives in the note.

## Slides

Slide decks live in `presentations/` as self-contained HTML files, one per talk.
A row links to one with a relative href (e.g. `presentations/nixnax.html`) labelled
"Slides".

The page also has a **Presentations view** (third button in the view bar, next to
Consolidated and Timeline), driven by the inlined JSON block `data-presentations`
in `index.html`. It renders a flat list sorted by date, never grouped by week.
Every new deck gets an entry there in addition to its row link:

- `id`: anchor id, prefixed `pres-` (e.g. `pres-nixnax`)
- `date`: `YYYY-MM-DD`, the day the deck was published
- `title`: the deck's name, linked to `href`
- `text`: one line describing the presentation's own content (its slides), not the
  project's status; the project story lives in the consolidated view
- `href`: relative path to the deck file
- `links`: explicit link list, at minimum `[{ "label": "Slides", "href": <deck> }]`;
  the deck link is the most important part of the entry, so it appears both on the
  title and here
- `ref`: the related project, `{ "section": id }` or `{ "section": id, "row": id }`,
  matching ids in `data-consolidated`; it renders as a link back to that section

## Adding a row

- Put the row under the **correct section**. If it fits an existing category, add it
  there. If no section fits, add a new one with its own prose, and add it to the
  sidebar list.
- Keep notes short. A note may just explain status (e.g., "not merged, POC").
- If the section prose should mention the new work, add a clause; don't restate the row.
- Prose describes the section as a whole. In a category, the per-item detail belongs in
  the row note, not the prose.
- Update the "last updated" timestamp on the page.
- Commit to `main`; it publishes automatically.

## Example

Project: **Umbra Indexer**
Row: "Read from the node instead of the indexer", note "not merged, proof of concept",
links PR #1 and Repo.

## Other

Do never add personal names or personal tasks into the blog.
This is a public page for sharing my work.
