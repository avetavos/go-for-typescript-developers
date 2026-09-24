// Verify every EN playground snippet compiles, vets clean, and runs.
// Usage: node tools/verify-playgrounds.mjs [pathFilter]
// Snippets needing Go 1.27 are skipped locally — run them on go.dev instead:
//   curl -s -X POST https://go.dev/_/compile --data-urlencode version=2 \
//     --data-urlencode withVet=true --data-urlencode "body@main.go"
//
// Adapted from go-deep-dive's harness of the same name: this course is a
// TypeScript<->Go comparison course, so most `export const xxxCode` literals
// are <TsGo ts={..} go={..}> side-by-side fragments (often TypeScript, or a
// partial Go snippet with no `package main`) that were never meant to run
// standalone. Only literals passed to <Playground code={...}> are complete,
// runnable `package main` programs — those are named `playground*` by
// convention (checked: every <Playground code={NAME}> in this repo has NAME
// starting with "playground"). So, unlike go-deep-dive, we filter to that
// prefix instead of testing every `*Code` export. The literal-extraction
// below is also escape-aware (tracks `\` inside the backtick string) so a
// literal containing an escaped nested backtick (e.g. a Go raw string) can't
// prematurely truncate the match.
import { readFileSync, mkdirSync, writeFileSync, globSync } from 'node:fs';
import { execSync } from 'node:child_process';

// Snippets are built inside a module declaring the course's target Go version,
// so the toolchain switches to 1.27 even when the default install is older.
const GO_DIRECTIVE = '1.27';
// Snippets needing an opt-in experiment, mapped to the env that enables them.
const EXPERIMENT = { jsonV2Code: 'GOEXPERIMENT=jsonv2 ' };
const filter = process.argv[2] ?? '';
const files = globSync('src/content/docs/en/**/*.mdx').filter((f) => f.includes(filter));

function extractLiterals(src) {
  const out = [];
  const re = /export const (\w+) = `/g;
  let m;
  while ((m = re.exec(src))) {
    let i = re.lastIndex;
    const start = i;
    while (i < src.length) {
      if (src[i] === '\\') { i += 2; continue; }
      if (src[i] === '`') break;
      i++;
    }
    out.push({ name: m[1], body: src.slice(start, i) });
    re.lastIndex = i + 1;
  }
  return out;
}

let fail = 0;
let n = 0;
for (const f of files.sort()) {
  const src = readFileSync(f, 'utf8');
  for (const { name, body } of extractLiterals(src)) {
    if (!/^playground/i.test(name)) continue;
    n++;
    const code = Function('return `' + body + '`')();
    const dir = `.verify/${f.replace(/[\/.]/g, '_')}_${name}`;
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/main.go`, code);
    writeFileSync(`${dir}/go.mod`, `module playground\n\ngo ${GO_DIRECTIVE}\n`);
    const env = EXPERIMENT[name] ?? '';
    try {
      const out = execSync(`cd ${dir} && ${env}go vet . && ${env}go run .`, {
        stdio: 'pipe',
        timeout: 30000,
      });
      console.log(`OK   ${f} ${name}\n--- stdout ---\n${out.toString()}--------------`);
    } catch (e) {
      fail++;
      console.log(`FAIL ${f} ${name}\n${String(e.stderr).slice(0, 400)}`);
    }
  }
}
console.log(`${n} playgrounds, ${fail} failed`);
process.exit(fail ? 1 : 0);
