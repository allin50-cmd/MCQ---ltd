const normalizeScopes=v=>new Set(String(v||"").split(/[ ,]+/).map(s=>s.trim()).filter(Boolean));

async function jsonFetch(fetchImpl,url,options={}){
  const r=await fetchImpl(url,{...options,signal:AbortSignal.timeout(10000)});
  let data={};try{data=await r.json()}catch{}
  if(!r.ok)throw new Error(data?.error?.message||data?.message||("HTTP "+r.status));
  return data;
}

export function configuredMarketingProviders(env=process.env){
  return {
    meta:{
      configured:Boolean(env.META_ACCESS_TOKEN&&env.META_PAGE_ID),
      instagram_configured:Boolean(env.META_ACCESS_TOKEN&&env.INSTAGRAM_BUSINESS_ACCOUNT_ID),
      ads_configured:Boolean(env.META_ACCESS_TOKEN&&env.META_AD_ACCOUNT_ID)
    },
    linkedin:{
      configured:Boolean(env.LINKEDIN_ACCESS_TOKEN&&env.LINKEDIN_ORGANIZATION_URN),
      ads_configured:Boolean(env.LINKEDIN_ACCESS_TOKEN&&env.LINKEDIN_AD_ACCOUNT_ID)
    },
    tiktok:{
      configured:Boolean(env.TIKTOK_ACCESS_TOKEN),
      ads_configured:Boolean(env.TIKTOK_ACCESS_TOKEN&&env.TIKTOK_ADVERTISER_ID)
    }
  };
}

async function verifyMeta(fetchImpl,env){
  const out={provider:"meta",connection:"NOT CONNECTED",publish:false,instagram_publish:false,ads:false,evidence:[],error:null};
  if(!env.META_ACCESS_TOKEN)return out;
  try{
    const perms=await jsonFetch(fetchImpl,"https://graph.facebook.com/v23.0/me/permissions?access_token="+encodeURIComponent(env.META_ACCESS_TOKEN));
    const granted=new Set((perms.data||[]).filter(x=>x.status==="granted").map(x=>x.permission));
    out.connection="CONNECTED";
    out.publish=Boolean(env.META_PAGE_ID&&granted.has("pages_manage_posts")&&granted.has("pages_read_engagement"));
    out.instagram_publish=Boolean(env.INSTAGRAM_BUSINESS_ACCOUNT_ID&&granted.has("instagram_basic")&&granted.has("instagram_content_publish"));
    out.ads=Boolean(env.META_AD_ACCOUNT_ID&&granted.has("ads_management"));
    out.evidence=[...granted];
    return out;
  }catch(e){out.connection="ERROR";out.error=String(e.message||e);return out}
}

async function verifyLinkedIn(fetchImpl,env){
  const out={provider:"linkedin",connection:"NOT CONNECTED",publish:false,ads:false,evidence:[],error:null};
  if(!env.LINKEDIN_ACCESS_TOKEN)return out;
  try{
    const who=await jsonFetch(fetchImpl,"https://api.linkedin.com/v2/userinfo",{headers:{Authorization:"Bearer "+env.LINKEDIN_ACCESS_TOKEN}});
    out.connection="CONNECTED";
    out.evidence=who.sub?["member:"+who.sub]:[];
    const scopes=normalizeScopes(env.LINKEDIN_GRANTED_SCOPES);
    out.publish=Boolean(env.LINKEDIN_ORGANIZATION_URN&&scopes.has("w_organization_social"));
    out.ads=Boolean(env.LINKEDIN_AD_ACCOUNT_ID&&scopes.has("rw_ads"));
    return out;
  }catch(e){out.connection="ERROR";out.error=String(e.message||e);return out}
}

async function verifyTikTok(fetchImpl,env){
  const out={provider:"tiktok",connection:"NOT CONNECTED",publish:false,ads:false,evidence:[],error:null};
  if(!env.TIKTOK_ACCESS_TOKEN)return out;
  try{
    const creator=await jsonFetch(fetchImpl,"https://open.tiktokapis.com/v2/post/publish/creator_info/query/",{
      method:"POST",
      headers:{Authorization:"Bearer "+env.TIKTOK_ACCESS_TOKEN,"Content-Type":"application/json; charset=UTF-8"},
      body:"{}"
    });
    out.connection="CONNECTED";
    out.publish=Boolean(creator?.data?.creator_username||creator?.data?.privacy_level_options);
    out.evidence=creator?.data?.creator_username?["creator:"+creator.data.creator_username]:["creator_info_ok"];
    const scopes=normalizeScopes(env.TIKTOK_GRANTED_SCOPES);
    out.ads=Boolean(env.TIKTOK_ADVERTISER_ID&&scopes.has("ads.management"));
    return out;
  }catch(e){out.connection="ERROR";out.error=String(e.message||e);return out}
}

export async function verifyMarketingProviders({fetchImpl=fetch,env=process.env}={}){
  const [meta,linkedin,tiktok]=await Promise.all([
    verifyMeta(fetchImpl,env),verifyLinkedIn(fetchImpl,env),verifyTikTok(fetchImpl,env)
  ]);
  return {
    generated_at:new Date().toISOString(),
    providers:{meta,linkedin,tiktok},
    implementation_ready:{
      facebook_publish:meta.publish,
      instagram_publish:meta.instagram_publish,
      meta_ads:meta.ads,
      linkedin_publish:linkedin.publish,
      linkedin_ads:linkedin.ads,
      tiktok_publish:tiktok.publish,
      tiktok_ads:tiktok.ads
    },
    rule:"No publish or ad action may execute unless the required capability is verified and HITL approval has been recorded."
  };
}
