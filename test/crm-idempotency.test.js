import test from "node:test";
import assert from "node:assert/strict";
import {applyCrmUpdate} from "../src/crm.js";

function db(){
  return {
    leads:[{id:"lead-1",name:"Test",contact:"test@example.com",status:"NEW"}],
    enquiries:[],
    swap_offers:[],
    crm_events:[],
    idempotency_receipts:[]
  };
}

test("CRM helper creates one durable effect and replays the same result",()=>{
  const state=db();
  let ids=0;
  const idFn=()=>`crm-${++ids}`;
  const update={entity_type:"lead",entity_id:"lead-1",status:"FOLLOW_UP",owner:"Lola",next_action:"Call"};
  const first=applyCrmUpdate(state,update,"same-key",{idFn,now:()=>"2026-09-22T12:00:00Z"});
  const replay=applyCrmUpdate(state,update,"same-key",{idFn,now:()=>"2026-09-22T12:00:01Z"});

  assert.equal(first.idempotent_replay,false);
  assert.equal(replay.idempotent_replay,true);
  assert.equal(replay.event.id,first.event.id);
  assert.equal(state.crm_events.length,1);
  assert.equal(state.idempotency_receipts.length,1);
  assert.equal(state.leads[0].status,"FOLLOW_UP");
});

test("CRM helper rejects idempotency key reuse with a different request",()=>{
  const state=db();
  const idFn=()=>"crm-1";
  applyCrmUpdate(
    state,
    {entity_type:"lead",entity_id:"lead-1",status:"FOLLOW_UP",next_action:"Call"},
    "same-key",
    {idFn}
  );
  assert.throws(
    ()=>applyCrmUpdate(
      state,
      {entity_type:"lead",entity_id:"lead-1",status:"FOLLOW_UP",next_action:"Email"},
      "same-key",
      {idFn}
    ),
    /idempotency key reused with different request/
  );
  assert.equal(state.crm_events.length,1);
  assert.equal(state.idempotency_receipts.length,1);
});

test("CRM helper validates entity and status before creating an effect",()=>{
  const state=db();
  const idFn=()=>"crm-1";
  assert.throws(
    ()=>applyCrmUpdate(state,{entity_type:"lead",entity_id:"missing",status:"FOLLOW_UP"},"k1",{idFn}),
    /CRM entity not found/
  );
  assert.throws(
    ()=>applyCrmUpdate(state,{entity_type:"lead",entity_id:"lead-1",status:"INVALID"},"k2",{idFn}),
    /invalid CRM status/
  );
  assert.equal(state.crm_events.length,0);
  assert.equal(state.idempotency_receipts.length,0);
});
