// Supabase Edge Function: paratika-refund (can also be adapted for VOID)
// Calls Paratika REFUND/VOID and logs the result.
// Deploy with: supabase functions deploy paratika-refund --no-verify-jwt

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// Service role key (new name preferred)
const serviceKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SERVICE_ROLE_KEY") ||
  "";
const paratikaApi = Deno.env.get("PARATIKA_API_URL")!;
const merchantCode = Deno.env.get("PARATIKA_MERCHANT_CODE")!;
const merchantUser = Deno.env.get("PARATIKA_MERCHANT_USER")!;
const merchantPassword = Deno.env.get("PARATIKA_MERCHANT_PASSWORD")!;

// Validate environment variables
function validateEnvVars() {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!paratikaApi) missing.push("PARATIKA_API_URL");
  if (!merchantCode) missing.push("PARATIKA_MERCHANT_CODE");
  if (!merchantUser) missing.push("PARATIKA_MERCHANT_USER");
  if (!merchantPassword) missing.push("PARATIKA_MERCHANT_PASSWORD");
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

const supabase = createClient(supabaseUrl, serviceKey);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  
  try {
    // Validate environment variables
    validateEnvVars();
    
    const body = await req.json();
    const { pgTranId, amount, action = "REFUND", orderId } = body; // action can be REFUND or VOID

    if (!pgTranId) {
      return new Response(JSON.stringify({ success: false, error: "Missing pgTranId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Per Paratika API v2 documentation: use MERCHANT parameter
    const form = new URLSearchParams();
    form.append("MERCHANT", merchantCode);
    form.append("MERCHANTUSER", merchantUser);
    form.append("MERCHANTPASSWORD", merchantPassword);
    form.append("ACTION", action);
    form.append("PGTRANID", pgTranId);
    if (amount) form.append("AMOUNT", String(amount));

    console.log(`Paratika ${action} request for pgTranId: ${pgTranId}`);

    const res = await fetch(paratikaApi, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: form.toString(),
    });

    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Paratika response:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid response from Paratika API",
          responseText: responseText.substring(0, 500),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
    
    console.log(`Paratika ${action} response:`, JSON.stringify(data, null, 2));
  const success = data.responseCode === "00";

  await supabase.from("refunds").insert({
    order_id: orderId,
    pgtranid: pgTranId,
    amount,
    status: success ? "approved" : "failed",
    raw_response: data,
  });

  if (orderId) {
    await supabase
      .from("orders")
      .update({ status: success ? (action === "VOID" ? "voided" : "refunded") : "refund_failed", updated_at: new Date().toISOString() })
      .eq("order_id", orderId);
  }

    return new Response(
      JSON.stringify({ success, responseCode: data.responseCode, responseMsg: data.responseMsg, data }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("paratika-refund error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
