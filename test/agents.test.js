import test from "node:test";
import assert from "node:assert/strict";
import {buildAgentControl,MCQ_AGENTS} from "../src/agents.js";

test("agent control exposes all MCQ specialists without autonomous commercial authority",()=>{
  const db={
    leads:[{id:"l1",status:"NEW"}],
    enquiries:[{id:"e1",status:"NEW"}],
    swap_offers:[{id:"s1",status:"NEW"}],
    quotes:[],bookings:[],payments:[]
  };
  const catalogue=[
    {id:"good",state:"SOURCE_THROUGH_MCQ",public_display:true,sellable:false,validation:{common_errors:[]}},
    {id:"bad",state:"DRAFT",public_display:false,sellable:false,validation:{common_errors:["image required"]}}
  ];
  const out=buildAgentControl(db,catalogue);
  assert.equal(MCQ_AGENTS.length,14);
  assert.equal(out.today.open_customer_work,3);
  assert.equal(out.today.image_blocked,1);
  assert.equal(out.today.catalogue_sellable,0);
  assert(out.authority.approval_required.some(v=>/purchase stock/i.test(v)));
  assert(out.decisions.some(v=>v.agent==="swap"));
});


test("agent command supports manager, individual and all agents with approval gating",async()=>{
  const {runAgentCommand}=await import("../src/agents.js");
  const db={leads:[{id:"l1",status:"NEW"}],enquiries:[{id:"e1",status:"NEW"}],swap_offers:[],quotes:[],bookings:[],payments:[]};
  const catalogue=[{id:"p1",state:"DRAFT",public_display:false,sellable:false,validation:{common_errors:["image required"]}}];
  const manager=runAgentCommand(db,catalogue,{agent:"manager",instruction:"What needs attention today?"});
  assert.equal(manager.responses.length,1);assert.equal(manager.responses[0].agent,"manager");assert.equal(manager.approval_required,false);
  const image=runAgentCommand(db,catalogue,{agent:"image",instruction:"Check image problems"});
  assert.match(image.responses[0].finding,/1/);
  const all=runAgentCommand(db,catalogue,{agent:"all",instruction:"Run all agents"});
  assert.equal(all.responses.length,14);assert(all.manager_summary);assert.equal(all.reasoning,"DETERMINISTIC");
  const restricted=runAgentCommand(db,catalogue,{agent:"purchasing",instruction:"Purchase stock"});
  assert.equal(restricted.status,"APPROVAL REQUIRED");assert.equal(restricted.executed_restricted_action,false);
  assert.throws(()=>runAgentCommand(db,catalogue,{agent:"nope",instruction:"status"}),/unknown agent/);
  assert.throws(()=>runAgentCommand(db,catalogue,{agent:"manager",instruction:""}),/instruction is required/);
});
