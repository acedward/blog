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
