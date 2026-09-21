import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("production server binds before durable AgentX warmup",()=>{
  const source=fs.readFileSync(new URL("../src/server.js",import.meta.url),"utf8");
  const boot=source.indexOf("server.listen(port");
  const warm=source.indexOf("load()\n      .then",boot);
  assert.ok(boot>0,"production listen call missing");
  assert.ok(warm>boot,"durable warmup must happen after port bind");
  assert.doesNotMatch(source,/if\(process\.env\.NODE_ENV!==\"test\"\)\{\s*await load\(\)/);
});

test("health is evaluated before durable state load and readiness is explicit",()=>{
  const source=fs.readFileSync(new URL("../src/server.js",import.meta.url),"utf8");
  const handler=source.indexOf("const server=http.createServer");
  const health=source.indexOf('u.pathname==="/health"',handler);
  const load=source.indexOf("db=await load()",handler);
  const ready=source.indexOf('u.pathname==="/ready"',handler);
  assert.ok(health>handler && health<load,"health must not depend on AgentX state");
  assert.ok(ready>health && ready<load,"readiness must explicitly test AgentX state");
  assert.match(source,/return json\(res,503,\{error:\"MCQ operational state is temporarily unavailable\"\}\)/);
});
