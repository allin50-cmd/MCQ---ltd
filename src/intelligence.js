const DEFAULT_PROVIDER=process.env.MCQ_AI_PROVIDER||"deepseek";
const PROVIDERS={
  deepseek:{
    key:()=>process.env.DEEPSEEK_API_KEY,
    url:"https://api.deepseek.com/chat/completions",
    model:()=>process.env.DEEPSEEK_MODEL||"deepseek-flash"
  }
};

export function intelligenceStatus(){
  const p=PROVIDERS[DEFAULT_PROVIDER];
  return p&&p.key()?{provider:DEFAULT_PROVIDER,configured:true,model:p.model()}:{provider:"deterministic",configured:false,model:null};
}

export async function enrichAgentCommand(result){
  const p=PROVIDERS[DEFAULT_PROVIDER];
  if(!p||!p.key()) return {...result,intelligence:intelligenceStatus()};
  const evidence={instruction:result.instruction,requested_agent:result.requested_agent,responses:result.responses,manager_summary:result.manager_summary,status:result.status,approval_required:result.approval_required};
  const system="You are the MCQ business intelligence layer. Use ONLY the supplied verified MCQ evidence. Never invent stock, availability, supplier cost, MCQ price, margin, customer activity, bookings, payments, images, competitor evidence or delivery promises. Unknown means UNKNOWN. Missing evidence means NEEDS EVIDENCE. You may analyse and recommend only. Never authorize or execute purchases, payments, refunds, price changes, publication, contracts or commitments. Return concise JSON with summary and recommendations.";
  const r=await fetch(p.url,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+p.key()},body:JSON.stringify({model:p.model(),messages:[{role:"system",content:system},{role:"user",content:JSON.stringify(evidence)}],response_format:{type:"json_object"},max_tokens:1200})});
  if(!r.ok) return {...result,intelligence:{provider:DEFAULT_PROVIDER,configured:true,model:p.model(),status:"UNAVAILABLE",http_status:r.status}};
  const body=await r.json();let output={};
  try{output=JSON.parse(body.choices?.[0]?.message?.content||"{}")}catch{output={summary:body.choices?.[0]?.message?.content||""}}
  return {...result,intelligence:{provider:DEFAULT_PROVIDER,configured:true,model:p.model(),status:"USED"},intelligence_output:output};
}
