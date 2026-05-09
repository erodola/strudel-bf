import { useEffect, useMemo, useRef, useState } from "react";

import { Compartment } from "@codemirror/state";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import {
  executeBrainfuck,
} from "@strudel-bf/bf-core";
import {
  brainfuckEditorTheme,
  createActiveRangeExtension,
  createBrainfuckLinter,
} from "@strudel-bf/editor-bf";
import {
  decodeBrainfuckMusicOutput,
  extractMiniTokenSources,
  type MiniTokenSource,
  renderProgramToStrudel,
} from "@strudel-bf/music-compiler";
import { rangeUnion } from "@strudel-bf/shared";
import {
  collectActiveSampleNames,
  getPlaybackCycleNow,
  playStrudelCode,
  primePlaybackAudio,
  setPlaybackSampleMapSource,
  stopPlayback,
} from "@strudel-bf/strudel-runtime";

import defaultBrainfuckSource from "../../../fixtures/landing-page-demo.bf?raw";

type CompilationState = {
  bfOutput: string;
  renderedCode: string;
  playableCode?: string;
  tokenSources: MiniTokenSource[];
  upstreamSourceUrl?: string;
};

const MOCK_DRIVER_QUERY = "mock";
const STRUDEL_URL_PREFIX = "strudel_url=";
const STRANGER_THINGS_AUTHOR = "eefano";
const STRANGER_THINGS_REPO_URL =
  "https://github.com/eefano/strudel-songs-collection";
const STRANGER_THINGS_SOURCE_URL =
  "https://raw.githubusercontent.com/eefano/strudel-songs-collection/a32abf733a4cab967f30eacb4bcecd596c3e2609/strangerthings.js";
const STRANGER_THINGS_SOURCE_PAGE =
  "https://github.com/eefano/strudel-songs-collection/blob/a32abf733a4cab967f30eacb4bcecd596c3e2609/strangerthings.js";

