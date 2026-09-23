import test from "node:test";
import assert from "node:assert/strict";
import {buildAgentControl,MCQ_AGENTS,createAgentHandoff,runMarketingSkill} from "../src/agents.js";

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
  assert.equal(MCQ_AGENTS.length,15);
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
  assert.equal(all.responses.length,15);assert(all.manager_summary);assert.equal(all.reasoning,"DETERMINISTIC");
  const restricted=runAgentCommand(db,catalogue,{agent:"purchasing",instruction:"Purchase stock"});
  assert.equal(restricted.status,"APPROVAL REQUIRED");assert.equal(restricted.executed_restricted_action,false);
  const marketing=runAgentCommand(db,catalogue,{agent:"marketing",instruction:"Prepare the Christmas and New Year campaign for corporate SMEs and private parties"});
  assert.equal(marketing.approval_required,false);assert.match(marketing.responses[0].recommendation,/human approval/i);
  const publish=runAgentCommand(db,catalogue,{agent:"marketing",instruction:"Publish post and launch campaign with ad spend"});
  assert.equal(publish.status,"APPROVAL REQUIRED");assert.equal(publish.executed_restricted_action,false);
  assert.throws(()=>runAgentCommand(db,catalogue,{agent:"nope",instruction:"status"}),/unknown agent/);
  assert.throws(()=>runAgentCommand(db,catalogue,{agent:"manager",instruction:""}),/instruction is required/);
});


test("marketing skill coordinates direct A2A handoffs on one shared plan",()=>{
  const db={leads:[{id:"l1",status:"NEW"}],enquiries:[{id:"e1",status:"NEW"}],swap_offers:[],quotes:[],bookings:[],payments:[]};
  const out=runMarketingSkill(db,[],{campaign:"Christmas + NYE 2026",objective:"Generate qualified corporate SME and private party hire enquiries"});
  assert.equal(out.mode,"A2A_SHARED_PLAN");
  assert.equal(out.approval_required,false);
  assert(out.handoffs.some(x=>x.to==="hire"));
  assert(out.handoffs.some(x=>x.to==="sales"));
  assert(out.handoffs.some(x=>x.to==="content"));
  assert(out.handoffs.every(x=>x.authority==="READ_RECOMMEND"));
  assert(out.shared_plan.hitl.some(x=>/ad spend/i.test(x)));
});

test("A2A handoffs reject unapproved direct authority paths",()=>{
  assert.throws(()=>createAgentHandoff({from:"finance",to:"marketing",objective:"Spend budget"}),/not allowed/i);
  const handoff=createAgentHandoff({from:"marketing",to:"finance",objective:"Review campaign economics"});
  assert.equal(handoff.approval_required,false);
  assert.equal(handoff.authority,"READ_RECOMMEND");
});
