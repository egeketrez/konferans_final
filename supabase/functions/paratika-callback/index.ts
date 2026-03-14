// Supabase Edge Function: paratika-callback
// Handles Paratika payment callback and redirects user to success/failure page.
// Includes fallback verification via QUERYTRANSACTION if callback data is unclear.
// Deploy with: supabase functions deploy paratika-callback --no-verify-jwt

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || ""
);

// Base URL for redirects
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://royalasamble.korurotaract.com";

// Paratika API credentials for fallback verification
const paratikaApi = Deno.env.get("PARATIKA_API_URL");
const merchantCode = Deno.env.get("PARATIKA_MERCHANT_CODE");
// Use query-specific credentials if available (with QUERYTRANSACTION permission)
const queryMerchantUser = Deno.env.get("PARATIKA_QUERY_MERCHANT_USER") || Deno.env.get("PARATIKA_MERCHANT_USER");
const queryMerchantPassword = Deno.env.get("PARATIKA_QUERY_MERCHANT_PASSWORD") || Deno.env.get("PARATIKA_MERCHANT_PASSWORD");

// Fallback verification: Query Paratika to confirm payment status
interface VerificationResult {
  success: boolean;
  pgTranId?: string;
  pgOrderId?: string;
  amount?: number;
  installmentCount?: number;
  cardMask?: string;
  cardType?: string;
  cardIssuer?: string;
  currency?: string;
  // Receipt/Proof fields
  approvalCode?: string;
  traceAudit?: string;
  settlementId?: string;
  bankReturnCode?: string;
  commissionRate?: number;
  paratikaFee?: number;
  netAmount?: number;
  is3DSecure?: boolean;
  merchantPaymentDate?: string;
}

// NON-PAYMENT transaction types to EXCLUDE when verifying actual payments
// These are auxiliary queries, NOT actual payment transactions:
// - QUERYPOINTS: Loyalty points balance check
// - QUERYCAMPAIGNONLINE: Campaign/discount availability check
// - QUERYTRANSACTION, QUERYMERCHANT, BIN: Information queries
const NON_PAYMENT_TYPES = [
  "QUERYPOINTS", 
  "QUERYCAMPAIGNONLINE", 
  "QUERYTRANSACTION", 
  "QUERYMERCHANT",
  "QUERYCAMPAIGN",
  "BIN",
];

// Actual payment transaction types (English and Turkish)
// Paratika can return transaction types in Turkish: "Satış" = "SALE"
const PAYMENT_TYPE_PATTERNS = [
  "SALE", "SATIŞ", "SATIS", // Sale
  "AUTH", "OTORİZASYON", "OTORIZASYON", // Authorization
  "PREAUTH", "ÖN OTORİZASYON", "ON OTORIZASYON", // Pre-auth
  "POSTAUTH", "SON OTORİZASYON", // Post-auth
  "CAPTURE", "KAPAMA", // Capture
  "DIRECTPOST3D", "3DAUTH", "3D AUTH", // 3D Secure
  "REFUND", "İADE", "IADE", // Refund
  "VOID", "İPTAL", "IPTAL", // Void
  "", // Empty string can also be a payment
];

