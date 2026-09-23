export const MCQ_AGENTS=Object.freeze([
  {id:"manager",name:"MCQ Manager",role:"Coordinates the operation and surfaces decisions",mode:"READ_RECOMMEND"},
  {id:"product",name:"Product Agent",role:"Checks catalogue completeness and commercial truth",mode:"READ_RECOMMEND"},
  {id:"image",name:"Image Agent",role:"Surfaces missing or failed product-image evidence",mode:"READ_RECOMMEND"},
  {id:"research",name:"Research Agent",role:"Reviews market and competitor evidence",mode:"READ_RECOMMEND"},
  {id:"stock",name:"Stock Agent",role:"Reports evidenced sale and hire availability",mode:"READ_RECOMMEND"},
  {id:"swap",name:"Swap Shop Agent",role:"Triages real customer equipment offers",mode:"CRM_ASSIST"},
  {id:"sales",name:"Sales Agent",role:"Qualifies and follows up real sales leads",mode:"CRM_ASSIST"},
  {id:"hire",name:"Hire Agent",role:"Works real PA hire enquiries and booking readiness",mode:"CRM_ASSIST"},
  {id:"trade",name:"Trade Agent",role:"Works real B2B and venue opportunities",mode:"CRM_ASSIST"},
  {id:"content",name:"Content Agent",role:"Prepares content from verified MCQ evidence",mode:"READ_RECOMMEND"},
  {id:"marketing",name:"Marketing Agent",role:"Runs campaign research, segmentation, creative preparation and performance review; live implementation is approval-bound",mode:"APPROVAL_REQUIRED"},
  {id:"customer",name:"Customer Agent",role:"Triage and response preparation for customer enquiries",mode:"CRM_ASSIST"},
  {id:"finance",name:"Finance Agent",role:"Reports evidenced quotes, payments and bookings",mode:"READ_RECOMMEND"},
  {id:"purchasing",name:"Purchasing Agent",role:"Researches purchasing candidates; never commits spend",mode:"APPROVAL_REQUIRED"},
  {id:"installation",name:"Installation Agent",role:"Qualifies installation opportunities and next actions",mode:"CRM_ASSIST"}
]);

const OPEN=new Set(["NEW","CONTACT","QUALIFIED","QUOTE","FOLLOW_UP","WAITING_CUSTOMER"]);
const safeCount=v=>Array.isArray(v)?v.length:0;

export function buildAgentControl(db,catalogue=[]){
  const leads=db.leads||[], enquiries=db.enquiries||[], swaps=db.swap_offers||[];
  const openRows=[
    ...leads.map(v=>({type:"lead",...v})),
    ...enquiries.map(v=>({type:"enquiry",...v})),
    ...swaps.map(v=>({type:"swap_offer",...v}))
  ].filter(v=>OPEN.has(String(v.status||"NEW").toUpperCase()));
  const blocked=catalogue.filter(v=>v.state==="DRAFT"||v.public_display===false);
  const imageBlocked=blocked.filter(v=>(v.validation?.common_errors||[]).some(e=>/image/i.test(String(e))));
  const decisions=[];
  if(openRows.length)decisions.push({agent:"manager",priority:"NOW",reason:`${openRows.length} open customer opportunities require ownership or next action`});
  if(blocked.length)decisions.push({agent:"product",priority:"NOW",reason:`${blocked.length} catalogue records remain blocked/non-public`});
  if(imageBlocked.length)decisions.push({agent:"image",priority:"NOW",reason:`${imageBlocked.length} catalogue records have image validation blockers`});
  if(swaps.filter(v=>OPEN.has(String(v.status||"NEW").toUpperCase())).length)decisions.push({agent:"swap",priority:"NOW",reason:"Swap Shop offers require human-reviewed triage; no autonomous valuation or purchase"});
  return {
    source:"MCQ production",
    generated_at:new Date().toISOString(),
    authority:{
      autonomous:["read verified business data","classify work","prepare recommendations","prepare CRM next actions"],
      approval_required:["purchase stock","change or approve commercial price","refund or move money","confirm unverified availability","publish incomplete products","make contractual commitments","publish or schedule social content","launch or change paid advertising","commit advertising spend","send outbound marketing messages","change live website campaign content"]
    },
    agents:MCQ_AGENTS,
    today:{
      open_customer_work:openRows.length,
      leads:safeCount(leads),
      hire_enquiries:safeCount(enquiries),
      swap_offers:safeCount(swaps),
      quotes:safeCount(db.quotes),
      confirmed_bookings:safeCount(db.bookings),
      received_payments:(db.payments||[]).filter(v=>v.status==="RECEIVED").length,
      catalogue_total:catalogue.length,
      catalogue_public:catalogue.filter(v=>v.public_display).length,
      catalogue_sellable:catalogue.filter(v=>v.sellable).length,
      catalogue_blocked:blocked.length,
      image_blocked:imageBlocked.length
    },
    decisions
  };
}