async function fetchUpstreamStrudelSource(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch upstream Strudel source: ${response.status}`);
  }
  return response.text();
}

function stripTrailingSemicolon(source: string): string {
  return source.trim().replace(/;\s*$/u, "");
}

function convertLabelledPatternsToStack(source: string): string {
  const lines = source.split(/\r?\n/u);
  const prelude: string[] = [];
  const patterns: string[] = [];
  let currentPattern: string[] | null = null;

  for (const line of lines) {
    const labelMatch = line.match(/^\s*[A-Za-z]\w*\s*:\s*(.*)$/u);
    if (labelMatch) {
      if (currentPattern) {
        patterns.push(stripTrailingSemicolon(currentPattern.join("\n")));
      }
      currentPattern = [labelMatch[1] ?? ""];
      continue;
    }

    if (currentPattern) {
      currentPattern.push(line);
    } else {
      prelude.push(line);
    }
  }

  if (currentPattern) {
    patterns.push(stripTrailingSemicolon(currentPattern.join("\n")));
  }

  if (patterns.length === 0) {
    return source.trim();
  }

  return `${prelude.join("\n").trim()}\n\nstack(\n${patterns.join(",\n")}\n)`.trim();
}

async function compileSource(source: string): Promise<CompilationState> {
  const execution = executeBrainfuck(source);
  const loaderUrl = execution.output
    .split(/\r?\n/u)
    .find((line) => line.startsWith(STRUDEL_URL_PREFIX))
    ?.slice(STRUDEL_URL_PREFIX.length)
    .trim();

  if (loaderUrl) {
    const renderedCode = (await fetchUpstreamStrudelSource(loaderUrl)).trim();
    return {
      bfOutput: execution.output,
      renderedCode,
      playableCode: convertLabelledPatternsToStack(renderedCode),
      upstreamSourceUrl: loaderUrl,
      tokenSources: [],
    };
  }

  const program = decodeBrainfuckMusicOutput(
    execution.output,
    execution.outputEvents,
  );
  const voice = program.voices[0];
  if (!voice) {
    throw new Error("Decoded program did not contain a sample voice");
  }
  const rendered = renderProgramToStrudel(program);

  return {
    bfOutput: execution.output,
    renderedCode: rendered.code,
    tokenSources: extractMiniTokenSources(voice.mini),
  };
}

export function App() {
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const activeRangesCompartment = useMemo(() => new Compartment(), []);
  const lintCompartment = useMemo(() => new Compartment(), []);
  const playbackPatternRef = useRef<any>(null);
  const tickTimerRef = useRef<number | null>(null);
  const isMockDriver = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      new URLSearchParams(window.location.search).get("driver") ===
      MOCK_DRIVER_QUERY
    );
  }, []);

  const [source, setSource] = useState(defaultBrainfuckSource);
  const [compilation, setCompilation] = useState<CompilationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeRanges, setActiveRanges] = useState<ReadonlyArray<{ start: number; end: number }>>([]);
  const [activeTokens, setActiveTokens] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    setPlaybackSampleMapSource(
      {
        baseUrl: `${import.meta.env.BASE_URL}samples/demo-tr909/`,
        sampleMap: {
          tr909_bd: ["bd.wav"],
          tr909_hh: ["hh.wav"],
          tr909_oh: ["oh.wav"],
        },
      },
    );
    void primePlaybackAudio().catch((primeError) => {
      setError((primeError as Error).message);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsCompiling(true);
    compileSource(defaultBrainfuckSource)
      .then((nextCompilation) => {
        if (!cancelled) {
          setCompilation(nextCompilation);
          setError(null);
        }
      })
      .catch((compileError) => {
        if (!cancelled) {
          setError((compileError as Error).message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsCompiling(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const view = editorRef.current?.view;
    if (!view) {
      return;
    }
    view.dispatch({
      effects: activeRangesCompartment.reconfigure(
        createActiveRangeExtension(activeRanges),
      ),
    });
  }, [activeRanges, activeRangesCompartment]);

  useEffect(() => {
    return () => {
      if (tickTimerRef.current !== null) {
        window.clearInterval(tickTimerRef.current);
      }
      stopPlayback();
    };
  }, []);

  const extensions = useMemo(
    () => [
      brainfuckEditorTheme,
      lintCompartment.of(createBrainfuckLinter()),
      activeRangesCompartment.of(createActiveRangeExtension([])),
    ],
    [activeRangesCompartment, lintCompartment],
  );

  const handleEvaluate = async () => {
    setIsCompiling(true);
    try {
      const nextCompilation = await compileSource(source);
      setCompilation(nextCompilation);
      setError(null);
    } catch (compileError) {
      setError((compileError as Error).message);
    } finally {
      setIsCompiling(false);
    }
  };

  const stopTicking = () => {
    if (tickTimerRef.current !== null) {
      window.clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  };

  const handleStop = () => {
    stopTicking();
    playbackPatternRef.current = null;
    setIsPlaying(false);
    setActiveRanges([]);
    setActiveTokens([]);
    stopPlayback();
  };

  const handlePlay = async () => {
    try {
      setIsCompiling(true);
      const nextCompilation = await compileSource(source);
      setCompilation(nextCompilation);
      setError(null);
      setIsCompiling(false);

      if (isMockDriver) {
        const tokens = nextCompilation.tokenSources.map((sourceToken) => sourceToken.token);
        let index = 0;

        if (tokens.length === 0) {
          playbackPatternRef.current = { driver: MOCK_DRIVER_QUERY };
          setIsPlaying(true);
          setActiveTokens([]);
          setActiveRanges([]);
          return;
        }

        playbackPatternRef.current = { driver: MOCK_DRIVER_QUERY };
        setIsPlaying(true);
        stopTicking();
        tickTimerRef.current = window.setInterval(() => {
          const token = tokens[index % tokens.length];
          if (!token) {
            return;
          }
          index += 1;
          setActiveTokens([token]);
          setActiveRanges(
            rangeUnion(
              ...nextCompilation.tokenSources
                .filter((sourceToken) => sourceToken.token === token)
                .map((sourceToken) => sourceToken.bfRanges),
            ),
          );
        }, 120);
        return;
      }

      const pattern = await playStrudelCode(
        nextCompilation.playableCode ?? nextCompilation.renderedCode,
      );
      playbackPatternRef.current = pattern;
      setIsPlaying(true);

      stopTicking();
      tickTimerRef.current = window.setInterval(async () => {
        if (!playbackPatternRef.current) {
          return;
        }

        const now = await getPlaybackCycleNow();
        const haps = playbackPatternRef.current.queryArc(now, now + 1 / 32);
        const activeSampleNames = collectActiveSampleNames(
          haps.map((hap: any) => ({
            whole: [hap.whole?.begin?.toFraction?.() ?? null, hap.whole?.end?.toFraction?.() ?? null],
            part: [hap.part?.begin?.toFraction?.() ?? null, hap.part?.end?.toFraction?.() ?? null],
            value: { ...(hap.value ?? {}) },
          })),
        );

        setActiveTokens(activeSampleNames);
        setActiveRanges(
          rangeUnion(
            ...nextCompilation.tokenSources
              .filter((sourceToken) => activeSampleNames.includes(sourceToken.token))
              .map((sourceToken) => sourceToken.bfRanges),
          ),
        );
      }, 80);
    } catch (playError) {
      setIsCompiling(false);
      setError((playError as Error).message);
      handleStop();
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Brainfuck First Live Coding</p>
          <h1>Strudel Brainf*ck REPL</h1>
          <p className="subtitle">
            The{" "}
            <a href="https://strudel.cc/" target="_blank" rel="noreferrer">
              Strudel REPL
            </a>{" "}
            with an extremely unnecessary{" "}
            <a
              href="https://brainfuck.org/"
              target="_blank"
              rel="noreferrer"
            >
              Brainfuck
            </a>{" "}
            layer on top, because writing the groove directly would be too easy.
            This branch plays{" "}
            <a href={STRANGER_THINGS_SOURCE_PAGE} target="_blank" rel="noreferrer">
              eefano&apos;s Stranger Things Strudel cover
            </a>{" "}
            from its upstream source URL.
          </p>
        </div>
        <div className="hero-actions">
          <button className="button button-ghost" onClick={handleEvaluate}>
            {isCompiling ? "Fetching" : "Evaluate"}
          </button>
          <button className="button button-primary" onClick={handlePlay}>
            {isPlaying ? "Replay" : "Play"}
          </button>
          <button className="button button-ghost" onClick={handleStop}>
            Stop
          </button>
        </div>
      </header>

      <main className="workspace">
        <section className="panel panel-editor">
          <div className="panel-header">
            <h2>Brainfuck Source</h2>
            <span className="status-chip" data-testid="live-status">
              {isPlaying ? "Live" : isCompiling ? "Fetching" : "Idle"}
            </span>
          </div>
          <CodeMirror
            ref={editorRef}
            value={source}
            height="100%"
            basicSetup={{
              foldGutter: false,
              lineNumbers: true,
            }}
            extensions={extensions}
            onChange={setSource}
          />
        </section>

        <section className="panel panel-inspector">
          <div className="panel-header">
            <h2>Compiler + Runtime</h2>
            <span className="status-chip">{activeTokens.join(", ") || "No active tokens"}</span>
          </div>

          {error ? <div className="error-box">{error}</div> : null}

          <div className="stack">
            <article className="card">
              <h3>Decoded BF Output</h3>
              <pre data-testid="decoded-bf-output">{compilation?.bfOutput ?? ""}</pre>
            </article>

            <article className="card">
              <h3>Upstream Strudel</h3>
              <pre data-testid="canonical-strudel">
                {compilation?.renderedCode ?? ""}
              </pre>
            </article>

            {compilation?.playableCode &&
            compilation.playableCode !== compilation.renderedCode ? (
              <article className="card">
                <h3>Playback Form</h3>
                <pre>{compilation.playableCode}</pre>
              </article>
            ) : null}

            {compilation?.upstreamSourceUrl ? (
              <article className="card">
                <h3>Song Credit</h3>
                <p>
                  Stranger Things Strudel cover by{" "}
                  <a href={STRANGER_THINGS_REPO_URL} target="_blank" rel="noreferrer">
                    {STRANGER_THINGS_AUTHOR}
                  </a>
                  . Source fetched from{" "}
                  <a href={STRANGER_THINGS_SOURCE_PAGE} target="_blank" rel="noreferrer">
                    strudel-songs-collection/strangerthings.js
                  </a>
                  .
                </p>
              </article>
            ) : null}

            <article className="card">
              <h3>Active Brainfuck Tokens</h3>
              <div className="token-list">
                {compilation?.tokenSources.map((sourceToken) => {
                  const active = activeTokens.includes(sourceToken.token);
                  return (
                    <span
                      key={`${sourceToken.token}-${sourceToken.miniRange.start}`}
                      data-testid="token-chip"
                      className={active ? "token token-active" : "token"}
                    >
                      {sourceToken.token}
                    </span>
                  );
                })}
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="legal-footer">
        <p>
          Source available under{" "}
          <a href="https://github.com/erodola/strudel-bf/blob/main/LICENSE">
            AGPL-3.0-only
          </a>
          . No warranty.
        </p>
        <p>
          Built on{" "}
          <a href="https://strudel.cc/">Strudel</a>,{" "}
          <a href="https://codemirror.net/">CodeMirror</a>, and{" "}
          <a href="https://react.dev/">React</a>. Third-party notices:{" "}
          <a href="https://github.com/erodola/strudel-bf/blob/main/THIRD_PARTY_NOTICES.md">
            THIRD_PARTY_NOTICES.md
          </a>
          .
        </p>
        <p>
          Stranger Things Strudel cover by{" "}
          <a href={STRANGER_THINGS_REPO_URL}>eefano</a>; this branch fetches the
          song source from upstream at runtime instead of vendoring unlicensed
          third-party song code.
        </p>
        <p>
          Source repository:{" "}
          <a href="https://github.com/erodola/strudel-bf">
            github.com/erodola/strudel-bf
          </a>
        </p>
      </footer>
    </div>
  );
}
