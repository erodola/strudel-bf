import { describe, expect, it, vi } from "vitest";

async function waitForCall(spy: ReturnType<typeof vi.fn>): Promise<void> {
  const deadline = Date.now() + 1_000;
  while (spy.mock.calls.length === 0 && Date.now() < deadline) {
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });
  }
}

describe("playback initialization", () => {
  it("waits for primed audio readiness before resolving runtime init", async () => {
    vi.resetModules();

    let resolveAudioReady!: () => void;
    const audioReady = new Promise<void>((resolve) => {
      resolveAudioReady = resolve;
    });
    const initAudioOnFirstClick = vi.fn(() => audioReady);
    const initStrudel = vi.fn(async () => ({
      scheduler: {
        now: () => 0,
      },
    }));
    const playablePattern = {
      queryArc: vi.fn(() => []),
    };
    const samples = vi.fn(async () => undefined);

    vi.doMock("@strudel/webaudio", () => ({
      initAudioOnFirstClick,
    }));

    vi.doMock("@strudel/web", () => ({
      evaluate: vi.fn(async () => playablePattern),
      hush: vi.fn(),
      initStrudel,
      samples,
    }));

    const { initPlaybackRuntime, primePlaybackAudio } = await import(
      "../src/engine.js"
    );

    await primePlaybackAudio();

    let settled = false;
    const runtimePromise = initPlaybackRuntime().then((runtime) => {
      settled = true;
      return runtime;
    });

    await waitForCall(initStrudel);

    expect(initAudioOnFirstClick).toHaveBeenCalledTimes(1);
    expect(initStrudel).toHaveBeenCalledTimes(1);
    expect(settled).toBe(false);

    resolveAudioReady();

    await expect(runtimePromise).resolves.toMatchObject({
      scheduler: {
        now: expect.any(Function),
      },
    });
  });
});
