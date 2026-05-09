import * as core from "@strudel/core";
import * as mini from "@strudel/mini";
import * as tonal from "@strudel/tonal";
import { evalScope, evaluate as evaluateCore } from "@strudel/core";
import { transpiler } from "@strudel/transpiler";

import { normalizeHaps } from "./scheduler-hooks.js";
import { sanitizePlayableCode } from "./reference.js";

let scopeReady: Promise<unknown> | null = null;
let runtimeReady: Promise<unknown> | null = null;
let audioReady: Promise<unknown> | null = null;
let webModulePromise: Promise<typeof import("@strudel/web")> | null = null;
let webaudioModulePromise: Promise<typeof import("@strudel/webaudio")> | null =
  null;

type PlaybackSampleConfig = {
  baseUrl: string;
  sampleMap: Record<string, string[]>;
};

let playbackSampleConfig: PlaybackSampleConfig = {
  baseUrl: "/samples/demo-tr909/",
  sampleMap: {
    tr909_bd: ["bd.wav"],
    tr909_hh: ["hh.wav"],
    tr909_oh: ["oh.wav"],
  },
};

export type CompiledStrudelPattern = {
  pattern: any;
  miniLocations: Array<[number, number]>;
};

export async function ensureStrudelScope(): Promise<void> {
  if (!scopeReady) {
    scopeReady = evalScope(core, mini, tonal).then(() => undefined);
  }
  await scopeReady;
}

export async function compileStrudelPattern(
  code: string,
): Promise<CompiledStrudelPattern> {
  await ensureStrudelScope();
  const result = await evaluateCore(sanitizePlayableCode(code), transpiler, {
    emitMiniLocations: true,
  });
  return {
    pattern: result.pattern,
    miniLocations: result.meta?.miniLocations ?? [],
  };
}

export async function collectNormalizedHaps(
  code: string,
  cycles: number,
): Promise<ReturnType<typeof normalizeHaps>> {
  const compiled = await compileStrudelPattern(code);
  return normalizeHaps(compiled.pattern.queryArc(0, cycles));
}

async function getWebModule(): Promise<typeof import("@strudel/web")> {
  if (!webModulePromise) {
    webModulePromise = import("@strudel/web");
  }
  return webModulePromise;
}

async function getWebaudioModule(): Promise<typeof import("@strudel/webaudio")> {
  if (!webaudioModulePromise) {
    webaudioModulePromise = import("@strudel/webaudio");
  }
  return webaudioModulePromise;
}

export async function primePlaybackAudio(): Promise<void> {
  const { initAudioOnFirstClick } = await getWebaudioModule();
  if (!audioReady) {
    audioReady = initAudioOnFirstClick();
  }
}

export function setPlaybackSampleMapSource(config: PlaybackSampleConfig): void {
  playbackSampleConfig = config;
}

export async function initPlaybackRuntime(): Promise<any> {
  const { initStrudel, samples } = await getWebModule();

  if (!runtimeReady) {
    runtimeReady = initStrudel({
      prebake: async () => {
        await samples(playbackSampleConfig.sampleMap, playbackSampleConfig.baseUrl);
      },
    });
  }
  if (audioReady) {
    await audioReady;
  }
  return runtimeReady;
}

export async function playStrudelCode(code: string): Promise<any> {
  await initPlaybackRuntime();
  const { evaluate } = await getWebModule();
  return evaluate(sanitizePlayableCode(code), true);
}

export async function getPlaybackCycleNow(): Promise<number> {
  const runtime = await initPlaybackRuntime();
  return runtime.scheduler.now();
}

export function stopPlayback(): void {
  void webModulePromise?.then(({ hush }) => hush());
}
