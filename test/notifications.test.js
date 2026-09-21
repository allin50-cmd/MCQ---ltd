import test from "node:test";
import assert from "node:assert/strict";
import { deliverQuote } from "../src/notifications.js";

test("quote is only deliverable when provider returns a message id",async()=>{
  const oldKey=process.env.SENDGRID_API_KEY;
  const oldFrom=process.env.MCQ_FROM_EMAIL;
  process.env.SENDGRID_API_KEY="SG.test";
  process.env.MCQ_FROM_EMAIL="quotes@mcq.example";
  try{
    const fetchFn=async(_url,init)=>{
      const payload=JSON.parse(init.body);
      assert.equal(payload.personalizations[0].to[0].email,"customer@example.com");
      assert.match(payload.content[0].value,/Pay the deposit securely/);
      return new Response("",{status:202,headers:{"x-message-id":"msg_123"}});
    };
    const result=await deliverQuote({
      quote:{id:"quo_1",total_pence:10000,deposit_pence:2500},
      enquiry:{customer_name:"Customer",contact:"customer@example.com",event_type:"Party",start_at:"2026-12-20T19:00:00Z",venue:"London"},
      origin:"https://mcq.example",
      fetchFn
    });
    assert.equal(result.message_id,"msg_123");
    assert.match(result.pay_url,/quote_id=quo_1/);

    await assert.rejects(()=>deliverQuote({
      quote:{id:"quo_1",total_pence:10000,deposit_pence:2500},
      enquiry:{customer_name:"Customer",contact:"customer@example.com"},
      origin:"https://mcq.example",
      fetchFn:async()=>new Response("",{status:202})
    }),/without verifiable provider message id/);
  }finally{
    if(oldKey===undefined)delete process.env.SENDGRID_API_KEY;else process.env.SENDGRID_API_KEY=oldKey;
    if(oldFrom===undefined)delete process.env.MCQ_FROM_EMAIL;else process.env.MCQ_FROM_EMAIL=oldFrom;
  }
});
