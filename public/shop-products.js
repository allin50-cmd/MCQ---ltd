const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const money=v=>Number.isFinite(Number(v))?new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(v)):"";
const grid=document.querySelector("#regular-products-grid");
const dialog=document.querySelector("#regular-product-dialog");
const form=document.querySelector("#regular-product-form");
const title=document.querySelector("#regular-product-title");
const status=document.querySelector("#regular-product-status");
const close=document.querySelector("#regular-product-close");
const tableBody=document.querySelector("#catalogue-table-body");
const filterInput=document.querySelector("#catalogue-filter");
const countEl=document.querySelector("#catalogue-count");
let allCatalogueItems=[];

function openEnquiry(item){
  title.textContent=`${item.brand} ${item.name}`;
  form.product.value=`${item.brand} ${item.name}`;
  form.message.value=`I want MCQ to supply: ${item.brand} ${item.name}. Please confirm current MCQ selling price, availability and delivery.`;
  status.textContent="";
  dialog.showModal();
}

async function load(){
  if(!grid)return;
  grid.innerHTML='<p>Loading current products…</p>';
  try{
    const r=await fetch("/api/market/catalog",{headers:{"accept":"application/json"}});
    if(!r.ok)throw new Error("catalogue unavailable");
    const d=await r.json();
    allCatalogueItems=(d.items||[]).filter(x=>x.public_display===true&&x.id&&x.brand&&x.name&&Number.isFinite(Number(x.observed_public_price_inc_vat_gbp??x.observed_price_gbp)));
    renderCatalogueTable(allCatalogueItems);
    const items=allCatalogueItems.filter(x=>x.image&&/^https:\/\//i.test(x.image));
    grid.innerHTML=items.map((p,i)=>`<article class="product-card" data-image-required-card>
      <img data-product-image="required" src="${esc(p.image)}" alt="${esc(p.brand+" "+p.name)}">
      <div class="product-body">
        <p class="tag">${esc(p.category)} • ${esc(p.supplier)}</p>
        <h3>${esc(p.brand)} ${esc(p.name)}</h3>
        <p><strong>Current online reference: ${money(p.observed_public_price_inc_vat_gbp??p.observed_price_gbp)}</strong></p>
        <p>${esc(p.summary||"Current public-market product reference.")}</p>
        <p><small>Source through MCQ • checked ${esc(p.checked_at||p.last_checked||"")}. This is not represented as MCQ-held stock or an approved MCQ selling price.</small></p>
        <button class="btn dark regular-product-buy" data-index="${i}" type="button">Ask MCQ to source</button>
      </div>
    </article>`).join("");
    grid.querySelectorAll(".regular-product-buy").forEach(b=>b.addEventListener("click",()=>openEnquiry(items[Number(b.dataset.index)])));
  }catch(e){
    grid.innerHTML='<p>Current products could not be loaded. MCQ has not substituted demo products.</p>';
  }
}
function renderCatalogueTable(items){
  if(!tableBody)return;
  countEl.textContent=`${items.length} products`;
  tableBody.innerHTML=items.map((p,i)=>`<tr style="border-top:1px solid #ddd">
    <td style="padding:12px;font-weight:700">${esc(p.brand)}</td>
    <td style="padding:12px">${esc(p.name)}</td>
    <td style="padding:12px">${esc(p.category)}</td>
    <td style="padding:12px;font-weight:700">${money(p.observed_public_price_inc_vat_gbp??p.observed_price_gbp)}</td>
    <td style="padding:12px">${esc(p.observed_availability||"Check with MCQ")}</td>
    <td style="padding:12px">${esc(p.supplier||"Public market")}</td>
    <td style="padding:12px"><button type="button" class="btn dark catalogue-source" data-row="${i}">Ask MCQ to source</button></td>
  </tr>`).join("");
  tableBody.querySelectorAll(".catalogue-source").forEach(b=>b.addEventListener("click",()=>openEnquiry(items[Number(b.dataset.row)])));
}
filterInput?.addEventListener("input",()=>{
  const q=filterInput.value.trim().toLowerCase();
  const rows=!q?allCatalogueItems:allCatalogueItems.filter(p=>(p.brand+" "+p.name+" "+p.category+" "+(p.supplier||"")).toLowerCase().includes(q));
  renderCatalogueTable(rows);
});

close?.addEventListener("click",()=>dialog.close());
form?.addEventListener("submit",async e=>{
  e.preventDefault(); status.textContent="Sending…";
  const data=Object.fromEntries(new FormData(form));
  try{
    const r=await fetch("/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...data,source:"shop-star-products"})});
    const d=await r.json(); if(!r.ok)throw new Error(d.error||"request failed");
    status.textContent=`Received — reference ${d.id}.`;
    form.reset();
  }catch(err){status.textContent=err.message}
});
load();
