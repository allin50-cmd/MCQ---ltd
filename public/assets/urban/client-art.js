(()=>{
 const b64=window.MCQ_CLIENT_ART_B64||"";
 const root=document.getElementById("founding-art-grid");
 if(!root||!b64)return;
 const src="data:image/webp;base64,"+b64;
 const positions=[
  ["IMG_5851","0%","0%"],["IMG_5852","33.333%","0%"],["IMG_5853","66.666%","0%"],["IMG_5855","100%","0%"],
  ["IMG_5857","0%","100%"],["IMG_5858","33.333%","100%"],["IMG_5860","66.666%","100%"],["IMG_5861","100%","100%"]
 ];
 root.innerHTML=positions.map((p,i)=>'<figure class="founding-art founding-'+(i+1)+'"><div class="founding-image" role="img" aria-label="Client supplied MCQ Urban art photograph '+(i+1)+'" style="background-image:url('+src+');background-position:'+p[1]+' '+p[2]+'"></div><figcaption><b>Founding Gallery '+String(i+1).padStart(2,"0")+'</b><span>Client-supplied Urban art photography · '+p[0]+'</span></figcaption></figure>').join("");
})();