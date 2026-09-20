import test from "node:test";
import assert from "node:assert/strict";
import {intelligenceStatus,enrichAgentCommand} from "../src/intelligence.js";

test("AgentX intelligence gateway fails closed when operator credential is absent",async()=>{
  const old=process.env.AGENTX_OPERATOR_TOKEN;delete process.env.AGENTX_OPERATOR_TOKEN;
  const base={instruction:"status",requested_agent:"manager",responses:[],status:"COMPLETED",approval_required:false,executed_restricted_action:false};
  const out=await enrichAgentCommand(base);
  assert.equal(out.intelligence.provider,"agentx");
  assert.equal(out.intelligence.status,"NOT_CONFIGURED");
  assert.equal(out.status,"COMPLETED");
  if(old)process.env.AGENTX_OPERATOR_TOKEN=old;
});

test("AgentX gateway cannot replace deterministic approval state",async()=>{
  const old=process.env.AGENTX_OPERATOR_TOKEN;delete process.env.AGENTX_OPERATOR_TOKEN;
  const base={instruction:"purchase stock",requested_agent:"purchasing",responses:[],status:"APPROVAL REQUIRED",approval_required:true,executed_restricted_action:false};
  const out=await enrichAgentCommand(base);
  assert.equal(out.status,"APPROVAL REQUIRED");
  assert.equal(out.approval_required,true);
  assert.equal(out.executed_restricted_action,false);
  if(old)process.env.AGENTX_OPERATOR_TOKEN=old;
});

test("intelligence status identifies AgentX as the single gateway",()=>{
  assert.equal(intelligenceStatus().provider,"agentx");
});
