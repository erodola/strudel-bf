import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const sampleRate = 22_050;
const outputDir = resolve(
  process.cwd(),
  "apps/web/public/samples/demo-tr909",
);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function envelope(length, decaySeconds) {
  return Array.from({ length }, (_, index) =>
    Math.exp((-index / sampleRate) / decaySeconds),
  );
}

function makeKick() {
  const durationSeconds = 0.45;
  const length = Math.floor(sampleRate * durationSeconds);
  const env = envelope(length, 0.12);
  const data = new Float32Array(length);

  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    const freq = 120 * Math.exp(-t * 18) + 36;
    const phase = 2 * Math.PI * freq * t;
    const body = Math.sin(phase) * env[index];
    const click = index < 180 ? (1 - index / 180) * 0.35 : 0;
    data[index] = clamp((body * 0.95) + click, -1, 1);
  }

  return data;
}

function makeNoiseHat(decaySeconds) {
  const durationSeconds = Math.max(decaySeconds * 5, 0.12);
  const length = Math.floor(sampleRate * durationSeconds);
  const env = envelope(length, decaySeconds);
  const data = new Float32Array(length);
  let last = 0;

  for (let index = 0; index < length; index += 1) {
    const white = (Math.random() * 2) - 1;
    const highPassed = white - (last * 0.92);
    last = white;
    data[index] = clamp(highPassed * env[index] * 0.6, -1, 1);
  }

  return data;
}

function encodeWav(channelData) {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataLength = channelData.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset, value) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  for (let index = 0; index < channelData.length; index += 1) {
    const sample = clamp(channelData[index], -1, 1);
    view.setInt16(
      44 + (index * 2),
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true,
    );
  }

  return Buffer.from(buffer);
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const files = [
    ["bd.wav", makeKick()],
    ["hh.wav", makeNoiseHat(0.025)],
    ["oh.wav", makeNoiseHat(0.18)],
  ];

  await Promise.all(
    files.map(([name, data]) =>
      writeFile(resolve(outputDir, name), encodeWav(data)),
    ),
  );
}

await main();
