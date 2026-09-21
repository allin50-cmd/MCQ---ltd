import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { verifyStripeSignature, verifiedDepositFromStripeEvent, createStripeCheckout } from "../src/payments.js";

test("stripe signature accepts current valid v1 signature and rejects stale/tampered payload",()=>{
  const secret="whsec_test";
  const payload='{"id":"evt_1"}';
  const now=1_800_000_000;
  const digest=crypto.createHmac("sha256",secret).update(now+"."+payload).digest("hex");
  const header="t="+now+",v1="+digest;
  assert.equal(verifyStripeSignature(payload,header,secret,now),true);
  assert.equal(verifyStripeSignature(payload+"x",header,secret,now),false);
  assert.equal(verifyStripeSignature(payload,header,secret,now+301),false);
});

test("verified deposit requires paid GBP exact deposit and provider reference",()=>{
  const quote={id:"quo_1",deposit_pence:2500,status:"SENT"};
  const event={id:"evt_1",type:"checkout.session.completed",created:1_800_000_000,data:{object:{
    id:"cs_1",metadata:{quote_id:"quo_1"},amount_total:2500,payment_status:"paid",currency:"gbp",payment_intent:"pi_1"
  }}};
  const row=verifiedDepositFromStripeEvent(event,quote);
  assert.equal(row.verified,true);
  assert.equal(row.amount_pence,2500);
  assert.equal(row.reference,"pi_1");
  assert.throws(()=>verifiedDepositFromStripeEvent({...event,data:{object:{...event.data.object,amount_total:2400}}},quote),/amount/);
});

test("checkout is provider-created from the sent quote deposit",async()=>{
  const previous=process.env.STRIPE_SECRET_KEY;process.env.STRIPE_SECRET_KEY="sk_test";
  let body="";
  const fetchFn=async(_url,init)=>{body=init.body;return new Response(JSON.stringify({id:"cs_1",url:"https://checkout.example/1"}),{status:200})};
  try{
    const result=await createStripeCheckout({
      quote:{id:"quo_1",deposit_pence:2500,status:"SENT"},
      enquiry:{id:"enq_1"},
      origin:"https://mcq.example",
      fetchFn
    });
    assert.equal(result.id,"cs_1");
    assert.match(body,/unit_amount=2500/);
    assert.match(body,/quote_id%5D=quo_1/);
  }finally{
    if(previous===undefined)delete process.env.STRIPE_SECRET_KEY;else process.env.STRIPE_SECRET_KEY=previous;
  }
});
