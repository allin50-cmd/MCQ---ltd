export const CATALOG_STATES=Object.freeze({
  DRAFT:"DRAFT",
  SOURCE_THROUGH_MCQ:"SOURCE_THROUGH_MCQ",
  AVAILABLE_TO_ORDER:"AVAILABLE_TO_ORDER",
  IN_STOCK_MCQ:"IN_STOCK_MCQ"
});

export const IMAGE_PERMISSION_STATES=Object.freeze({
  MCQ_OWNED:"MCQ_OWNED",
  MANUFACTURER_AUTHORISED:"MANUFACTURER_AUTHORISED",
  SUPPLIER_AUTHORISED:"SUPPLIER_AUTHORISED",
  LICENSED:"LICENSED",
  UNVERIFIED:"UNVERIFIED"
});

const nonEmpty=v=>typeof v==="string"&&v.trim().length>0;
const finiteNonNegative=v=>v!==null&&v!==undefined&&v!==""&&Number.isFinite(Number(v))&&Number(v)>=0;
const finitePositive=v=>v!==null&&v!==undefined&&v!==""&&Number.isFinite(Number(v))&&Number(v)>0;

function dateLike(v){
  if(!nonEmpty(v))return false;
  const t=Date.parse(v);
  return Number.isFinite(t);
}

function imageErrors(row){
  const images=Array.isArray(row.images)?row.images:[];
  if(!images.length)return ["images"];
  const valid=images.some(img=>
    nonEmpty(img?.url)&&/^https:\/\//i.test(img.url)&&
    nonEmpty(img?.source)&&
    Object.values(IMAGE_PERMISSION_STATES).includes(img?.permission_status)&&
    img?.permission_status!==IMAGE_PERMISSION_STATES.UNVERIFIED&&
    img?.verified===true&&
    finitePositive(img?.width)&&Number(img.width)>=800&&
    finitePositive(img?.height)&&Number(img.height)>=600
  );
  return valid?[]:["images:verified_exact_high_resolution_with_permission"];
}

