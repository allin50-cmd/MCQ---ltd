import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("production server binds before durable state warmup and exposes explicit readiness",()=>{
  const source=fs.readFileSync(new URL("../src/server.js",import.meta.url),"utf8");
  const boot=source.indexOf("server.listen(port");
  const warm=source.indexOf("load()\n      .then",boot);
  assert.ok(boot>0,"production listen call missing");
  assert.ok(warm>boot,"durable warmup must occur after the port is bound");
  assert.match(source,/u\.pathname===["']\/ready["']/);
  assert.match(source,/MCQ operational state is temporarily unavailable/);
  assert.doesNotMatch(source,/if\(process\.env\.NODE_ENV!==["']test["']\)\{\s*await load\(\)/);
});

test("local JSON is limited to test, explicit local mode, or explicit one-time migration",()=>{
  const source=fs.readFileSync(new URL("../src/store.js",import.meta.url),"utf8");
  assert.match(source,/process\.env\.NODE_ENV===["']test["']\|\|process\.env\.MCQ_STATE_MODE===["']local["']/);
  assert.match(source,/e\.status===404&&mode===["']migrate["']/);
  assert.match(source,/const mode=process\.env\.MCQ_STATE_MODE\|\|["']durable["']/);
  assert.match(source,/throw e;/);
  assert.doesNotMatch(source,/mode===["']durable["'][^}]*localLoad/s);
});
