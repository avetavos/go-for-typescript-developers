import { describe, it, expect } from 'vitest';
import { runGo } from '../src/pages/api/run';

describe('runGo', () => {
  it('returns stdout from playground response', async () => {
    const fakeFetch = async () => new Response(JSON.stringify({ Errors: '', Events: [{ Message: 'hi\n', Kind: 'stdout' }] }), { status: 200 });
    const res = await runGo('package main', fakeFetch as unknown as typeof fetch);
    expect(res.output).toBe('hi\n');
    expect(res.errors).toBe('');
  });

  it('surfaces compile errors', async () => {
    const fakeFetch = async () => new Response(JSON.stringify({ Errors: 'boom', Events: [] }), { status: 200 });
    const res = await runGo('bad', fakeFetch as unknown as typeof fetch);
    expect(res.errors).toBe('boom');
  });
});