function commonErrors(row){
  const errors=[];
  for(const key of ["id","brand","model","category","source_url","source_note","last_checked"]){
    if(!nonEmpty(row?.[key]))errors.push(key);
  }
  if(row?.source_url&&!/^https:\/\//i.test(row.source_url))errors.push("source_url:https");
  if(row?.last_checked&&!dateLike(row.last_checked))errors.push("last_checked:date");
  errors.push(...imageErrors(row));
  return errors;
}

function sellableErrors(row){
  const errors=[];
  for(const key of ["supplier","supplier_sku","real_availability","availability_checked_at"]){
    if(!nonEmpty(row?.[key]))errors.push(key);
  }
  if(row?.availability_checked_at&&!dateLike(row.availability_checked_at))errors.push("availability_checked_at:date");
  for(const key of ["real_cost_price_ex_vat_gbp","delivery_cost_ex_vat_gbp","mcq_retail_price_inc_vat_gbp"]){
    if(!finiteNonNegative(row?.[key]))errors.push(key);
  }
  if(!nonEmpty(row?.cost_evidence_url)||!/^https:\/\//i.test(row.cost_evidence_url||""))errors.push("cost_evidence_url");
  if(!nonEmpty(row?.availability_evidence_url)||!/^https:\/\//i.test(row.availability_evidence_url||""))errors.push("availability_evidence_url");
  return errors;
}

export function commercialMetrics(row,{vatRate=0.20,targetGrossMargin=0.25}={}){
  const publicInc=finitePositive(row.observed_public_price_inc_vat_gbp)?Number(row.observed_public_price_inc_vat_gbp):null;
  const estTrade=finiteNonNegative(row.estimated_trade_cost_ex_vat_gbp)?Number(row.estimated_trade_cost_ex_vat_gbp):null;
  const deliveryInc=finiteNonNegative(row.delivery_cost_inc_vat_gbp)?Number(row.delivery_cost_inc_vat_gbp):null;
  const realCost=finiteNonNegative(row.real_cost_price_ex_vat_gbp)?Number(row.real_cost_price_ex_vat_gbp):null;
  const deliveryEx=finiteNonNegative(row.delivery_cost_ex_vat_gbp)?Number(row.delivery_cost_ex_vat_gbp):(deliveryInc!==null?deliveryInc/(1+vatRate):null);
  const retailInc=finitePositive(row.mcq_retail_price_inc_vat_gbp)?Number(row.mcq_retail_price_inc_vat_gbp):
    (finitePositive(row.suggested_mcq_retail_inc_vat_gbp)?Number(row.suggested_mcq_retail_inc_vat_gbp):publicInc);

  const publicNet=publicInc!==null?publicInc/(1+vatRate):null;
  const estimatedLanded=estTrade!==null&&deliveryEx!==null?estTrade+deliveryEx:null;
  const maxBuy=retailInc!==null&&deliveryEx!==null?(retailInc/(1+vatRate))*(1-targetGrossMargin)-deliveryEx:null;
  const requiredDiscount=publicNet!==null&&maxBuy!==null?1-(maxBuy/publicNet):null;
  const landedForMargin=realCost!==null&&deliveryEx!==null?realCost+deliveryEx:estimatedLanded;
  const projectedGm=retailInc!==null&&landedForMargin!==null?
    ((retailInc/(1+vatRate))-landedForMargin)/(retailInc/(1+vatRate)):null;

  return {
    public_net_ex_vat_gbp:publicNet,
    estimated_trade_cost_ex_vat_gbp:estTrade,
    estimated_landed_cost_ex_vat_gbp:estimatedLanded,
    suggested_mcq_retail_inc_vat_gbp:finitePositive(row.suggested_mcq_retail_inc_vat_gbp)?Number(row.suggested_mcq_retail_inc_vat_gbp):retailInc,
    max_buy_cost_ex_vat_at_target_gm_gbp:maxBuy,
    required_supplier_discount_vs_public_net:requiredDiscount,
    projected_gm:projectedGm,
    decision:projectedGm===null?"INSUFFICIENT_REAL_DATA":projectedGm>=targetGrossMargin?"VIABLE":"NEGOTIATE"
  };
}

export function evaluateCatalogRow(row,opts={}){
  const requested=row?.requested_state||CATALOG_STATES.DRAFT;
  const baseErrors=commonErrors(row);
  const salesErrors=sellableErrors(row);
  const metrics=commercialMetrics(row,opts);
  let state=CATALOG_STATES.DRAFT;

  if(baseErrors.length===0){
    if(requested===CATALOG_STATES.SOURCE_THROUGH_MCQ){
      state=CATALOG_STATES.SOURCE_THROUGH_MCQ;
    }else if((requested===CATALOG_STATES.AVAILABLE_TO_ORDER||requested===CATALOG_STATES.IN_STOCK_MCQ)&&salesErrors.length===0){
      state=requested;
    }
  }

  if(state===CATALOG_STATES.IN_STOCK_MCQ){
    if(!finiteNonNegative(row.mcq_stock_quantity)||Number(row.mcq_stock_quantity)<1){
      salesErrors.push("mcq_stock_quantity");
      state=CATALOG_STATES.DRAFT;
    }
    if(!nonEmpty(row.mcq_stock_evidence_note)){
      salesErrors.push("mcq_stock_evidence_note");
      state=CATALOG_STATES.DRAFT;
    }
  }

  const sellable=state===CATALOG_STATES.AVAILABLE_TO_ORDER||state===CATALOG_STATES.IN_STOCK_MCQ;
  const publicDisplay=state!==CATALOG_STATES.DRAFT;

  return {
    ...row,
    state,
    public_display:publicDisplay,
    sellable,
    validation:{
      common_errors:[...new Set(baseErrors)],
      sellable_errors:[...new Set(salesErrors)]
    },
    commercial:metrics
  };
}

export function publishableCatalogRows(rows,opts={}){
  return (rows||[]).map(r=>evaluateCatalogRow(r,opts)).filter(r=>r.public_display);
}

export function sellableCatalogRows(rows,opts={}){
  return (rows||[]).map(r=>evaluateCatalogRow(r,opts)).filter(r=>r.sellable);
}
