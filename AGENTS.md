# acedward @ mnf: project briefs

A single-page site that maintains briefs and links for the projects we are
working on (and have worked on).

- **Live:** https://acedward.github.io/blog/
- **Published from:** the `main` branch of this repo, via GitHub Pages.
- **Source:** a single `index.html` (plain HTML + inline CSS, no build step).
- **Workflow:** no branches. Commit directly to `main`. Every push to `main` publishes.
- **Last updated:** the page must show a "last updated" timestamp. Update it whenever the content changes.

## Style

- Do not use em dashes. Use commas, colons, parentheses, or separate sentences.

## Structure

The page is organized by **project**. Each project has:

- a **title**
- a short **brief** describing what the project is
- one or more **rows**

Each **row** is a unit of work (a repo, a pull request, or something else),
and can include:

- **links** (e.g., a GitHub PR or issue)
- **tags**: short labels
- **brief**: what we're working on, or the status (e.g., why it isn't merged/published)
- **github repo**
- **live url**: optional; only some rows have one

## Adding a row

- Put the row under the **correct project**. If the project doesn't exist yet,
  add a new project section with its own brief.
- Keep briefs short. A brief may just explain status (e.g., "not merged, POC").
- Update the "last updated" timestamp on the page.
- Commit to `main`; it publishes automatically.

## Example

Project: **Umbra Indexer**
Row: PR #1, "read from the node instead of the indexer" · tags: poc, indexer · not merged (POC)
