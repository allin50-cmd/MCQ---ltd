const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

async function api(url,opt={}){
  const r=await fetch(url,{...opt,headers:{"content-type":"application/json",...(opt.headers||{})}});
  const t=await r.text();let d;try{d=t?JSON.parse(t):null}catch{d=t}
  if(!r.ok)throw new Error(d?.error||d?.message||"Request failed");
  return d;
}

let currentItems=[];
let view="ranked";

function card(item){
  const credit=item.artist_credit?"Artist: "+esc(item.artist_credit):"Artist credit not supplied";
  const place=item.location?esc(item.location):"Location not supplied";
  return '<article class="art-card rank-'+item.rank+'" data-id="'+esc(item.id)+'">'+
    '<div class="rank-badge">#'+item.rank+'</div>'+
    '<div class="art-media"><img src="'+esc(item.image_data)+'" alt="'+esc(item.title)+'" loading="lazy"></div>'+
    '<div class="art-copy">'+
      '<div class="art-meta">'+place+' · '+credit+'</div>'+
      '<h3>'+esc(item.title)+'</h3>'+
      '<p class="art-story">'+esc(item.story||"Submitted to the MCQ Urban Art Chart.")+'</p>'+
      '<div class="vote-row"><span class="vote-count">'+item.votes+' vote'+(item.votes===1?"":"s")+'</span><div>'+
      '<button class="report-btn" data-report="'+esc(item.id)+'">Report</button>'+
      '<button class="vote-btn" data-vote="'+esc(item.id)+'" data-title="'+esc(item.title)+'">Vote</button></div></div>'+
    '</div></article>';
}

async function loadChart(){
  const out=$("#art-chart");out.innerHTML='<div class="loading">Loading the Urban Art Chart…</div>';
  try{
    const d=await api("/api/urban/art/chart?limit=50");
    currentItems=d.items||[];
    const items=view==="new"?[...currentItems].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)):currentItems;
    out.innerHTML=items.length?items.map(card).join(""):'<div class="empty"><b>No approved public submissions yet.</b><br>Upload the first piece and it will enter the chart after moderation.</div>';
    bindChartActions();
  }catch(err){out.innerHTML='<div class="empty">Chart unavailable: '+esc(err.message)+'</div>'}
}
function bindChartActions(){
  $$("[data-vote]").forEach(b=>b.onclick=()=>openVote(b.dataset.vote,b.dataset.title));
  $$("[data-report]").forEach(b=>b.onclick=()=>reportArt(b.dataset.report));
}
$$("[data-view]").forEach(b=>b.onclick=()=>{
  $$("[data-view]").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  view=b.dataset.view;loadChart();
});
$("#refresh-chart").onclick=loadChart;

const voteDialog=$("#vote-dialog"),voteForm=$("#vote-form");
function openVote(id,title){
  voteForm.reset();voteForm.submission_id.value=id;$("#vote-title").textContent=title||"Vote";$("#vote-status").textContent="";
  voteDialog.showModal();
}
$(".close",voteDialog).onclick=()=>voteDialog.close();
voteDialog.addEventListener("click",e=>{if(e.target===voteDialog)voteDialog.close()});
voteForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const x=Object.fromEntries(new FormData(voteForm));$("#vote-status").textContent="Casting vote…";
  try{
    const d=await api("/api/urban/art/vote",{method:"POST",body:JSON.stringify(x)});
    $("#vote-status").textContent="Vote counted — "+d.votes+" total.";
    setTimeout(()=>{voteDialog.close();loadChart()},700);
  }catch(err){$("#vote-status").textContent=err.message}
});

async function reportArt(id){
  const reason=prompt("Why are you reporting this image?");if(!reason)return;
  try{await api("/api/urban/art/report",{method:"POST",body:JSON.stringify({submission_id:id,reason})});alert("Report received by MCQ.");}
  catch(err){alert(err.message)}
}

let preparedImage="";
const fileInput=$("#art-file"),preview=$("#art-preview"),dropCopy=$("#drop-copy");
fileInput.addEventListener("change",async()=>{
  const file=fileInput.files?.[0];preparedImage="";preview.hidden=true;dropCopy.hidden=false;
  if(!file)return;
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)){alert("Please choose a JPEG, PNG or WebP image.");fileInput.value="";return}
  try{
    preparedImage=await optimiseImage(file);
    preview.src=preparedImage;preview.hidden=false;dropCopy.hidden=true;
  }catch(err){alert(err.message);fileInput.value=""}
});

function optimiseImage(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("Could not read image"));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error("Could not open image"));
      img.onload=()=>{
        const max=1800,scale=Math.min(1,max/Math.max(img.width,img.height));
        const canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
        const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,canvas.width,canvas.height);
        let data=canvas.toDataURL("image/jpeg",0.86);
        if(data.length>4_000_000)data=canvas.toDataURL("image/jpeg",0.72);
        if(data.length>4_000_000)return reject(new Error("This image is still too large. Choose a smaller photo."));
        resolve(data);
      };
      img.src=String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

const uploadForm=$("#art-upload-form");
uploadForm.addEventListener("submit",async e=>{
  e.preventDefault();const status=$("#upload-status");
  if(!preparedImage){status.textContent="Choose a photo first.";return}
  const fd=new FormData(uploadForm);
  const payload={
    title:fd.get("title"),creator_name:fd.get("creator_name"),contact:fd.get("contact"),
    artist_credit:fd.get("artist_credit"),location:fd.get("location"),story:fd.get("story"),
    rights_declared:fd.get("rights_declared")==="on",image_data:preparedImage
  };
  status.textContent="Uploading to MCQ…";
  try{
    const d=await api("/api/urban/art/submissions",{method:"POST",body:JSON.stringify(payload)});
    status.textContent="Submitted. Reference "+d.id+". It will appear in the chart after MCQ moderation.";
    uploadForm.reset();preparedImage="";preview.hidden=true;preview.removeAttribute("src");dropCopy.hidden=false;
  }catch(err){status.textContent=err.message}
});

loadChart();
