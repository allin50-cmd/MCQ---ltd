import crypto from "node:crypto";

export function requirePaymentEnv(name){
  const value=String(process.env[name]||"").trim();
  if(!value)throw new Error(name+" is not configured");
  return value;
}

export function verifyStripeSignature(payload, header, secret, nowSeconds=Math.floor(Date.now()/1000), toleranceSeconds=300){
  const parts=String(header||"").split(",").map(x=>x.trim());
  const timestamp=parts.find(x=>x.startsWith("t="))?.slice(2);
  const signatures=parts.filter(x=>x.startsWith("v1=")).map(x=>x.slice(3));
  if(!timestamp||signatures.length===0)return false;
  const ts=Number(timestamp);
  if(!Number.isFinite(ts)||Math.abs(nowSeconds-ts)>toleranceSeconds)return false;
  const digest=crypto.createHmac("sha256",secret).update(timestamp+"."+payload).digest("hex");
  const expected=Buffer.from(digest);
  return signatures.some(sig=>{
    try{
      const actual=Buffer.from(sig);
      return actual.length===expected.length&&crypto.timingSafeEqual(actual,expected);
    }catch{return false}
  });
}

export async function createStripeCheckout({quote,enquiry,origin,fetchFn=fetch}){
  const stripeKey=requirePaymentEnv("STRIPE_SECRET_KEY");
  if(!Number.isInteger(quote.deposit_pence)||quote.deposit_pence<=0)throw new Error("quote has no valid deposit");
  if(quote.status!=="SENT")throw new Error("quote must be sent before payment");
  const form=new URLSearchParams();
  form.set("mode","payment");
  form.set("client_reference_id",String(quote.id));
  form.set("metadata[quote_id]",String(quote.id));
  form.set("metadata[enquiry_id]",String(enquiry.id));
  form.set("line_items[0][quantity]","1");
  form.set("line_items[0][price_data][currency]","gbp");
  form.set("line_items[0][price_data][unit_amount]",String(quote.deposit_pence));
  form.set("line_items[0][price_data][product_data][name]","MCQ hire deposit "+quote.id);
  form.set("success_url",origin+"/pay?status=success&quote_id="+encodeURIComponent(String(quote.id)));
  form.set("cancel_url",origin+"/pay?status=cancelled&quote_id="+encodeURIComponent(String(quote.id)));
  const response=await fetchFn("https://api.stripe.com/v1/checkout/sessions",{
    method:"POST",
    headers:{authorization:"Bearer "+stripeKey,"content-type":"application/x-www-form-urlencoded"},
    body:form.toString(),
    signal:AbortSignal.timeout(15000)
  });
  const body=await response.text();
  if(!response.ok)throw new Error("stripe checkout rejected: "+body.slice(0,300));
  const session=JSON.parse(body);
  if(!session?.id||!session?.url)throw new Error("stripe returned incomplete checkout session");
  return {id:String(session.id),url:String(session.url)};
}

export function verifiedDepositFromStripeEvent(event,quote){
  if(event?.type!=="checkout.session.completed")return null;
  const session=event?.data?.object||{};
  const quoteId=String(session?.metadata?.quote_id||session?.client_reference_id||"");
  const amount=Number(session?.amount_total||0);
  const paymentStatus=String(session?.payment_status||"");
  const currency=String(session?.currency||"").toLowerCase();
  const reference=String(session?.payment_intent||session?.id||"");
  if(!quoteId||quoteId!==String(quote.id))throw new Error("payment quote mismatch");
  if(paymentStatus!=="paid")throw new Error("payment is not paid");
  if(currency!=="gbp")throw new Error("payment currency mismatch");
  if(!reference)throw new Error("payment provider reference missing");
  if(!Number.isInteger(amount)||amount!==quote.deposit_pence)throw new Error("payment amount does not match deposit");
  return {
    quote_id:quote.id,amount_pence:amount,reference,provider:"stripe",
    provider_event_id:String(event.id||""),provider_session_id:String(session.id||""),
    status:"RECEIVED",verified:true,
    received_at:new Date(Number(event.created||Math.floor(Date.now()/1000))*1000).toISOString()
  };
}