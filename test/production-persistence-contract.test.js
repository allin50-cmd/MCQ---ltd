import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("production server awaits durable state before listening",()=>{
  const source=fs.readFileSync(new URL("../src/server.js",import.meta.url),"utf8");
  assert.match(source,/if\(process\.env\.NODE_ENV!==["']test["']\)\{\s*await load\(\);\s*server\.listen/);
});

test("production store never silently falls back to local JSON",()=>{
  const source=fs.readFileSync(new URL("../src/store.js",import.meta.url),"utf8");
  assert.match(source,/process\.env\.NODE_ENV===["']test["']\|\|process\.env\.MCQ_STATE_MODE===["']local["']/);
  assert.match(source,/throw e;/);
  assert.doesNotMatch(source,/catch\([^)]*\).*localLoad\(\).*return/s);
});
