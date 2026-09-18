const $ = (s) => document.querySelector(s);
const money = (p) => new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format((Number(p)||0)/100);
const defaultImage = "https://unsplash.com/photos/u8-QI4tRES0/download?force=true&w=900";
let equipment = [];

async function api(url, options={}){
  const res = await fetch(url,{...options,headers:{"content-type":"application/json",...(options.headers||{})}});
  const text = await res.text();
  let data; try{data=text?JSON.parse(text):null}catch{data=text}
  if(!res.ok){const err=new Error(data?.error||data?.message||`Request failed (${res.status})`);err.status=res.status;err.data=data;throw err}
  return data;
}

function setEquipment(items){
  equipment = Array.isArray(items) ? items : [];
  const grid=$("#equipment-grid"), select=$("#equipment-select");
  select.innerHTML='<option value="">Tell MCQ what I need</option>'+equipment.map(x=>`<option value="${escapeHtml(x.id)}">${escapeHtml(x.name)} — ${money(x.price_pence)}</option>`).join("");
  if(!equipment.length){
    grid.innerHTML='<div class="empty"><strong>MCQ inventory is ready for real equipment.</strong><br>No fake systems have been seeded. Use the hire form to tell MCQ what you need, or add the real 15+ systems through the backend/admin workflow.</div>';
    return;
  }
  grid.innerHTML=equipment.map(x=>`<article class="equipment-card">
    <img loading="lazy" src="${escapeAttr(x.image_url||defaultImage)}" alt="${escapeAttr(x.name)}">
    <div class="body">
      <div class="meta"><div><small>${escapeHtml(x.category||"PA hire")}</small><h3>${escapeHtml(x.name)}</h3></div><span class="price">${money(x.price_pence)}</span></div>
      <p>${escapeHtml(x.description||"Professional MCQ hire equipment.")}</p>
      <button class="button secondary choose-equipment" data-id="${escapeAttr(x.id)}" type="button">Choose for hire</button>
    </div>
  </article>`).join("");
  document.querySelectorAll(".choose-equipment").forEach(btn=>btn.addEventListener("click",()=>{
    select.value=btn.dataset.id;
    $("#quote").scrollIntoView({behavior:"smooth"});
  }));
}

function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function escapeAttr(v){return escapeHtml(v)}

async function loadEquipment(){
  try{setEquipment(await api("/api/equipment"))}
  catch(e){$("#equipment-grid").innerHTML=`<div class="empty">Unable to load hire equipment: ${escapeHtml(e.message)}</div>`}
}

async function loadSuppliers(){
  const grid=$("#supplier-grid");
  try{
    const suppliers=await api("/api/suppliers");
    grid.innerHTML=suppliers.map(s=>`<article class="supplier-card">
      <small>${escapeHtml(s.kind)}</small>
      <strong>${escapeHtml(s.name)}</strong>
      <p>${escapeHtml(s.notes)}</p>
      <a href="${escapeAttr(s.homepage)}" target="_blank" rel="noreferrer">Open supplier ↗</a>
    </article>`).join("");
  }catch(e){grid.innerHTML=`<div class="empty">Supplier directory unavailable: ${escapeHtml(e.message)}</div>`}
}

$("#check-availability").addEventListener("click",async()=>{
  const start=$("#availability-start").value,end=$("#availability-end").value;
  if(!start||!end){$("#equipment-grid").innerHTML='<div class="empty">Choose both start and finish dates.</div>';return}
  try{setEquipment(await api(`/api/availability?start=${encodeURIComponent(new Date(start).toISOString())}&end=${encodeURIComponent(new Date(end).toISOString())}`))}
  catch(e){$("#equipment-grid").innerHTML=`<div class="empty">${escapeHtml(e.message)}</div>`}
});

$("#supplier-api-search").addEventListener("click",async()=>{
  const q=$("#supplier-query").value.trim(), out=$("#supplier-results");
  if(!q){out.innerHTML='<div class="empty">Enter a product to search.</div>';return}
  out.innerHTML='<div class="empty">Checking live Farnell supplier data…</div>';
  try{
    const data=await api(`/api/suppliers/farnell/search?q=${encodeURIComponent(q)}`);
    out.innerHTML=data.products?.length ? data.products.map(p=>`<div class="supplier-product">
      ${p.image_url?`<img src="${escapeAttr(p.image_url)}" alt="">`:"<div></div>"}
      <div><strong>${escapeHtml(p.name||p.sku)}</strong><br><small>${escapeHtml(p.brand||"Farnell")} • ${escapeHtml(p.sku||"")}</small></div>
      ${p.product_url?`<a class="button secondary" href="${escapeAttr(p.product_url)}" target="_blank" rel="noreferrer">View live</a>`:""}
    </div>`).join("") : '<div class="empty">No matching in-stock Farnell products returned.</div>';
  }catch(e){
    const live=e.data?.live_url;
    out.innerHTML=`<div class="empty">Farnell API key is not active on this server yet. ${live?`<a href="${escapeAttr(live)}" target="_blank" rel="noreferrer"><strong>Search Farnell live ↗</strong></a>`:""} </div>`;
  }
});

$("#hire-form").addEventListener("submit",async(e)=>{
  e.preventDefault();
  const form=e.currentTarget,status=$("#form-status");
  const raw=Object.fromEntries(new FormData(form).entries());
  const payload={...raw,start_at:new Date(raw.start_at).toISOString(),end_at:new Date(raw.end_at).toISOString()};
  status.className="wide status";status.textContent="Sending your request…";
  try{
    const result=await api("/api/hire/request",{method:"POST",body:JSON.stringify(payload)});
    status.className="wide status ok";
    status.textContent=result.quote ? `Request received. Draft quote reference: ${result.quote.id}. MCQ will confirm availability and delivery details.` : `Request received. Enquiry reference: ${result.enquiry.id}. MCQ will match the right system and respond.`;
    form.reset();
  }catch(err){status.className="wide status error";status.textContent=err.message}
});

loadEquipment();
loadSuppliers();