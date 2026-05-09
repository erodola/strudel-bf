# ADR 004: Pin Runtime Versions And Ship Demo Assets

## Status

Accepted

## Decision

Pin exact Strudel package versions and ship the generated demo WAV assets
required for deterministic local playback and tests.

## Initial Pins

- `@strudel/web@1.3.0`
- `@strudel/core@1.2.6`
- `@strudel/mini@1.2.6`
- `@strudel/transpiler@1.2.6`
- `@strudel/webaudio@1.3.0`

## Rationale

- upstream changes should not silently alter parity or highlighting behavior
- demo audio should work after cloning without depending on external sample
  repositories
