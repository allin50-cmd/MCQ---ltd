(()=>{
 const b64=window.MCQ_CLIENT_ART_B64||"";
 if(!b64)return;
 const src="data:image/webp;base64,"+b64;
 const positions=[
  ["IMG_5851","0%","0%"],["IMG_5852","33.333%","0%"],["IMG_5853","66.666%","0%"],["IMG_5855","100%","0%"],
  ["IMG_5857","0%","100%"],["IMG_5858","33.333%","100%"],["IMG_5860","66.666%","100%"],["IMG_5861","100%","100%"]
 ];

 const founding=document.getElementById("founding-art-grid");
 if(founding){
   founding.innerHTML=positions.map((p,i)=>'<figure class="founding-art founding-'+(i+1)+'"><div class="founding-image" role="img" aria-label="Client supplied MCQ Urban art photograph '+(i+1)+'" style="background-image:url('+src+');background-position:'+p[1]+' '+p[2]+'"></div><figcaption><b>Founding Gallery '+String(i+1).padStart(2,"0")+'</b><span>Client-supplied Urban art photography · '+p[0]+'</span></figcaption></figure>').join("");
 }

 const home=document.getElementById("home-urban-art");
 if(home){
   home.innerHTML=positions.map((p,i)=>'<a class="home-art-card" href="/urban-gallery#founding-gallery" aria-label="View client supplied Urban art '+(i+1)+'" style="background-image:url('+src+');background-position:'+p[1]+' '+p[2]+'"><span>CLIENT ART · '+p[0]+'</span></a>').join("");
 }

 const hero=document.getElementById("hero-client-art");
 if(hero){
   hero.style.backgroundImage='url('+src+')';
   hero.style.backgroundPosition='33.333% 0%';
 }
})();