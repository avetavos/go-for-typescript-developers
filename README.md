# Go for TypeScript Developers

A bilingual, interactive course that teaches Go to TypeScript developers using a comparison-first approach. Every concept is introduced from the TypeScript perspective first, then mapped to the Go equivalent. All runnable examples execute entirely in the browser — no backend or local Go installation required for reading the course.

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Site framework | [Astro 6](https://astro.build) + [Starlight 0.40](https://starlight.astro.build) |
| UI islands | [Preact](https://preactjs.com) (via `@astrojs/preact`) |
| In-browser Go runner | [yaegi](https://github.com/traefik/yaegi) compiled to WebAssembly (`public/go-runner.wasm`) |
| Unit tests | [Vitest](https://vitest.dev) + `@testing-library/preact` |
| Styling | Starlight default + custom CSS (`src/styles/custom.css`) |
| i18n | Starlight built-in, `defaultLocale: 'en'`, locales: `en` + `th` |

## Commands

Run all commands from the project root.

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:4321
npm run build      # Build production site to ./dist/
npm run preview    # Preview the production build locally
npm test           # Run Vitest unit tests

# Regenerate the WASM Go runner from source (requires Go installed locally).
# The prebuilt artifact (public/go-runner.wasm + public/wasm_exec.js) is committed
# to the repo so normal builds and readers do NOT need Go installed.
npm run build:wasm
```

## Content Structure

Lessons live at:

```
src/content/docs/
  en/              # English content — served at /en/...
    intro/
    go-101/
    go-only/
    concurrency/
    api-echo/
    advanced/
    tooling/
    index.mdx      # EN landing page (splash template)
  th/              # Thai content — served at /th/...
    (same module directories)
    index.mdx      # TH landing page (splash template)
```

### The 7 Modules

| Directory | Module | Topics |
| --------- | ------ | ------ |
| `intro` | Introduction & Setup | Why Go for TS devs, mental-model shifts, toolchain setup |
| `go-101` | Go 101 — Fundamentals | Variables, functions, structs, interfaces, errors, packages |
| `go-only` | Go You Won't Find in TypeScript | Pointers, value semantics, defer/panic/recover, embedding |
| `concurrency` | Concurrency | Goroutines, channels, select, context, sync primitives |
| `api-echo` | Building an API with Echo | Routing, middleware, binding, errors, testing (Express/Nest ↔ Echo) |
| `advanced` | Advanced Go | Generics, reflection, table-driven tests, benchmarks, pprof |
| `tooling` | Tooling, Testing & Deployment | gofmt, go vet, golint, go test, Docker multi-stage, cross-compile, CI |

### Lesson File IDs

Content IDs follow the `<module>/<slug>` convention, e.g. `go-101/variables`. The Starlight sidebar uses `autogenerate: { directory }` per locale root, so new `.mdx` files are picked up automatically.

### 7-Section Lesson Template

Each lesson MDX file follows this structure:

1. **Intro** — one-paragraph framing of the concept
2. **Concept** — prose explanation
3. **TsGo** — `<TsGo ts={...} go={...} />` side-by-side comparison component
4. **Playground** — `<Playground code={...} />` runnable Go snippet (omitted for setup/toolchain lessons)
5. **GoOnly** — `<GoOnly>` callout for Go-specific nuances
6. **Quiz** — `<Quiz questions={...} />` comprehension check
7. **ProgressTracker** — `<ProgressTracker id="module/slug" />` (always last)

Code snippets are hoisted into `export const` template literals and passed to the
components by reference (e.g. `export const fooCode = \`...\`` then `<Playground code={fooCode} />`).

> **⚠️ Escaping gotcha:** inside those backtick template literals, escape
> sequences in your Go/TS code **must be double-backslashed** — write `\\n`, `\\t`,
> etc. A single `\n` is consumed by JS template-literal parsing and becomes a real
> newline *before* the code reaches the renderer, which breaks Go string literals
> ("string literal not terminated"). The line breaks between statements are real
> newlines; only escape sequences *inside* string literals need doubling.

## How Runnable Code Works

The Go runner is a build of [yaegi](https://github.com/traefik/yaegi) — a Go interpreter — compiled to WebAssembly. When a reader clicks "Run" in a `<Playground>`:

1. The browser loads `public/go-runner.wasm` once (cached).
2. The snippet is passed to the WASM module via `public/wasm_exec.js`.
3. Output is captured and displayed inline.

**Coverage:** most of the Go standard library, basic generics, and goroutines with channels. Echo/network snippets and anything requiring real file I/O are not runnable in the browser — these lessons include an "Open in Go Playground" fallback link and a note to run locally.

## Deployment

The site is fully static (`output: 'static'` in `astro.config.mjs`). Build output lands in `dist/`. Deploy to any static host:

- **GitHub Pages** — push `dist/` or use the Astro GitHub Actions workflow
- **Netlify** — set build command `npm run build`, publish dir `dist`
- **Vercel** — static preset, no serverless functions needed
- **Cloudflare Pages** — build command `npm run build`, output `dist`

Before deploying, set the `site` option in `astro.config.mjs` to your production URL to silence the sitemap warning and generate correct canonical URLs:

```js
// astro.config.mjs
export default defineConfig({
  site: 'https://your-domain.com',
  // ...
});
```