const restrictedTerms=["purchase","buy stock","refund","change price","approve price","publish product","publish incomplete","contract","commit company","promise availability","publish post","schedule post","launch campaign","run ads","ad spend","advertising spend","send marketing","contact prospect","change website","update website","go live"];
function findingFor(agent,control){
  const t=control.today;
  const data={
    manager:["Business control",t.open_customer_work+" open customer work and "+control.decisions.length+" decisions require review.","Work the NOW decisions first."],
    product:["Catalogue",t.catalogue_public+" public, "+t.catalogue_blocked+" blocked, "+t.catalogue_sellable+" sellable.","Resolve evidence blockers before changing commercial state."],
    image:["Catalogue image validation",t.image_blocked+" records have image validation blockers.","Keep image-blocked products non-public until exact-model evidence passes."],
    research:["Catalogue research",t.catalogue_total+" catalogue records are available for evidence review.","Prioritise stale or incomplete evidence."],
    stock:["Verified catalogue state",t.catalogue_sellable+" catalogue records currently pass the sellable gate.","Treat all other availability as unverified."],
    swap:["Swap Shop",t.swap_offers+" offers are recorded.","Review condition and evidence; valuation or purchase needs human approval."],
    sales:["CRM leads",t.leads+" leads are recorded.","Prioritise open leads with no owner or next action."],
    hire:["Hire CRM",t.hire_enquiries+" hire enquiries and "+t.confirmed_bookings+" confirmed bookings.","Follow up open hire enquiries and protect confirmed bookings."],
    trade:["CRM leads",t.leads+" leads are available for qualification.","Identify genuine B2B opportunities from current records."],
    content:["Verified MCQ evidence","Content can be prepared from verified business evidence.","Do not publish unsupported commercial claims."],
    marketing:["Verified hire, CRM and MCQ evidence",t.hire_enquiries+" hire enquiries and "+t.leads+" leads are available for campaign learning.","Autonomously prepare seasonal campaign plans, audience segments, creative variants and performance recommendations; require human approval before any live publish, schedule, outreach, ad-spend commitment or website change."],
    customer:["Shared customer queue",t.open_customer_work+" open customer opportunities.","Give each open record an owner and next action."],
    finance:["Quotes, payments and bookings",t.quotes+" quotes, "+t.received_payments+" received payments, "+t.confirmed_bookings+" confirmed bookings.","Review exceptions; money movement remains approval-controlled."],
    purchasing:["Verified catalogue evidence",t.catalogue_total+" catalogue records can be researched.","Prepare purchasing candidates only; do not commit spend."],
    installation:["CRM leads and hire enquiries",t.leads+" leads and "+t.hire_enquiries+" hire enquiries can be screened.","Qualify installation opportunities before preparing a scope."]
  };
  const row=data[agent.id]||["MCQ production","No relevant production finding.","No recommendation."];
  return {agent:agent.id,name:agent.name,finding:row[1],evidence:row[0],recommendation:row[2],status:"READY",approval_required:false};
}
export function runAgentCommand(db,catalogue=[],input={}){
  const instruction=String(input.instruction||"").trim().slice(0,2000);
  if(!instruction) throw new Error("instruction is required");
  const requested=String(input.agent||"manager").trim().toLowerCase();
  const selected=requested==="all"?MCQ_AGENTS:MCQ_AGENTS.filter(x=>x.id===requested);
  if(!selected.length) throw new Error("unknown agent");
  const control=buildAgentControl(db,catalogue);
  const restricted=restrictedTerms.some(term=>instruction.toLowerCase().includes(term));
  const responses=selected.map(agent=>findingFor(agent,control));
  if(restricted) responses.forEach(r=>{r.status="APPROVAL REQUIRED";r.approval_required=true});
  const manager={
    TODAY:responses.find(x=>x.agent==="manager")?.finding||control.today.open_customer_work+" open customer work",
    URGENT:control.decisions.map(x=>x.reason),
    CUSTOMERS:control.today.open_customer_work,
    SALES:control.today.leads,HIRE:control.today.hire_enquiries,STOCK:control.today.catalogue_sellable,
    PRODUCTS:control.today.catalogue_blocked,IMAGES:control.today.image_blocked,"SWAP SHOP":control.today.swap_offers,
    TRADE:control.today.leads,FINANCE:{quotes:control.today.quotes,payments:control.today.received_payments},
    CONTENT:"Verified evidence only",MARKETING:"Autonomous campaign preparation; live implementation requires HITL approval",INSTALLATIONS:"Qualify from current CRM records",
    "DECISIONS REQUIRED":control.decisions.map(x=>x.reason)
  };
  return {source:"MCQ production",reasoning:"DETERMINISTIC",instruction,requested_agent:requested,responses,manager_summary:requested==="all"?manager:null,status:restricted?"APPROVAL REQUIRED":"COMPLETED",approval_required:restricted,executed_restricted_action:false,generated_at:new Date().toISOString()};
}
