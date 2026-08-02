## graphify

This project has a knowledge graph at the **workspace root** `graphify-out/` (i.e. `<repo>/graphify-out/`, next to `idreesia-web/`, `idreesia-common/`, etc.) with god nodes, community structure, and cross-file relationships.

Rules:
- Always use and update **only** the workspace-root `graphify-out/`. Run all `graphify` commands from the repository root (the directory that contains `CLAUDE.md` and the root `graphify-out/`), never from `idreesia-web/`, `idreesia-mobile/`, or other subpackages.
- Never create, write, or refresh a nested `graphify-out/` under a Meteor app or other subdirectory — that breaks Meteor (`graph.html` DOCTYPE) and duplicates the monorepo graph. If a nested copy appears, delete it and continue using the root graph.
- For codebase questions, first run `graphify query "<question>"` when `graphify-out/graph.json` exists at the repo root. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If `graphify-out/wiki/index.md` exists at the repo root, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, from the **repository root** run `graphify update .` to keep the root graph current (AST-only, no API cost).
