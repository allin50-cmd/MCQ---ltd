const AGENTX_URL=(process.env.AGENTX_URL||"https://agentx-production.onrender.com").replace(/\/$/,"");

export function intelligenceStatus(){
  return {provider:"agentx",configured:Boolean(process.env.AGENTX_OPERATOR_TOKEN),gateway:AGENTX_URL};
}

function roleFor(agent){
  if(agent==="manager"||agent==="all") return "business_review";
  if(["sales","trade"].includes(agent)) return "sales";
  if(agent==="customer") return "customer_service";
  return "mcq";
}

export async function enrichAgentCommand(result){
  const token=(process.env.AGENTX_OPERATOR_TOKEN||"").trim();
  if(!token) return {...result,intelligence:{...intelligenceStatus(),status:"NOT_CONFIGURED"}};
  const evidence={instruction:result.instruction,requested_agent:result.requested_agent,responses:result.responses,manager_summary:result.manager_summary,status:result.status,approval_required:result.approval_required};
  try{
    const r=await fetch(AGENTX_URL+"/api/objectives",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+token},body:JSON.stringify({objective:"Review this MCQ operator command using current MCQ production evidence. Do not invent commercial truth. Command and deterministic evidence: "+JSON.stringify(evidence),role:roleFor(result.requested_agent),business:"MCQ Audio",required_outcome:"Return the minimum useful evidence-backed findings and recommendations. Consequential work must remain approval-bound."})});
    const body=await r.json().catch(()=>({}));
    if(!r.ok) return {...result,intelligence:{provider:"agentx",configured:true,gateway:AGENTX_URL,status:"UNAVAILABLE",http_status:r.status,error:body.error||"AgentX request failed"}};
    return {...result,intelligence:{provider:"agentx",configured:true,gateway:AGENTX_URL,status:"USED",objective_id:body.objective_id},intelligence_output:body};
  }catch(e){
    return {...result,intelligence:{provider:"agentx",configured:true,gateway:AGENTX_URL,status:"UNAVAILABLE",error:e?.message||"AgentX request failed"}};
  }
}
