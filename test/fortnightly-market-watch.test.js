import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("fortnightly market watch is fail-closed and scheduled",()=>{
  const s=fs.readFileSync(new URL("../scripts/fortnightly-market-watch.mjs",import.meta.url),"utf8");
  const w=fs.readFileSync(new URL("../.github/workflows/fortnightly-market-watch.yml",import.meta.url),"utf8");
  assert.match(s,/not automatic stock truth/i);
  assert.match(s,/PRICE_REVIEW_REQUIRED/);
  assert.match(s,/MCQ trade cost/);
  assert.match(w,/schedule:/);
  assert.match(w,/ISO week/);
  assert.match(w,/gh issue create/);
});
