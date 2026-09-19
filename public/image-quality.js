const PRODUCT_SELECTORS='.product-card,.product-row,.tile,.feature-product,.record-card,[data-product-card]';
function removeBadProductImage(img,reason){
  const card=img.closest(PRODUCT_SELECTORS);
  if(card){card.dataset.imageRejected=reason;card.remove();return}
  img.hidden=true;
  img.parentElement?.classList.add('media-failed');
}
function bindImage(img){
  if(img.dataset.qualityBound)return;
  img.dataset.qualityBound='1';
  img.addEventListener('error',()=>removeBadProductImage(img,'load-error'),{once:true});
  img.addEventListener('load',()=>{
    const required=img.matches('[data-product-image="required"],.product-media img,.product-row img,.feature-image img,.record-art img,.tile img');
    if(required&&(img.naturalWidth<500||img.naturalHeight<300)) removeBadProductImage(img,'resolution');
  },{once:true});
  if(img.complete){
    if(img.naturalWidth===0) removeBadProductImage(img,'load-error');
    else if(img.matches('[data-product-image="required"],.product-media img,.product-row img,.feature-image img,.record-art img,.tile img')&&(img.naturalWidth<500||img.naturalHeight<300)) removeBadProductImage(img,'resolution');
  }
}
function scan(root=document){root.querySelectorAll?.('img').forEach(bindImage)}
scan();
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.matches?.('img'))bindImage(n);scan(n)}))).observe(document.documentElement,{childList:true,subtree:true});
