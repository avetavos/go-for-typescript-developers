import type { APIRoute } from 'astro';

export const prerender = false;

type RunResult = { output: string; errors: string };

export async function runGo(source: string, fetchImpl: typeof fetch = fetch): Promise<RunResult> {
  const body = new URLSearchParams({ version: '2', body: source, withVet: 'true' });
  const r = await fetchImpl('https://play.golang.org/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = (await r.json()) as { Errors: string; Events: { Message: string; Kind: string }[] };
  const output = (data.Events || []).map((e) => e.Message).join('');
  return { output, errors: data.Errors || '' };
}

export const POST: APIRoute = async ({ request }) => {
  const { source } = (await request.json()) as { source: string };
  if (!source || source.length > 60_000) {
    return new Response(JSON.stringify({ errors: 'invalid source' }), { status: 400 });
  }
  try {
    const res = await runGo(source);
    return new Response(JSON.stringify(res), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ output: '', errors: 'run service unavailable' }), { status: 502 });
  }
};
