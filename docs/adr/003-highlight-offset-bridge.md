# ADR 003: Translate Active Strudel Offsets Back To Brainfuck

## Status

Accepted

## Decision

Maintain three source-map layers:

- BF execution output to Brainfuck provenance
- IR fields to output slices
- canonical Strudel render offsets to IR slices

## Rationale

This preserves Strudel's runtime/highlight model while letting the UI decorate
Brainfuck source ranges rather than generated Strudel code.

