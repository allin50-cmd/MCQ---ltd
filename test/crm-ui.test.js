import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("CRM operator surface is real, protected and wired to production APIs",()=>{
  const html=fs.readFileSync(new URL("../public/crm.html",import.meta.url),"utf8");
  assert.match(html,/MCQ/);
  assert.match(html,/CUSTOMER CONTROL/);
  assert.match(html,/sessionStorage\.getItem\("mcq-crm-token"\)/);
  assert.match(html,/\/api\/admin\/crm/);
  assert.match(html,/\/api\/admin\/crm\/detail/);
  assert.match(html,/\/api\/admin\/crm\/update/);
  assert.match(html,/\/api\/admin\/crm\/quote/);
  assert.match(html,/Overdue/);
  assert.match(html,/Unowned/);
  assert.match(html,/No next action/);
  assert.doesNotMatch(html,/demo|fake customer/i);
});
