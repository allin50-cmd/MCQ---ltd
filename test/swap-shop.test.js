import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Swap Shop preserves MCQ buying brief without invented valuations",()=>{
  const html=fs.readFileSync(new URL("../public/swap.html",import.meta.url),"utf8");
  assert.match(html,/original Technics 1210/i);
  assert.match(html,/working, non-working, damaged, incomplete or needing repair/i);
  assert.match(html,/Apple Silicon Macs M1–M6/i);
  assert.match(html,/RTX 3090-class and newer/i);
  assert.match(html,/high-spec network equipment/i);
  assert.match(html,/No automatic valuation is promised/i);
});
