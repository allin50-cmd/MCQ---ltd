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


test("CRM surfaces the governed agent control panel",()=>{
  const html=fs.readFileSync(new URL("../public/crm.html",import.meta.url),"utf8");
  assert.match(html,/TODAY · AGENT CONTROL/);
  assert.match(html,/\/api\/admin\/agents/);
  assert.match(html,/renderAgents/);
  assert.match(html,/MCQ<\/b><span>CONTROL/);
});


test("CRM surfaces agent command centre",()=>{
  const html=fs.readFileSync(new URL("../public/crm.html",import.meta.url),"utf8");
  assert.match(html,/ASK \/ INSTRUCT MCQ AGENTS/);
  assert.match(html,/All Agents/);
  assert.match(html,/RUN AGENTS/);
  assert.match(html,/\/api\/admin\/agents\/command/);
  assert.match(html,/APPROVAL REQUIRED/);
});


test("CRM inline JavaScript is syntactically valid",()=>{
  const html=fs.readFileSync(new URL("../public/crm.html",import.meta.url),"utf8");
  const open=html.indexOf("<script>"),close=html.indexOf("</script>",open);
  assert.ok(open>=0&&close>open,"expected inline CRM script");
  const source=html.slice(open+8,close);
  assert.doesNotThrow(()=>new Function(source));
});


test("CRM lets operators promote qualified hire leads into the existing hire workflow",()=>{
  const html=fs.readFileSync(new URL("../public/crm.html",import.meta.url),"utf8");
  assert.match(html,/QUALIFY INTO HIRE WORKFLOW/);
  assert.match(html,/PROMOTE TO HIRE ENQUIRY/);
  assert.match(html,/\/api\/admin\/crm\/promote-hire/);
  assert.match(html,/Select confirmed equipment/);
  assert.match(html,/does not send a quote, charge the customer or promise availability/i);
});


test("CRM exposes quote delivery only as explicit human action",()=>{
  const html=fs.readFileSync(new URL("../public/crm.html",import.meta.url),"utf8");
  assert.match(html,/REVIEW \+ SEND QUOTE/);
  assert.match(html,/\/api\/quotes\/send/);
  assert.match(html,/This is a real customer email/);
  assert.match(html,/window\.confirm/);
  assert.match(html,/provider receipt/);
});
