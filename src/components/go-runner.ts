export type RunResult = { output: string; errors: string };
type Runner = (source: string) => RunResult;

// Same-origin Cloudflare Pages Function (tools/functions/api/go-compile.ts in learn-hub)
// that proxies the official go.dev playground compiler — real, current Go (1.27).
const REMOTE_COMPILE = '/api/go-compile';
const REMOTE_TIMEOUT_MS = 20_000;

let loadPromise: Promise<void> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var goRunWasm: Runner | undefined;
  // eslint-disable-next-line no-var
  var Go: { new (): { importObject: WebAssembly.Imports; run(i: WebAssembly.Instance): void } } | undefined;
}

type PlaygroundResponse = {
  Errors: string;
  Events: { Message: string; Kind: string; Delay: number }[] | null;
  VetErrors?: string;
};

async function runRemote(source: string): Promise<RunResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REMOTE_TIMEOUT_MS);
  try {
    const res = await fetch(REMOTE_COMPILE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: source }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`remote compile failed: ${res.status}`);
    const data = (await res.json()) as PlaygroundResponse;
    return {
      output: (data.Events ?? []).map((e) => e.Message).join(''),
      errors: data.Errors ?? '',
    };
  } finally {
    clearTimeout(timer);
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = () => resolve(); s.onerror = () => reject(new Error('failed to load ' + src));
    document.head.appendChild(s);
  });
}

// Offline fallback: yaegi interpreter compiled to wasm (Go 1.26 stdlib; no 1.27-only syntax).
export function loadRuntime(): Promise<void> {
  if (typeof globalThis.goRunWasm === 'function') return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
    const wasmUrl = 'https://github.com/avetavos/go-for-typescript-developers/releases/download/v1.0.0/go-runner.wasm';
    await loadScript(`${base}wasm_exec.js`);
    const go = new globalThis.Go!();
    let instance: WebAssembly.Instance;
    try {
      const result = await WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject);
      instance = result.instance;
    } catch {
      // fallback for redirects or non-application/wasm MIME responses
      const bytes = await (await fetch(wasmUrl)).arrayBuffer();
      const result = await WebAssembly.instantiate(bytes, go.importObject);
      instance = result.instance;
    }
    go.run(instance); // sets globalThis.goRunWasm, then blocks on select{}
  })();
  return loadPromise;
}

export async function runGo(source: string, opts: { skipLoad?: boolean } = {}): Promise<RunResult> {
  try {
    return await runRemote(source);
  } catch {
    // go.dev unreachable (offline, dev server, timeout) — use the in-browser interpreter
  }
  if (!opts.skipLoad) {
    try { await loadRuntime(); }
    catch { return { output: '', errors: 'Failed to load Go runtime — try "Open in Go Playground".' }; }
  }
  const fn = globalThis.goRunWasm;
  if (typeof fn !== 'function') return { output: '', errors: 'Go runtime unavailable.' };
  return fn(source);
}
