import crypto from "node:crypto";

const allowedStatuses=new Set(["NEW","CONTACT","QUALIFIED","QUOTE","FOLLOW_UP","WAITING_CUSTOMER","WON","LOST","CLOSED"]);

export function applyCrmUpdate(db,x,idempotencyKey,{idFn,now=()=>new Date().toISOString()}={}){
  if(typeof idFn!=="function")throw new Error("idFn is required");
  const key=String(idempotencyKey||"").trim().slice(0,200);
  const requestShape={
    entity_type:String(x.entity_type||""),
    entity_id:String(x.entity_id||""),
    status:x.status===undefined?null:String(x.status),
    owner:x.owner===undefined?null:String(x.owner),
    next_action:x.next_action===undefined?null:String(x.next_action),
    next_action_at:x.next_action_at===undefined?null:String(x.next_action_at),
    note:x.note===undefined?null:String(x.note)
  };
  const requestHash=crypto.createHash("sha256").update(JSON.stringify(requestShape)).digest("hex");
  if(key){
    const prior=db.idempotency_receipts.find(v=>v.scope==="crm_update"&&v.key===key);
    if(prior){
      if(prior.request_hash!==requestHash)throw new Error("idempotency key reused with different request");
      return {...structuredClone(prior.result),idempotent_replay:true};
    }
  }

  const maps={lead:db.leads,enquiry:db.enquiries,swap_offer:db.swap_offers};
  const rows=maps[requestShape.entity_type];
  if(!rows)throw new Error("entity_type must be lead, enquiry or swap_offer");
  const row=rows.find(v=>v.id===requestShape.entity_id);
  if(!row)throw new Error("CRM entity not found");

  if(x.status!==undefined){
    const status=String(x.status).trim().toUpperCase();
    if(!allowedStatuses.has(status))throw new Error("invalid CRM status");
    row.status=status;
  }
  if(x.owner!==undefined)row.crm_owner=String(x.owner||"").trim().slice(0,80);
  if(x.next_action!==undefined)row.crm_next_action=String(x.next_action||"").trim().slice(0,300);
  if(x.next_action_at!==undefined)row.crm_next_action_at=String(x.next_action_at||"").trim().slice(0,80);
  if(x.note!==undefined)row.crm_note=String(x.note||"").trim().slice(0,1000);
  row.crm_updated_at=now();

  const event={
    id:idFn("crm"),
    entity_type:requestShape.entity_type,
    entity_id:row.id,
    status:row.status||"NEW",
    owner:row.crm_owner||"",
    next_action:row.crm_next_action||"",
    next_action_at:row.crm_next_action_at||"",
    note:row.crm_note||"",
    created_at:row.crm_updated_at
  };
  db.crm_events.push(event);

  const result={ok:true,item:structuredClone(row),event:structuredClone(event),idempotent_replay:false};
  if(key)db.idempotency_receipts.push({
    scope:"crm_update",
    key,
    request_hash:requestHash,
    result:structuredClone(result),
    created_at:row.crm_updated_at
  });
  return result;
}
