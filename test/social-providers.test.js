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
