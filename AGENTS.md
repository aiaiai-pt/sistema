# AGENTS.md

Read [`CLAUDE.md`](CLAUDE.md) in full before changing this repository. It is the
canonical contributor steering.

For renderer, widget, theme or Atelier-related work, also read
[`dev_docs/adl/widget-system-extraction-boundary.md`](dev_docs/adl/widget-system-extraction-boundary.md)
and the live programme issues #49 and #65. Preserve the one-way boundary:
Sistema design system → generic widget system → Atelier platform → hosts. Do
not classify code solely from its current `components/renderer/` location, and
do not move Atelier or host semantics into Sistema or widget-system.
