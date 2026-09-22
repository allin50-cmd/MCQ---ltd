import {load,save,id} from "./store.js";
import {applyCrmUpdate} from "./crm.js";

const PROOF_LEAD_ID="__mcq_exactly_once_acceptance__";
const PROOF_KEY="__mcq_exactly_once_key__";

function clean(db){
  db.leads=db.leads.filter(v=>v.id!==PROOF_LEAD_ID);
  db.crm_events=db.crm_events.filter(v=>!(v.entity_type==="lead"&&v.entity_id===PROOF_LEAD_ID));
  db.idempotency_receipts=db.idempotency_receipts.filter(v=>!(v.scope==="crm_update"&&v.key===PROOF_KEY));
}

export async function runExactlyOnceProductionProof(){
  let db=await load();
  clean(db);
  db.leads.push({
    id:PROOF_LEAD_ID,
    name:"MCQ acceptance proof",
    contact:"acceptance-proof@invalid.local",
    interest:"production acceptance",
    source:"agentx-production-proof",
    status:"NEW",
    created_at:new Date().toISOString()
  });
  await save(db);

  const update={
    entity_type:"lead",
    entity_id:PROOF_LEAD_ID,
    status:"FOLLOW_UP",
    owner:"Lola",
    next_action:"Exactly-once acceptance proof",
    note:"Synthetic acceptance fixture. Must be removed before proof completes."
  };

  try{
    db=await load();
    const first=applyCrmUpdate(db,update,PROOF_KEY,{idFn:id});
    if(first.idempotent_replay)throw new Error("first MCQ exactly-once effect unexpectedly replayed");
    await save(db);

    db=await load();
    const replay=applyCrmUpdate(db,update,PROOF_KEY,{idFn:id});
    if(!replay.idempotent_replay)throw new Error("second MCQ exactly-once effect was not replayed");
    if(replay.event.id!==first.event.id)throw new Error("MCQ replay returned a different event");

    const persisted=await load();
    const eventCount=persisted.crm_events.filter(v=>v.entity_type==="lead"&&v.entity_id===PROOF_LEAD_ID&&v.id===first.event.id).length;
    const receiptCount=persisted.idempotency_receipts.filter(v=>v.scope==="crm_update"&&v.key===PROOF_KEY).length;
    const lead=persisted.leads.find(v=>v.id===PROOF_LEAD_ID);
    if(eventCount!==1)throw new Error(`MCQ exactly-once event count was ${eventCount}`);
    if(receiptCount!==1)throw new Error(`MCQ idempotency receipt count was ${receiptCount}`);
    if(!lead||lead.status!=="FOLLOW_UP")throw new Error("MCQ exactly-once durable lead state missing");

    clean(persisted);
    await save(persisted);

    const after=await load();
    const leftovers=
      after.leads.filter(v=>v.id===PROOF_LEAD_ID).length+
      after.crm_events.filter(v=>v.entity_type==="lead"&&v.entity_id===PROOF_LEAD_ID).length+
      after.idempotency_receipts.filter(v=>v.scope==="crm_update"&&v.key===PROOF_KEY).length;
    if(leftovers!==0)throw new Error("MCQ exactly-once proof cleanup failed");

    return {
      first_effect_created:true,
      replay_detected:true,
      same_event_id:true,
      durable_event_count:eventCount,
      durable_receipt_count:receiptCount,
      cleanup_complete:true
    };
  }catch(error){
    try{
      const cleanup=await load();
      clean(cleanup);
      await save(cleanup);
    }catch{}
    throw error;
  }
}
