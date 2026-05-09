declare module "@strudel/core" {
  export const evalScope: (...args: any[]) => Promise<any>;
  export const evaluate: (...args: any[]) => Promise<any>;
}

declare module "@strudel/mini" {
  const miniModule: Record<string, any>;
  export = miniModule;
}

declare module "@strudel/tonal" {
  const tonalModule: Record<string, any>;
  export = tonalModule;
}

declare module "@strudel/transpiler" {
  export const transpiler: (...args: any[]) => any;
}

declare module "@strudel/webaudio" {
  export const getAudioContext: (...args: any[]) => AudioContext;
  export const initAudio: (...args: any[]) => Promise<any>;
  export const initAudioOnFirstClick: (...args: any[]) => Promise<any>;
}

declare module "@strudel/web" {
  export const initStrudel: (...args: any[]) => Promise<any>;
  export const evaluate: (...args: any[]) => Promise<any>;
  export const hush: () => void;
  export const samples: (...args: any[]) => Promise<any>;
}
