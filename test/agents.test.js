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
