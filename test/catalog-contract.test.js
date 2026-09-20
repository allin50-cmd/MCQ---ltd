import test from "node:test";
import assert from "node:assert/strict";
import {evaluateCatalogRow,CATALOG_STATES,IMAGE_PERMISSION_STATES,commercialMetrics} from "../src/catalog_contract.js";

function completeRow(overrides={}){
  return {
    id:"test-ddj",
    brand:"Test Brand",
    model:"Exact Model",
    name:"Exact Model",
    category:"dj",
    requested_state:CATALOG_STATES.AVAILABLE_TO_ORDER,
    images:[{
      url:"https://manufacturer.example/product.jpg",
      source:"manufacturer media library",
      permission_status:IMAGE_PERMISSION_STATES.MANUFACTURER_AUTHORISED,
      verified:true,
      width:1600,
      height:1200
    }],
    supplier:"Approved Supplier",
    supplier_sku:"SKU-123",
    real_availability:"IN_STOCK",
    availability_checked_at:"2026-09-20T05:00:00Z",
    availability_evidence_url:"https://supplier.example/product",
    real_cost_price_ex_vat_gbp:200,
    delivery_cost_ex_vat_gbp:10,
    mcq_retail_price_inc_vat_gbp:360,
    cost_evidence_url:"https://supplier.example/account-quote",
    source_url:"https://supplier.example/product",
    source_note:"Account-specific supplier quote and availability checked.",
    last_checked:"2026-09-20T05:00:00Z",
    observed_public_price_inc_vat_gbp:399,
    ...overrides
  };
}

test("complete real row may become AVAILABLE_TO_ORDER",()=>{
  const x=evaluateCatalogRow(completeRow());
  assert.equal(x.state,CATALOG_STATES.AVAILABLE_TO_ORDER);
  assert.equal(x.public_display,true);
  assert.equal(x.sellable,true);
  assert.deepEqual(x.validation.common_errors,[]);
  assert.deepEqual(x.validation.sellable_errors,[]);
});

test("image permission is non-blocking during development",()=>{
  const row=completeRow();
  row.images[0].permission_status=IMAGE_PERMISSION_STATES.UNVERIFIED;
  const x=evaluateCatalogRow(row);
  assert.equal(x.state,CATALOG_STATES.AVAILABLE_TO_ORDER);
  assert.equal(x.public_display,true);
  assert.equal(x.sellable,true);
  assert.deepEqual(x.validation.common_errors,[]);
});

test("modelled cost can never substitute for real sellable cost",()=>{
  const x=evaluateCatalogRow(completeRow({
    real_cost_price_ex_vat_gbp:null,
    estimated_trade_cost_ex_vat_gbp:200
  }));
  assert.equal(x.state,CATALOG_STATES.DRAFT);
  assert.equal(x.sellable,false);
  assert.ok(x.validation.sellable_errors.includes("real_cost_price_ex_vat_gbp"));
});

test("IN_STOCK_MCQ requires evidenced MCQ-held quantity",()=>{
  const x=evaluateCatalogRow(completeRow({
    requested_state:CATALOG_STATES.IN_STOCK_MCQ,
    mcq_stock_quantity:0,
    mcq_stock_evidence_note:""
  }));
  assert.equal(x.state,CATALOG_STATES.DRAFT);
  assert.equal(x.sellable,false);
  assert.ok(x.validation.sellable_errors.includes("mcq_stock_quantity"));
});

test("commercial metrics preserve planning labels separately from real cost",()=>{
  const m=commercialMetrics({
    observed_public_price_inc_vat_gbp:120,
    estimated_trade_cost_ex_vat_gbp:60,
    delivery_cost_inc_vat_gbp:12,
    suggested_mcq_retail_inc_vat_gbp:120
  });
  assert.equal(m.public_net_ex_vat_gbp,100);
  assert.equal(m.estimated_trade_cost_ex_vat_gbp,60);
  assert.equal(m.estimated_landed_cost_ex_vat_gbp,70);
  assert.equal(m.max_buy_cost_ex_vat_at_target_gm_gbp,65);
  assert.equal(m.required_supplier_discount_vs_public_net,0.35);
});
