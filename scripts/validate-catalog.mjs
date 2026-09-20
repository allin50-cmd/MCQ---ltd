import {listInternalCatalog} from "../src/catalog.js";
import {listMarketCatalog} from "../src/market.js";

const rows=[...listInternalCatalog(),...listMarketCatalog()];
const invalidClaims=rows.filter(row=>{
  const requested=row.requested_state||"DRAFT";
  if(requested==="DRAFT")return false;
  return row.state!==requested || !row.public_display;
});
const publicWithErrors=rows.filter(row=>
  row.public_display &&
  ((row.validation?.common_errors||[]).length>0 ||
   ((row.sellable)&&(row.validation?.sellable_errors||[]).length>0))
);

if(invalidClaims.length||publicWithErrors.length){
  console.error("MCQ CATALOGUE GATE FAILED");
  for(const row of [...invalidClaims,...publicWithErrors]){
    console.error(JSON.stringify({
      id:row.id,
      requested_state:row.requested_state,
      state:row.state,
      common_errors:row.validation?.common_errors||[],
      sellable_errors:row.validation?.sellable_errors||[]
    }));
  }
  process.exit(1);
}

const summary={
  total:rows.length,
  draft:rows.filter(r=>r.state==="DRAFT").length,
  public_display:rows.filter(r=>r.public_display).length,
  sellable:rows.filter(r=>r.sellable).length
};
console.log("MCQ CATALOGUE GATE PASSED",JSON.stringify(summary));
