import test from "node:test";
import assert from "node:assert/strict";
import {intelligenceStatus,enrichAgentCommand} from "../src/intelligence.js";

test("intelligence adapter fails closed to deterministic when provider key is absent",async()=>{
  const old=process.env.DEEPSEEK_API_KEY;delete process.env.DEEPSEEK_API_KEY;
  const base={instruction:"status",requested_agent:"manager",responses:[],status:"COMPLETED",approval_required:false};
  const out=await enrichAgentCommand(base);
  assert.equal(out.intelligence.provider,"deterministic");
  assert.equal(out.intelligence.configured,false);
  if(old)process.env.DEEPSEEK_API_KEY=old;
});

test("intelligence cannot replace deterministic approval state",async()=>{
  const old=process.env.DEEPSEEK_API_KEY;delete process.env.DEEPSEEK_API_KEY;
  const base={instruction:"purchase stock",requested_agent:"purchasing",responses:[],status:"APPROVAL REQUIRED",approval_required:true,executed_restricted_action:false};
  const out=await enrichAgentCommand(base);
  assert.equal(out.status,"APPROVAL REQUIRED");
  assert.equal(out.approval_required,true);
  assert.equal(out.executed_restricted_action,false);
  if(old)process.env.DEEPSEEK_API_KEY=old;
});