async function verifyPaymentWithParatika(orderId: string, requestId: string): Promise<VerificationResult> {
  if (!paratikaApi || !merchantCode || !queryMerchantUser || !queryMerchantPassword) {
    console.log(`[${requestId}] Fallback verification skipped - missing Paratika credentials`);
    return { success: false };
  }

  try {
    console.log(`[${requestId}] QUERYTRANSACTION: Verifying payment for order ${orderId}...`);
    
    const form = new URLSearchParams();
    form.append("MERCHANT", merchantCode);
    form.append("MERCHANTUSER", queryMerchantUser);
    form.append("MERCHANTPASSWORD", queryMerchantPassword);
    form.append("ACTION", "QUERYTRANSACTION");
    form.append("MERCHANTPAYMENTID", orderId);

    const response = await fetch(paratikaApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: form.toString(),
    });

    const data = await response.json();
    console.log(`[${requestId}] QUERYTRANSACTION response:`, JSON.stringify(data).substring(0, 800));

    if (data.responseCode === "00" && data.transactionList?.length > 0) {
      // IMPORTANT: Filter to ONLY actual payment transactions
      // QUERYPOINTS, QUERYCAMPAIGNONLINE etc. are NOT payments!
      const paymentTransactions = data.transactionList.filter((tx: any) => {
        const txType = (tx.transactionType || tx.action || tx.type || "").toUpperCase().trim();
        const txStatus = (tx.transactionStatus || "").toUpperCase();
        const returnCode = tx.pgTranReturnCode || tx.responseCode || "";
        const amount = tx.amount || 0;
        
        // Explicitly exclude non-payment types
        if (NON_PAYMENT_TYPES.includes(txType)) {
          console.log(`[${requestId}] Excluding non-payment TX: ${txType}`);
          return false;
        }
        
        // Include if it matches payment type patterns
        const isPaymentType = PAYMENT_TYPE_PATTERNS.some(pattern => 
          txType.includes(pattern.toUpperCase()) || pattern.toUpperCase().includes(txType)
        );
        
        // Also include if it has amount > 0 and approved status (likely a payment)
        const hasPaymentIndicators = amount > 0 && (
          txStatus === "AP" || 
          returnCode === "00" ||
          txStatus === "APPROVED" ||
          txStatus === "ONAYLANDI"
        );
        
        return isPaymentType || hasPaymentIndicators;
      });

      console.log(`[${requestId}] Found ${paymentTransactions.length} actual payment transactions (filtered ${data.transactionList.length - paymentTransactions.length} non-payment queries)`);

      if (paymentTransactions.length === 0) {
        console.log(`[${requestId}] ⚠️ No actual PAYMENT transactions found - only auxiliary queries exist`);
        return { success: false };
      }

      // Find successful PAYMENT transaction
      // - transactionStatus: "AP" = Approved
      // - pgTranReturnCode: "00" = Bank success code
      // - amount > 0 = Has payment amount
      const successfulTx = paymentTransactions.find((tx: any) => {
        const isApproved = tx.transactionStatus === "AP";
        const isSuccessCode = tx.responseCode === "00" || tx.pgTranReturnCode === "00";
        const hasAmount = tx.amount && tx.amount > 0;
        
        console.log(`[${requestId}] Checking TX ${tx.pgOrderId || tx.transactionType}: status=${tx.transactionStatus}, code=${tx.pgTranReturnCode}, amount=${tx.amount}`);
        
        return (isApproved || isSuccessCode) && hasAmount;
      });

      if (successfulTx) {
        console.log(`[${requestId}] ✓ VERIFIED: Found SUCCESSFUL ${successfulTx.transactionType || 'SALE'} payment!`);
        console.log(`[${requestId}] Transaction: type=${successfulTx.transactionType}, status=${successfulTx.transactionStatus}, amount=${successfulTx.amount}, code=${successfulTx.pgTranReturnCode}`);
        return {
          success: true,
          pgTranId: successfulTx.pgOrderId || successfulTx.pgTranId || successfulTx.transactionId,
          pgOrderId: successfulTx.pgOrderId,
          amount: successfulTx.amount,
          installmentCount: successfulTx.installmentCount || successfulTx.numberOfInstallments || 1,
          cardMask: successfulTx.panLast4 ? `****${successfulTx.panLast4}` : successfulTx.maskedPan,
          cardType: successfulTx.cardProgram || successfulTx.cardType,
          cardIssuer: successfulTx.issuer || successfulTx.issuingBank,
          currency: successfulTx.currency || "TRY",
          approvalCode: successfulTx.pgTranApprCode,
          traceAudit: successfulTx.pgTranTraceAudit,
          settlementId: successfulTx.pgTranSettleId,
          bankReturnCode: successfulTx.pgTranReturnCode,
          commissionRate: successfulTx.merchantCommissionRate,
          paratikaFee: successfulTx.amountToBePaidToParatika,
          netAmount: successfulTx.commissionAmountToBePaidToMerchant,
          is3DSecure: successfulTx.is3d === true || successfulTx.secure3d === true,
          merchantPaymentDate: successfulTx.merchantPaymentDate,
        };
      } else {
        // Found payment transactions but none approved
        const latestTx = paymentTransactions[0];
        console.log(`[${requestId}] ⚠️ Payment transaction found but NOT approved: status=${latestTx.transactionStatus}, code=${latestTx.pgTranReturnCode}`);
      }
    }

    console.log(`[${requestId}] ✗ QUERYTRANSACTION: No successful payment found`);
    return { success: false };
  } catch (error) {
    console.error(`[${requestId}] QUERYTRANSACTION error:`, error);
    return { success: false };
  }
}

