# ADR 001: Reuse Strudel Engine Packages

## Status

Accepted

## Decision

Use pinned Strudel packages as the execution and playback engine instead of
forking the stock REPL UI.

## Rationale

- audio parity is easiest when the generated output goes through Strudel's own
  pattern/query runtime
- the demo needs live highlighting semantics aligned with Strudel's mini
  notation activity model
- a custom UI keeps the visible editor Brainfuck-only

