export function requireNotificationEnv(name){
  const value=String(process.env[name]||"").trim();
  if(!value)throw new Error(name+" is not configured");
  return value;
}

function escapeHtml(value){return String(value??"").replace(/[&<>"\']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#039;"}[c]))}
function money(pence){return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(pence)/100)}

export async function deliverQuote({quote,enquiry,origin,fetchFn=fetch}){
  const key=requireNotificationEnv("SENDGRID_API_KEY");
  const fromEmail=requireNotificationEnv("MCQ_FROM_EMAIL");
  const recipient=String(enquiry.contact||"").trim();
  if(!recipient.includes("@"))throw new Error("quote has no email recipient");
  const payUrl=origin+"/pay?quote_id="+encodeURIComponent(String(quote.id));
  const subject="MCQ hire quote "+quote.id;
  const lines=[
    "Hi "+enquiry.customer_name+",","",
    "Your MCQ hire quote is "+money(quote.total_pence)+".",
    "Deposit required to secure the booking: "+money(quote.deposit_pence)+".",
    enquiry.event_type?"Event: "+enquiry.event_type:"",
    enquiry.start_at?"Start: "+enquiry.start_at:"",
    enquiry.venue?"Venue: "+enquiry.venue:"",
    "","Pay the deposit securely: "+payUrl,"","MCQ Entertainments Ltd"
  ];
  const text=lines.filter(Boolean).join("\n");
  const html="<p>Hi "+escapeHtml(enquiry.customer_name)+",</p>"+
    "<p>Your MCQ hire quote is <strong>"+escapeHtml(money(quote.total_pence))+"</strong>.</p>"+
    "<p>Deposit required to secure the booking: <strong>"+escapeHtml(money(quote.deposit_pence))+"</strong>.</p>"+
    "<p>"+escapeHtml(enquiry.event_type||"Event")+"<br/>"+escapeHtml(enquiry.start_at||"")+"<br/>"+escapeHtml(enquiry.venue||"")+"</p>"+
    "<p><a href=\""+escapeHtml(payUrl)+"\">Pay the deposit securely</a></p><p>MCQ Entertainments Ltd</p>";
  let response;
  try{
    response=await fetchFn("https://api.sendgrid.com/v3/mail/send",{
      method:"POST",
      headers:{authorization:"Bearer "+key,"content-type":"application/json"},
      body:JSON.stringify({
        personalizations:[{to:[{email:recipient}],subject}],
        from:{email:fromEmail,name:"MCQ Entertainments Ltd"},
        content:[{type:"text/plain",value:text},{type:"text/html",value:html}]
      }),
      signal:AbortSignal.timeout(15000)
    });
  }catch(error){
    const e=new Error("quote delivery outcome uncertain");
    e.cause=error;e.uncertain=true;throw e;
  }
  const providerText=await response.text();
  if(!response.ok)throw new Error("quote delivery rejected: "+providerText.slice(0,300));
  const messageId=response.headers.get("x-message-id");
  if(!messageId){const e=new Error("quote delivery accepted without verifiable provider message id");e.uncertain=true;throw e;}
  return {provider:"sendgrid",message_id:messageId,recipient,pay_url:payUrl};
}