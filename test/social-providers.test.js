import test from "node:test";
import assert from "node:assert/strict";
import {configuredMarketingProviders,verifyMarketingProviders} from "../src/social-providers.js";

test("marketing providers fail closed without credentials",async()=>{
  const status=configuredMarketingProviders({});
  assert.equal(status.meta.configured,false);
  assert.equal(status.linkedin.configured,false);
  assert.equal(status.tiktok.configured,false);

  const verified=await verifyMarketingProviders({env:{},fetchImpl:async()=>{throw new Error("should not call fetch")}});
  assert.equal(verified.providers.meta.connection,"NOT CONNECTED");
  assert.equal(verified.providers.linkedin.connection,"NOT CONNECTED");
  assert.equal(verified.providers.tiktok.connection,"NOT CONNECTED");
  assert.equal(verified.implementation_ready.facebook_publish,false);
  assert.equal(verified.implementation_ready.instagram_publish,false);
  assert.equal(verified.implementation_ready.meta_ads,false);
  assert.equal(verified.implementation_ready.linkedin_publish,false);
  assert.equal(verified.implementation_ready.linkedin_ads,false);
  assert.equal(verified.implementation_ready.tiktok_publish,false);
  assert.equal(verified.implementation_ready.tiktok_ads,false);
});

test("Meta capabilities require verified granted permissions",async()=>{
  const env={
    META_ACCESS_TOKEN:"test",
    META_PAGE_ID:"123",
    INSTAGRAM_BUSINESS_ACCOUNT_ID:"456",
    META_AD_ACCOUNT_ID:"act_789"
  };
  const fetchImpl=async()=>({
    ok:true,
    async json(){return {data:[
      {permission:"pages_manage_posts",status:"granted"},
      {permission:"pages_read_engagement",status:"granted"},
      {permission:"instagram_basic",status:"granted"},
      {permission:"instagram_content_publish",status:"granted"},
      {permission:"ads_management",status:"granted"}
    ]}}
  });
  const out=await verifyMarketingProviders({env,fetchImpl});
  assert.equal(out.implementation_ready.facebook_publish,true);
  assert.equal(out.implementation_ready.instagram_publish,true);
  assert.equal(out.implementation_ready.meta_ads,true);
});

test("LinkedIn and TikTok readiness require identity plus declared granted scopes",async()=>{
  const env={
    LINKEDIN_ACCESS_TOKEN:"li-token",
    LINKEDIN_ORGANIZATION_URN:"urn:li:organization:123",
    LINKEDIN_AD_ACCOUNT_ID:"456",
    LINKEDIN_GRANTED_SCOPES:"w_organization_social rw_ads",
    TIKTOK_ACCESS_TOKEN:"tt-token",
    TIKTOK_ADVERTISER_ID:"789",
    TIKTOK_GRANTED_SCOPES:"video.publish ads.management"
  };
  const fetchImpl=async (url)=>{
    if(String(url).includes("linkedin.com"))return {ok:true,json:async()=>({sub:"member-1"})};
    if(String(url).includes("tiktokapis.com"))return {ok:true,json:async()=>({data:{creator_username:"mcq",privacy_level_options:["PUBLIC_TO_EVERYONE"]}})};
    throw new Error("unexpected URL");
  };
  const out=await verifyMarketingProviders({fetchImpl,env});
  assert.equal(out.implementation_ready.linkedin_publish,true);
  assert.equal(out.implementation_ready.linkedin_ads,true);
  assert.equal(out.implementation_ready.tiktok_publish,true);
  assert.equal(out.implementation_ready.tiktok_ads,true);
});

test("invalid credentials never become implementation ready",async()=>{
  const fetchImpl=async()=>({ok:false,status:401,json:async()=>({error:{message:"invalid token"}})});
  const out=await verifyMarketingProviders({fetchImpl,env:{META_ACCESS_TOKEN:"bad",LINKEDIN_ACCESS_TOKEN:"bad",TIKTOK_ACCESS_TOKEN:"bad"}});
  assert.equal(Object.values(out.implementation_ready).some(Boolean),false);
  assert.equal(out.providers.meta.connection,"ERROR");
  assert.equal(out.providers.linkedin.connection,"ERROR");
  assert.equal(out.providers.tiktok.connection,"ERROR");
});