// Generate HTML redirect page
function generateRedirectHtml(url: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=${url}">
  <title>${message}</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .container { text-align: center; padding: 2rem; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    a { color: #3498db; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>${message}</p>
    <p><a href="${url}">Yönlendirilmiyorsanız buraya tıklayın</a></p>
  </div>
  <script>window.location.href = "${url}";</script>
</body>
</html>`;
}

serve(async (req) => {
  const requestId = `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const url = new URL(req.url);

    // Handle OPTIONS for CORS
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Collect ALL parameters from multiple sources
    const params: Record<string, string> = {};

    // 1. Parse query parameters first (works for GET and POST)
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      params[key.toUpperCase()] = value; // Also store uppercase version
    });

    // 2. Parse body for POST requests
    if (req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";
      const bodyText = await req.text();

      console.log(`[${requestId}] POST received:`, {
        contentType,
        bodyLength: bodyText.length,
        bodyPreview: bodyText.substring(0, 500),
      });

      // Try URL-encoded form data first (most common for Paratika)
      if (contentType.includes("form-urlencoded") || !contentType.includes("json")) {
      try {
        const urlParams = new URLSearchParams(bodyText);
        urlParams.forEach((value, key) => {
          params[key] = value;
            params[key.toUpperCase()] = value; // Also store uppercase version
        });
          console.log(`[${requestId}] Parsed as form-urlencoded:`, Object.keys(params));
      } catch (e) {
          console.error(`[${requestId}] Form parse failed:`, e);
        }
      }

        // Try JSON as fallback
      if (contentType.includes("json") || Object.keys(params).length === 0) {
        try {
          const jsonData = JSON.parse(bodyText);
          Object.entries(jsonData).forEach(([key, value]) => {
            if (typeof value === "string" || typeof value === "number") {
              params[key] = String(value);
              params[key.toUpperCase()] = String(value);
            }
          });
          console.log(`[${requestId}] Parsed as JSON:`, Object.keys(params));
        } catch (e) {
          console.log(`[${requestId}] JSON parse failed (not JSON):`, e);
        }
      }
    } else if (req.method === "GET") {
      console.log(`[${requestId}] GET received with params:`, Object.keys(params));
    } else {
      return new Response("Method not allowed", { status: 405 });
    }

    // Log all received parameters (sanitized)
    console.log(`[${requestId}] All params:`, {
      keys: Object.keys(params),
      hasORDERID: !!params.ORDERID,
      hasOrderId: !!params.orderId,
      hasMERCHANTPAYMENTID: !!params.MERCHANTPAYMENTID,
      hasRESPONSECODE: !!params.RESPONSECODE,
    });

    // Extract parameters with multiple fallbacks (Paratika uses UPPERCASE)
    const orderId = 
      params.MERCHANTPAYMENTID || 
      params.merchantpaymentid ||
      params.ORDERID || 
      params.orderId || 
      params.orderid ||
      params.ORDER_ID ||
      "";
    
    const responseCode = 
      params.RESPONSECODE || 
      params.responseCode || 
      params.ResponseCode ||
      params.response_code ||
      "";
    
    const responseMsg = 
      params.RESPONSEMSG || 
      params.responseMsg || 
      params.ResponseMsg ||
      "";
    
    const pgTranId = 
      params.PGTRANID || 
      params.pgTranId || 
      params.PgTranId ||
      params.pgtranid ||
      "";
    
    const amount = 
      params.AMOUNT || 
      params.amount || 
      params.Amount ||
      "";
    
    const errorCode = 
      params.ERRORCODE || 
      params.errorCode || 
      params.ErrorCode ||
      "";
    
    const errorMsg = 
      params.ERRORMSG || 
      params.errorMsg || 
      params.ErrorMsg ||
      "";
    
    const hashData = 
      params.HASH || 
      params.hash ||
      "";

    // Additional payment details (installments, card info)
    const installmentCount = 
      params.INSTALLMENTCOUNT || 
      params.installmentCount || 
      params.NUMBEROFINSTALLMENTS ||
      params.numberOfInstallments ||
      params.INSTALLMENTS ||
      params.installments ||
      params.TAKSITSAYISI ||
      params.taksitSayisi ||
      params.NUMOFINSTALLMENTS ||
      params.numOfInstallments ||
      "1";
    
    const cardMask = 
      params.CARDMASK || 
      params.cardMask || 
      params.MASKEDPAN ||
      params.maskedPan ||
      params.PANMASK ||
      "";
    
    const cardHolderName = 
      params.CARDHOLDERNAME || 
      params.cardHolderName || 
      params.NAMEONCARD ||
      "";
    
    const cardType = 
      params.CARDTYPE || 
      params.cardType || 
      params.CARDPROGRAM ||
      params.cardProgram ||
      params.CARDNETWORK ||
      "";
    
    const cardIssuer = 
      params.CARDISSUER || 
      params.cardIssuer || 
      params.ISSUINGBANK ||
      params.issuingBank ||
      params.ISSUER ||
      params.issuer ||
      "";
    
    const currency = 
      params.CURRENCY || 
      params.currency || 
      "TRY";

    // Receipt/Proof fields (for legal and accounting purposes)
    const pgOrderId = 
      params.PGORDERID || 
      params.pgOrderId || 
      params.PgOrderId ||
      "";
    
    const approvalCode = 
      params.PGTRANAPPCODE || 
      params.pgTranApprCode || 
      params.APPROVALCODE ||
      params.approvalCode ||
      params.AUTHCODE ||
      "";
    
    const traceAudit = 
      params.PGTRANTRACEAUDIT || 
      params.pgTranTraceAudit || 
      "";
    
    const settlementId = 
      params.PGTRANSETTLEID || 
      params.pgTranSettleId || 
      "";
    
    const bankReturnCode = 
      params.PGTRANRETURNCODE || 
      params.pgTranReturnCode || 
      "";
    
    const commissionRate = 
      params.MERCHANTCOMMISSIONRATE || 
      params.merchantCommissionRate || 
      "";
    
    const paratikaFee = 
      params.AMOUNTTOBEPAIDTOPARATIKA || 
      params.amountToBePaidToParatika || 
      "";
    
    const netAmount = 
      params.COMMISSIONAMOUNTTOBEPAIDTOMERCHANT || 
      params.commissionAmountToBePaidToMerchant || 
      "";
    
    const is3DSecure = 
      params.IS3D === "true" || 
      params.is3d === "true" ||
      params.SECURE3D === "true" ||
      params.secure3d === "true" ||
      false;
    
    const transactionType = 
      params.TRANSACTIONTYPE || 
      params.transactionType || 
      params.ACTION ||
      "SALE";

    // Log parsed values
    console.log(`[${requestId}] Parsed values:`, {
      orderId: orderId || "(empty)",
      responseCode: responseCode || "(empty)",
      pgTranId: pgTranId || "(empty)",
      hasAmount: !!amount,
      hasHash: !!hashData,
      installmentCount,
      cardMask: cardMask ? "***" : "(empty)",
      cardType: cardType || "(empty)",
    });

    // Handle missing order ID
    if (!orderId) {
      console.error(`[${requestId}] ⚠️ MISSING ORDER ID - Full params:`, JSON.stringify(params, null, 2));
      
      // Try to find ANY order-like parameter
      const possibleOrderKeys = Object.keys(params).filter(k => 
        k.toLowerCase().includes('order') || 
        k.toLowerCase().includes('payment') ||
        k.toLowerCase().includes('merchant')
      );
      console.log(`[${requestId}] Possible order keys found:`, possibleOrderKeys);

      // If we have a response code of 00, payment might have succeeded but we can't match it
      if (responseCode === "00") {
        console.error(`[${requestId}] ⚠️ CRITICAL: Payment SUCCESS (code 00) but no order ID!`);
        // Store this for manual review
        try {
          await supabase.from("transactions").insert({
            order_id: `UNKNOWN_${requestId}`,
            pgtranid: pgTranId || null,
            response_code: responseCode,
            response_msg: "SUCCESS but missing order ID - needs manual review",
            raw_response: params,
            captured_amount: amount ? parseFloat(amount) : null,
            installment_count: parseInt(installmentCount) || 1,
            card_mask: cardMask || null,
            card_holder_name: cardHolderName || null,
            card_type: cardType || null,
            card_issuer: cardIssuer || null,
            currency: currency || "TRY",
          });
        } catch (e) {
          console.error(`[${requestId}] Failed to log unknown transaction:`, e);
        }
      }

      const failureUrl = `${FRONTEND_URL}/payment/failure?error=missing_order`;
      return new Response(generateRedirectHtml(failureUrl, "Yönlendiriliyor..."), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Determine success (responseCode "00" = success)
    const isSuccess = responseCode === "00";
    console.log(`[${requestId}] Payment ${isSuccess ? "SUCCESS" : "FAILED"} for order ${orderId}`);

    // Check idempotency - avoid duplicate processing
    if (pgTranId) {
      const { data: existingTx } = await supabase
        .from("transactions")
        .select("id")
        .eq("pgtranid", pgTranId)
        .single();

      if (existingTx) {
        console.log(`[${requestId}] Duplicate callback for pgTranId ${pgTranId} - redirecting`);
        const redirectUrl = isSuccess
          ? `${FRONTEND_URL}/payment/success?orderId=${encodeURIComponent(orderId)}&txId=${encodeURIComponent(pgTranId)}`
          : `${FRONTEND_URL}/payment/failure?orderId=${encodeURIComponent(orderId)}&code=${encodeURIComponent(responseCode)}&msg=${encodeURIComponent(responseMsg || errorMsg)}`;

        return new Response(generateRedirectHtml(redirectUrl, isSuccess ? "Ödeme başarılı!" : "Yönlendiriliyor..."), {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }

    // Store transaction record with full payment details + receipt/proof fields
    try {
      const { error: txError } = await supabase.from("transactions").insert({
        order_id: orderId,
        pgtranid: pgTranId || null,
        response_code: responseCode,
        response_msg: responseMsg || errorMsg || (isSuccess ? "Approved" : "Declined"),
        raw_response: params,
        captured_amount: amount ? parseFloat(amount) : null,
        installment_count: parseInt(installmentCount) || 1,
        card_mask: cardMask || null,
        card_holder_name: cardHolderName || null,
        card_type: cardType || null,
        card_issuer: cardIssuer || null,
        currency: currency || "TRY",
        // Receipt/Proof fields for legal and accounting
        pg_order_id: pgOrderId || null,
        approval_code: approvalCode || null,
        trace_audit: traceAudit || null,
        settlement_id: settlementId || null,
        bank_return_code: bankReturnCode || null,
        commission_rate: commissionRate ? parseFloat(commissionRate) : null,
        paratika_fee: paratikaFee ? parseFloat(paratikaFee) : null,
        net_amount: netAmount ? parseFloat(netAmount) : null,
        transaction_type: transactionType || "SALE",
        is_3d_secure: is3DSecure,
      });

      if (txError) {
        console.error(`[${requestId}] Transaction insert error:`, txError);
      } else {
        console.log(`[${requestId}] Transaction recorded with receipt details:`, {
          orderId,
          amount,
          approvalCode: approvalCode || "(none)",
          installments: installmentCount,
          cardType,
          is3D: is3DSecure,
        });
      }
    } catch (dbError) {
      console.error(`[${requestId}] Transaction insert exception:`, dbError);
    }

    // CRITICAL: Always verify with QUERYTRANSACTION to confirm actual payment status
    // The callback responseCode "00" is NOT reliable - we MUST check if a SALE transaction was approved
    // QUERYPOINTS and QUERYCAMPAIGNONLINE can return "00" but they're NOT payments!
    
    let realAmount = amount ? parseFloat(amount) : null;
    let realInstallments = parseInt(installmentCount) || 1;
    let verifiedSuccess = false;
    let verificationResult: VerificationResult = { success: false };
    
    // Always try to verify with QUERYTRANSACTION
    if (orderId) {
      try {
        console.log(`[${requestId}] 🔍 CRITICAL: Verifying actual payment status with QUERYTRANSACTION...`);
        verificationResult = await verifyPaymentWithParatika(orderId, requestId);
        
        if (verificationResult.success && verificationResult.amount) {
          verifiedSuccess = true;
          realAmount = verificationResult.amount;
          realInstallments = verificationResult.installmentCount || realInstallments;
          console.log(`[${requestId}] ✓ VERIFIED SUCCESS: Real amount: ${realAmount} TRY, installments: ${realInstallments}`);
          
          // Update transaction with real amount from QUERYTRANSACTION
          if (pgTranId) {
            await supabase
              .from("transactions")
              .update({
                captured_amount: realAmount,
                installment_count: realInstallments,
                card_mask: verificationResult.cardMask || cardMask || null,
                card_type: verificationResult.cardType || cardType || null,
                card_issuer: verificationResult.cardIssuer || cardIssuer || null,
                approval_code: verificationResult.approvalCode || approvalCode || null,
                net_amount: verificationResult.netAmount || null,
                commission_rate: verificationResult.commissionRate || null,
              })
              .eq("pgtranid", pgTranId);
            console.log(`[${requestId}] Transaction record updated with verified data`);
          }
        } else {
          console.log(`[${requestId}] ⚠️ QUERYTRANSACTION did NOT find approved payment`);
          
          // If callback said success but QUERYTRANSACTION says no approved payment,
          // this means the callback was for something else (like QUERYPOINTS)
          if (isSuccess) {
            console.log(`[${requestId}] ⚠️ MISMATCH: Callback said success but no verified SALE found - treating as PENDING`);
          }
        }
      } catch (verifyError) {
        console.error(`[${requestId}] QUERYTRANSACTION verification error:`, verifyError);
        // If verification fails, fall back to callback data (but mark as pending if unclear)
        if (isSuccess && pgTranId) {
          verifiedSuccess = true; // Trust callback if we have a transaction ID
        }
      }
    }

    // Determine final status based on VERIFICATION, not just callback
    // Only mark as "approved" if QUERYTRANSACTION confirmed an actual SALE payment
    const status = verifiedSuccess ? "approved" : (isSuccess && !verificationResult.success ? "pending" : (responseCode ? "declined" : "failed"));

    // Update order with status and real amount
    try {
      const { error: orderError, data: orderData } = await supabase
        .from("orders")
        .update({
          status,
          amount: realAmount, // Use real amount from QUERYTRANSACTION if available
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId)
        .select();

      if (orderError) {
        console.error(`[${requestId}] Order update error:`, orderError);
      } else if (!orderData || orderData.length === 0) {
        console.error(`[${requestId}] ⚠️ Order not found in database: ${orderId}`);
      } else {
        console.log(`[${requestId}] Order ${orderId} updated to status: ${status}, amount: ${realAmount}`);
      }
    } catch (dbError) {
      console.error(`[${requestId}] Order update exception:`, dbError);
    }

    // Redirect based on VERIFIED status (not just callback status)
    if (verifiedSuccess) {
      // Payment VERIFIED by QUERYTRANSACTION - redirect to success
      const successUrl = `${FRONTEND_URL}/payment/success?orderId=${encodeURIComponent(orderId)}&txId=${encodeURIComponent(verificationResult.pgTranId || pgTranId)}&amount=${encodeURIComponent(realAmount?.toString() || '')}`;
      console.log(`[${requestId}] ✓ VERIFIED SUCCESS - Redirecting to success page with real amount: ${realAmount}`);
      return new Response(generateRedirectHtml(successUrl, "Ödeme başarılı! Yönlendiriliyor..."), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } else if (isSuccess && !verifiedSuccess) {
      // Callback said success but QUERYTRANSACTION didn't confirm - treat as PENDING
      // This can happen when:
      // - QUERYPOINTS or QUERYCAMPAIGNONLINE returned "00" but no actual SALE
      // - Payment is still being processed
      console.log(`[${requestId}] ⚠️ Callback success but not verified - treating as PENDING`);
      
      // Update order to pending
      await supabase
        .from("orders")
        .update({
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      const pendingUrl = `${FRONTEND_URL}/payment/pending?orderId=${encodeURIComponent(orderId)}&txId=${encodeURIComponent(pgTranId || '')}&reason=verification_pending`;
      return new Response(generateRedirectHtml(pendingUrl, "İşleminiz kontrol ediliyor..."), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } else {
      // Check if this might be a provision/pending transaction
      // Provision can happen when bank needs more time to confirm
      const isProvision = 
        responseMsg?.toLowerCase().includes('provision') ||
        responseMsg?.toLowerCase().includes('pending') ||
        responseMsg?.toLowerCase().includes('beklemede') ||
        transactionType === 'PREAUTH' ||
        transactionType === 'PROVISION' ||
        // Some banks return specific codes for pending transactions
        responseCode === '96' || // System error - might be pending
        responseCode === '91' || // Issuer unavailable - might be pending
        (!responseCode && !errorCode && pgTranId); // Has transaction ID but no clear response

      if (isProvision || pgTranId) {
        // Transaction might be pending/provision - show pending page
        console.log(`[${requestId}] Payment appears to be PENDING/PROVISION - redirecting to pending page`);
        
        // Update order status to pending
        await supabase
          .from("orders")
          .update({
            status: "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);

        // Redirect to pending page - tell user to save order ID and use Sorgulama
        const pendingUrl = `${FRONTEND_URL}/payment/pending?orderId=${encodeURIComponent(orderId)}&txId=${encodeURIComponent(pgTranId || '')}`;
        console.log(`[${requestId}] Redirecting to pending page`);
        return new Response(generateRedirectHtml(pendingUrl, "İşleminiz alındı, yönlendiriliyor..."), {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      // Clear failure - no transaction ID, definite error
      console.log(`[${requestId}] Payment FAILED - redirecting to failure page`);
      
      // Update order status to failed
      await supabase
        .from("orders")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      // Redirect to failure page with option to verify
      const failureUrl = `${FRONTEND_URL}/payment/failure?orderId=${encodeURIComponent(orderId)}&code=${encodeURIComponent(responseCode || errorCode)}&msg=${encodeURIComponent(responseMsg || errorMsg)}`;
      console.log(`[${requestId}] Redirecting to failure page`);
      return new Response(generateRedirectHtml(failureUrl, "Yönlendiriliyor..."), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  } catch (error) {
    const requestId = `cb_error_${Date.now()}`;
    console.error(`[${requestId}] Unexpected error:`, error);
    
    // On error, redirect to failure page with verification option
    // User can manually check payment status using "Sorgulama" button
    const failureUrl = `${FRONTEND_URL}/payment/failure?error=server_error&canVerify=true`;
    return new Response(generateRedirectHtml(failureUrl, "Yönlendiriliyor..."), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
});
