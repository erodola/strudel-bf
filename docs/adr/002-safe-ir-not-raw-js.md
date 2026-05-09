# ADR 002: Compile Brainfuck Into Safe Music IR

## Status

Accepted

## Decision

Brainfuck programs compile into a versioned, validated music IR instead of
directly emitting executable JavaScript or arbitrary Strudel source.

## Rationale

- stable canonical rendering is required for deterministic source maps
- typed IR is easier to test and extend
- it prevents the demo from degenerating into arbitrary user JS execution

