const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
async function api(url,opt={}){const r=await fetch(url,{...opt,headers:{"content-type":"application/json",...(opt.headers||{})}});const t=await r.text();let d;try{d=t?JSON.parse(t):null}catch{d=t}if(!r.ok)throw new Error(d?.error||d?.message||"Request failed");return d}

const products=[
 {brand:"Technics",name:"SL‑1200G",category:"Turntable",image:"https://www.technics.com/content/dam/pim/uk/en/SL/SL-120/SL-1200G/ast-1651355.png.pub.thumb.644.644.png",summary:"Grand Class direct-drive turntable built around motor control, platter inertia and a magnesium tonearm.",specs:["Direct drive","33 / 45 / 78 rpm","18 kg","Magnesium tonearm"]},
 {brand:"Sony",name:"WH‑1000XM6",category:"Headphones",image:"https://sony.scene7.com/is/image/sonyglobalsolutions/GGB-8071_Olive_Gray_Gallery-1?$originalDimensions$=",summary:"Flagship wireless noise-cancelling headphones for travel, calls and serious everyday listening.",specs:["30 mm driver","LDAC","Bluetooth 5.3","Up to 30h NC"]},
 {brand:"Technics",name:"SU‑R1000",category:"Amplifier",image:"https://www.technics.com/content/dam/pim/uk/en/SU/SU-R10/SU-R1000/ast-1263320.png.pub.thumb.644.644.png",summary:"Reference Class integrated amplification with digital signal architecture, phono facilities and high output power.",specs:["150W / 8Ω","300W / 4Ω","MM + MC","USB + XLR"]},
 {brand:"Sony",name:"WF‑1000XM6",category:"Earbuds",image:"https://sony.scene7.com/is/image/sonyglobalsolutions/WF-1000XM6_Image-Gallery_image01_d?$originalDimensions$=&fmt=png-alpha",summary:"Compact true-wireless flagship with advanced noise cancelling and high-resolution wireless support.",specs:["True wireless","ANC","Hi-res wireless","Compact fit"]},
 {brand:"MCQ Sourcing",name:"1210 & Turntable Essentials",category:"Hard-to-find",image:"https://unsplash.com/photos/D5iKflt76eU/download?force=true&w=1600",summary:"Needles, cartridges, phono leads, grounding, adapters and legacy accessories for turntable users.",specs:["Styli","Cartridges","RCA / phono","Legacy parts"]},
 {brand:"MCQ Pro",name:"Venue Audio Essentials",category:"Professional audio",image:"https://unsplash.com/photos/-oT4BM9PAQQ/download?force=true&w=1600",summary:"Professional leads, microphones, DI, adapters and practical audio components for venues and events.",specs:["XLR","Jack","Microphones","Adapters"]}
];

function render(){
 $("#featured-grid").innerHTML=products.map((p,i)=>`<article class="feature-product">
  <div class="feature-image"><img loading="${i<2?"eager":"lazy"}" src="${esc(p.image)}" alt="${esc(p.brand+" "+p.name)}"></div>
  <div class="feature-copy">
   <p class="eyebrow dark">${esc(p.brand)} / ${esc(p.category)}</p>
   <h2>${esc(p.name)}</h2>
   <p class="product-summary">${esc(p.summary)}</p>
   <div class="feature-meta">${p.specs.map(x=>`<span>${esc(x)}</span>`).join("")}</div>
   <div class="purchase-choice">
    <button data-action="Buy / reserve" data-product="${esc(p.brand+" "+p.name)}">Buy / reserve</button>
    <button class="secondary" data-action="Source for me" data-product="${esc(p.brand+" "+p.name)}">Source for me</button>
    <button class="secondary" data-action="Recommend alternative" data-product="${esc(p.brand+" "+p.name)}">Alternative</button>
   </div>
  </div>
 </article>`).join("");
 $$("[data-action]").forEach(b=>b.addEventListener("click",()=>openPurchase(b.dataset.product,b.dataset.action)));
}
const dialog=$("#purchase-dialog"), form=$("#purchase-form");
function openPurchase(product,action){
 form.reset();
 form.product.value=product;
 form.purchase_action.value=action;
 $("#purchase-title").textContent=product;
 $("#purchase-copy").textContent=action==="Buy / reserve"?"MCQ will confirm current price and stock before payment.":action==="Source for me"?"Tell MCQ what you need and we will source the item or closest match.":"Tell us the use case and budget and MCQ can suggest a suitable alternative.";
 $("#purchase-status").textContent="";
 dialog.showModal();
}
$(".purchase-close").onclick=()=>dialog.close();
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
$("[data-general-source]").onclick=()=>openPurchase("Specialist / hard-to-find audio item","Source for me");
form.addEventListener("submit",async e=>{
 e.preventDefault();
 const x=Object.fromEntries(new FormData(form));
 $("#purchase-status").textContent="Sending…";
 const details=[x.purchase_action,`Quantity: ${x.quantity}`,`Delivery: ${x.delivery}`,x.budget?`Budget: ${x.budget}`:"",x.message||""].filter(Boolean).join(". ");
 try{
  const row=await api("/api/leads",{method:"POST",body:JSON.stringify({
   name:x.name,contact:x.contact,phone:x.phone,interest:"Purchase request",product:x.product,budget:x.budget,message:details,source:"mcq-featured"
  })});
  $("#purchase-status").textContent=`Received — reference ${row.id}. MCQ will confirm price and availability.`;
 }catch(err){$("#purchase-status").textContent=err.message}
});
render();