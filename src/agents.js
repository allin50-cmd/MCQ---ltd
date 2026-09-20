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
      approval_required:["purchase stock","change or approve commercial price","refund or move money","confirm unverified availability","publish incomplete products","make contractual commitments"]
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
