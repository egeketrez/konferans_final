// Supabase Edge Function: paratika-query
// Queries Paratika API to verify transaction status using QUERYTRANSACTION action
// Based on: https://vpos.paratika.com.tr/paratika/api/v2/doc
// Deploy with: supabase functions deploy paratika-query --no-verify-jwt

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Transaction status values from Paratika API docs
// https://vpos.paratika.com.tr/paratika/api/v2/doc
const PARATIKA_STATUS = {
  AP: "approved",      // Approved - İşlem başarılı
  VO: "voided",        // Voided - İptal edilmiş
  RE: "refunded",      // Refunded - İade edilmiş
  PA: "preauth",       // Pre-authorized - Ön otorizasyon
  PN: "pending",       // Pending - Beklemede
  DE: "declined",      // Declined - Reddedilmiş
  ER: "error",         // Error - Hata
};

// Determine the actual status of a transaction based on Paratika response
function determineTransactionStatus(tx: any): { isApproved: boolean; status: string; reason: string } {
  // Check pgTranReturnCode first (bank return code)
  const returnCode = tx.pgTranReturnCode || tx.responseCode;
  const txStatus = tx.transactionStatus;
  
  console.log(`  - returnCode: ${returnCode}, txStatus: ${txStatus}, type: ${tx.transactionType}`);
  
  // Bank return code "00" means successful
  if (returnCode === "00") {
    // Also check transactionStatus to confirm
    if (txStatus === "AP" || txStatus === "approved") {
      return { isApproved: true, status: "approved", reason: "Bank approved (00) and status AP" };
    }
    if (txStatus === "VO") {
      return { isApproved: false, status: "voided", reason: "Transaction was voided" };
    }
    if (txStatus === "RE") {
      return { isApproved: false, status: "refunded", reason: "Transaction was refunded" };
    }
    // If return code is 00 but no clear status, consider it approved
    return { isApproved: true, status: "approved", reason: "Bank approved (00)" };
  }
  
  // Other return codes indicate failure
  if (returnCode && returnCode !== "00") {
    return { isApproved: false, status: "declined", reason: `Bank declined with code: ${returnCode}` };
  }
  
  // Check transaction status
  if (txStatus === "AP") {
    return { isApproved: true, status: "approved", reason: "Status is AP (approved)" };
  }
  if (txStatus === "DE" || txStatus === "declined") {
    return { isApproved: false, status: "declined", reason: "Status is declined" };
  }
  if (txStatus === "VO") {
    return { isApproved: false, status: "voided", reason: "Transaction voided" };
  }
  if (txStatus === "RE") {
    return { isApproved: false, status: "refunded", reason: "Transaction refunded" };
  }
  if (txStatus === "PN" || txStatus === "PA") {
    return { isApproved: false, status: "pending", reason: "Transaction pending/preauth" };
  }
  
  // Default to declined if unclear
  return { isApproved: false, status: "unknown", reason: "Unable to determine status" };
}

serve(async (req) => {
  const requestId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY");
    const paratikaApi = Deno.env.get("PARATIKA_API_URL");
    const merchantCode = Deno.env.get("PARATIKA_MERCHANT_CODE");
    
    // Use query-specific credentials or fall back to regular ones
    const merchantUser = Deno.env.get("PARATIKA_QUERY_MERCHANT_USER") || Deno.env.get("PARATIKA_MERCHANT_USER");
    const merchantPassword = Deno.env.get("PARATIKA_QUERY_MERCHANT_PASSWORD") || Deno.env.get("PARATIKA_MERCHANT_PASSWORD");

    console.log(`[${requestId}] Starting QUERYTRANSACTION`);

    // Validate required env vars
    if (!paratikaApi || !merchantCode || !merchantUser || !merchantPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Paratika yapılandırması eksik",
          errorEN: "Missing Paratika configuration",
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl!, serviceKey!);

    // Parse request body
    const body = await req.json();
    const { orderId, queryByDate } = body;

    console.log(`[${requestId}] Query for orderId: ${orderId}, queryByDate: ${queryByDate}`);

    // Handle date-based query (last 24 hours)
    if (queryByDate) {
      console.log(`[${requestId}] ===== DATE-BASED QUERY (Last 24 hours) =====`);
      
      try {
        const formData = new URLSearchParams();
        formData.append("ACTION", "QUERYTRANSACTION");
        formData.append("MERCHANT", merchantCode);
        formData.append("MERCHANTUSER", merchantUser);
        formData.append("MERCHANTPASSWORD", merchantPassword);
        
        // Query by date range - last 24 hours
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        // Format: YYYY-MM-DD HH:MM:SS
        const formatDate = (d: Date) => {
          return d.toISOString().replace('T', ' ').substring(0, 19);
        };
        
        formData.append("STARTDATE", formatDate(yesterday));
        formData.append("ENDDATE", formatDate(now));
        
        console.log(`[${requestId}] Date range: ${formatDate(yesterday)} to ${formatDate(now)}`);
        
        const response = await fetch(paratikaApi, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
          },
          body: formData.toString(),
        });
        
        const responseText = await response.text();
        console.log(`[${requestId}] Date query response: ${responseText.substring(0, 500)}`);
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "API yanıtı parse edilemedi",
              errorEN: "Failed to parse API response",
              debug: { rawResponse: responseText.substring(0, 500) }
            }),
            { headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        
        if (data.responseCode !== "00") {
          return new Response(
            JSON.stringify({
              success: false,
              error: `API hatası: ${data.responseMsg || data.errorMsg || 'Unknown'}`,
              errorEN: `API error: ${data.responseMsg || data.errorMsg || 'Unknown'}`,
              debug: { 
                rawResponse: responseText.substring(0, 1000),
                paratikaApiUrl: paratikaApi,
                merchantCode: merchantCode,
                hasMerchantUser: !!merchantUser,
                hasMerchantPassword: !!merchantPassword
              }
            }),
            { headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        
        const transactionList = data.transactionList || [];
        const transactionCount = parseInt(data.transactionCount || "0");
        
        console.log(`[${requestId}] Found ${transactionCount} transactions in last 24 hours`);
        
        // Process and return all transactions
        const transactions = transactionList.map((tx: any) => {
          const returnCode = tx.pgTranReturnCode || tx.responseCode;
          const txStatus = tx.transactionStatus;
          const isApproved = returnCode === "00" && (txStatus === "AP" || !txStatus);
          
          return {
            orderId: tx.merchantPaymentId || tx.orderId || tx.pgOrderId,
            pgTranId: tx.pgTranId || tx.pgOrderId,
            amount: tx.amount,
            currency: tx.currency || "TRY",
            status: isApproved ? "approved" : (txStatus === "VO" ? "voided" : txStatus === "RE" ? "refunded" : "declined"),
            transactionType: tx.transactionType,
            transactionStatus: txStatus,
            responseCode: returnCode,
            date: tx.timeCreated || tx.transactionDate,
            cardMask: tx.panLast4 ? `****${tx.panLast4}` : tx.maskedPan,
            isApproved
          };
        });
        
        // Update database for any approved transactions we find
        for (const tx of transactions) {
          if (tx.isApproved && tx.orderId) {
            const { error: updateError } = await supabase
              .from("orders")
              .update({
                status: "approved",
                amount: tx.amount,
                updated_at: new Date().toISOString(),
              })
              .eq("order_id", tx.orderId);
            
            if (!updateError) {
              console.log(`[${requestId}] Updated order ${tx.orderId} to approved`);
            }
          }
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            message: `Son 24 saatte ${transactionCount} işlem bulundu`,
            messageEN: `Found ${transactionCount} transactions in last 24 hours`,
            transactionCount,
            transactions,
            queryMethod: "DATE_RANGE",
            apiResponse: data
          }),
          { headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
        
      } catch (e) {
        console.error(`[${requestId}] Date query error:`, e);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Sorgu hatası: ${e instanceof Error ? e.message : 'Unknown'}`,
            errorEN: `Query error: ${e instanceof Error ? e.message : 'Unknown'}`,
          }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Regular order ID query
    if (!orderId || orderId.trim() === "") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Sipariş numarası gerekli",
          errorEN: "Order ID is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch booking details from database
    const { data: bookingData } = await supabase
      .from("bookings")
      .select("*")
      .eq("order_id", orderId.trim())
      .single();
    
    console.log(`[${requestId}] Booking data: ${bookingData ? "found" : "not found"}`);

    // Fetch order details from database
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId.trim())
      .single();
    
    console.log(`[${requestId}] Order data: ${orderData ? "found" : "not found"}`);
    
    // Check if this is a dekont (receipt) payment - these don't have Paratika transactions
    if (orderData?.status === "receipt_pending" || bookingData?.payment_method === "receipt") {
      console.log(`[${requestId}] This is a dekont payment - no Paratika transaction to query`);
      return new Response(
        JSON.stringify({
          success: true,
          isApproved: false,
          hasTransactions: false,
          isReceiptPayment: true,
          message: "Bu bir dekont ödemesidir. Paratika'da işlem bulunmaz - dekont manuel olarak kontrol edilmelidir.",
          messageEN: "This is a receipt/bank transfer payment. No Paratika transaction exists - receipt must be verified manually.",
          orderId,
          bookingInfo: bookingData ? {
            fullName: bookingData.full_name,
            email: bookingData.email,
            phone: bookingData.phone_number,
            clubName: bookingData.club_name,
            palaceChoice: bookingData.palace_choice,
            paymentMethod: bookingData.payment_method,
            paymentReceiptUrl: bookingData.payment_receipt_url,
          } : null,
          orderInfo: orderData ? {
            amount: orderData.amount,
            currency: orderData.currency,
            status: orderData.status,
          } : null,
          hint: "Dekont ödemelerini Admin panelden manuel olarak onaylayın veya reddedin.",
          hintEN: "Approve or reject receipt payments manually from Admin panel.",
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Helper function to create booking info for response
    const createBookingInfo = () => {
      if (!bookingData) return null;
      return {
        fullName: bookingData.full_name,
        email: bookingData.email,
        phone: bookingData.phone_number,
        clubName: bookingData.club_name,
        termAssignment: bookingData.term_assignment,
        palaceChoice: bookingData.palace_choice,
        transportation: bookingData.transportation,
        earlyStay: bookingData.early_stay,
        roommate: bookingData.roommate,
        paymentMethod: bookingData.payment_method,
        createdAt: bookingData.created_at,
      };
    };

    // =====================================================
    // MULTI-METHOD QUERY: Try different parameters according to Paratika docs
    // https://vpos.paratika.com.tr/paratika/api/v2/doc#query-transaction
    // =====================================================
    
    // Helper function to query Paratika
    async function queryParatika(params: Record<string, string>): Promise<any> {
      const formData = new URLSearchParams();
      formData.append("ACTION", "QUERYTRANSACTION");
      formData.append("MERCHANT", merchantCode);
      formData.append("MERCHANTUSER", merchantUser);
      formData.append("MERCHANTPASSWORD", merchantPassword);
      
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, value);
      }
      
      console.log(`[${requestId}] Query with params:`, params);
      
      const response = await fetch(paratikaApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: formData.toString(),
      });
      
      const responseText = await response.text();
      console.log(`[${requestId}] Response: ${responseText.substring(0, 500)}`);
      
      return JSON.parse(responseText);
    }
    
    let apiResponse: any = null;
    let queryMethod = "";
    const queryAttempts: string[] = [];
    
    // METHOD 1: Query by MERCHANTPAYMENTID (our order ID)
    console.log(`[${requestId}] ===== METHOD 1: MERCHANTPAYMENTID =====`);
    try {
      apiResponse = await queryParatika({ MERCHANTPAYMENTID: orderId.trim() });
      queryMethod = "MERCHANTPAYMENTID";
      queryAttempts.push(`MERCHANTPAYMENTID=${orderId.trim()}: ${apiResponse.transactionCount || 0} transactions`);
      
      if (apiResponse.responseCode === "00" && parseInt(apiResponse.transactionCount || "0") > 0) {
        console.log(`[${requestId}] ✓ Found transactions with MERCHANTPAYMENTID`);
      }
    } catch (e) {
      console.error(`[${requestId}] MERCHANTPAYMENTID query failed:`, e);
      queryAttempts.push(`MERCHANTPAYMENTID=${orderId.trim()}: ERROR`);
    }
    
    // METHOD 2: If no transactions, also try ORDERID (Paratika docs mention both)
    if (!apiResponse || apiResponse.responseCode !== "00" || parseInt(apiResponse.transactionCount || "0") === 0) {
      console.log(`[${requestId}] ===== METHOD 2: ORDERID =====`);
      try {
        const orderIdResponse = await queryParatika({ ORDERID: orderId.trim() });
        queryAttempts.push(`ORDERID=${orderId.trim()}: ${orderIdResponse.transactionCount || 0} transactions`);
        
        if (orderIdResponse.responseCode === "00" && parseInt(orderIdResponse.transactionCount || "0") > 0) {
          apiResponse = orderIdResponse;
          queryMethod = "ORDERID";
          console.log(`[${requestId}] ✓ Found transactions with ORDERID`);
        }
      } catch (e) {
        console.error(`[${requestId}] ORDERID query failed:`, e);
        queryAttempts.push(`ORDERID=${orderId.trim()}: ERROR`);
      }
    }
    
    // METHOD 3: If we have a session token in our DB, try that
    if ((!apiResponse || apiResponse.responseCode !== "00" || parseInt(apiResponse.transactionCount || "0") === 0) && orderData?.session_token) {
      console.log(`[${requestId}] ===== METHOD 3: SESSIONTOKEN =====`);
      try {
        const sessionResponse = await queryParatika({ SESSIONTOKEN: orderData.session_token });
        queryAttempts.push(`SESSIONTOKEN=***${orderData.session_token.slice(-6)}: ${sessionResponse.transactionCount || 0} transactions`);
        
        if (sessionResponse.responseCode === "00" && parseInt(sessionResponse.transactionCount || "0") > 0) {
          apiResponse = sessionResponse;
          queryMethod = "SESSIONTOKEN";
          console.log(`[${requestId}] ✓ Found transactions with SESSIONTOKEN`);
        }
      } catch (e) {
        console.error(`[${requestId}] SESSIONTOKEN query failed:`, e);
        queryAttempts.push(`SESSIONTOKEN: ERROR`);
      }
    }
    
    // METHOD 4: Try as PGORDERID (in case user entered Paratika's internal ID)
    if (!apiResponse || apiResponse.responseCode !== "00" || parseInt(apiResponse.transactionCount || "0") === 0) {
      console.log(`[${requestId}] ===== METHOD 4: PGORDERID =====`);
      try {
        const pgOrderResponse = await queryParatika({ PGORDERID: orderId.trim() });
        queryAttempts.push(`PGORDERID=${orderId.trim()}: ${pgOrderResponse.transactionCount || 0} transactions`);
        
        if (pgOrderResponse.responseCode === "00" && parseInt(pgOrderResponse.transactionCount || "0") > 0) {
          apiResponse = pgOrderResponse;
          queryMethod = "PGORDERID";
          console.log(`[${requestId}] ✓ Found transactions with PGORDERID`);
        }
      } catch (e) {
        console.error(`[${requestId}] PGORDERID query failed:`, e);
        queryAttempts.push(`PGORDERID=${orderId.trim()}: ERROR`);
      }
    }
    
    // METHOD 5: Try as PGTRANID (transaction ID)
    if (!apiResponse || apiResponse.responseCode !== "00" || parseInt(apiResponse.transactionCount || "0") === 0) {
      console.log(`[${requestId}] ===== METHOD 5: PGTRANID =====`);
      try {
        const pgTranResponse = await queryParatika({ PGTRANID: orderId.trim() });
        queryAttempts.push(`PGTRANID=${orderId.trim()}: ${pgTranResponse.transactionCount || 0} transactions`);
        
        if (pgTranResponse.responseCode === "00" && parseInt(pgTranResponse.transactionCount || "0") > 0) {
          apiResponse = pgTranResponse;
          queryMethod = "PGTRANID";
          console.log(`[${requestId}] ✓ Found transactions with PGTRANID`);
        }
      } catch (e) {
        console.error(`[${requestId}] PGTRANID query failed:`, e);
        queryAttempts.push(`PGTRANID=${orderId.trim()}: ERROR`);
      }
    }
    
    console.log(`[${requestId}] Query attempts summary:`, queryAttempts);
    console.log(`[${requestId}] Final query method: ${queryMethod || 'NONE'}`);
    
    // If no valid response after all attempts
    if (!apiResponse) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API yanıtı alınamadı",
          errorEN: "Failed to get API response",
          queryAttempts,
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if API call was successful (responseCode "00" means API call OK, not payment OK)
    if (apiResponse.responseCode !== "00") {
      console.log(`[${requestId}] API error: ${apiResponse.responseMsg}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Sorgu hatası: ${apiResponse.responseMsg || "Bilinmeyen hata"}`,
          errorEN: `Query error: ${apiResponse.responseMsg || "Unknown error"}`,
          apiResponse,
          queryAttempts,
          queryMethod,
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get transaction list
    const transactionList = apiResponse.transactionList || [];
    const transactionCount = parseInt(apiResponse.transactionCount || "0");
    
    console.log(`[${requestId}] MERCHANTPAYMENTID raw response (full):`, JSON.stringify(apiResponse));
    console.log(`[${requestId}] Found ${transactionCount} transactions in Paratika`);

    // CASE 1: No transactions found - payment was never completed
    if (transactionList.length === 0 || transactionCount === 0) {
      console.log(`[${requestId}] No transactions found after trying all query methods`);
      
      // DON'T update database to no_payment if we might have wrong order ID
      // Only update if we're confident this is the right order
      if (orderData) {
        await supabase
          .from("orders")
          .update({
            status: "no_payment",
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);
      }

      return new Response(
        JSON.stringify({
          success: true,
          isApproved: false,
          hasTransactions: false,
          message: "Bu sipariş numarasına ait ödeme işlemi bulunamadı. Ödeme hiç tamamlanmamış olabilir.",
          messageEN: "No payment transaction found for this order ID. Payment may never have been completed.",
          orderId,
          transactionCount: 0,
          databaseUpdated: Boolean(orderData),
          newStatus: orderData ? "no_payment" : null,
          bookingInfo: createBookingInfo(),
          orderInfo: orderData ? {
            amount: orderData.amount,
            currency: orderData.currency,
            status: orderData.status,
            createdAt: orderData.created_at,
            sessionToken: orderData.session_token ? `***${orderData.session_token.slice(-6)}` : null,
          } : null,
          queryMethod: queryMethod || "ALL_METHODS_TRIED",
          queryAttempts,
          apiResponse, // Include full response for debugging
          hint: "Eğer Paratika'da ödeme görünüyorsa, lütfen Paratika panelinden 'Ödeme Sistemi Sipariş Numarası' (pgOrderId) ile tekrar deneyin.",
          hintEN: "If payment shows in Paratika, please try again with the 'Payment System Order Number' (pgOrderId) from Paratika panel.",
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // CASE 2: Transactions exist - LOG ALL FIRST for debugging
    console.log(`[${requestId}] ========== ALL TRANSACTIONS FROM PARATIKA ==========`);
    transactionList.forEach((tx: any, idx: number) => {
      console.log(`[${requestId}] TX ${idx + 1}:`, {
        transactionType: tx.transactionType,
        transactionStatus: tx.transactionStatus,
        pgTranReturnCode: tx.pgTranReturnCode,
        responseCode: tx.responseCode,
        amount: tx.amount,
        pgOrderId: tx.pgOrderId,
        pgTranId: tx.pgTranId,
      });
    });
    console.log(`[${requestId}] =================================================`);
    
    // EXPLICITLY EXCLUDE non-payment transaction types
    // These are auxiliary queries, NOT actual payments:
    // - QUERYPOINTS: Checks loyalty points balance
    // - QUERYCAMPAIGNONLINE: Checks for campaigns/discounts
    // - QUERYTRANSACTION: Query about a transaction
    // - QUERYMERCHANT: Query about merchant info
    const NON_PAYMENT_TYPES = [
      "QUERYPOINTS", 
      "QUERYCAMPAIGNONLINE", 
      "QUERYTRANSACTION", 
      "QUERYMERCHANT",
      "QUERYCAMPAIGN",
      "BIN",
    ];
    
    // Payment transaction types (English and Turkish)
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
    
    // Find actual payment transactions
    // Strategy: Exclude known non-payment types, include known payment types OR transactions with amount > 0 and status AP
    const paymentTransactions = transactionList.filter((tx: any) => {
      const txType = (tx.transactionType || tx.action || tx.type || "").toUpperCase().trim();
      const txStatus = (tx.transactionStatus || "").toUpperCase();
      const returnCode = tx.pgTranReturnCode || tx.responseCode || "";
      const amount = tx.amount || 0;
      
      // Explicitly exclude non-payment types
      if (NON_PAYMENT_TYPES.includes(txType)) {
        console.log(`[${requestId}] Excluding non-payment TX: type=${txType}`);
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
      
      const isPayment = isPaymentType || hasPaymentIndicators;
      
      if (isPayment) {
        console.log(`[${requestId}] ✓ Including as payment TX: type=${txType}, status=${txStatus}, amount=${amount}, code=${returnCode}`);
      } else {
        console.log(`[${requestId}] ✗ Excluding TX: type=${txType}, status=${txStatus}, amount=${amount}`);
      }
      
      return isPayment;
    });
    
    console.log(`[${requestId}] Filtered: ${paymentTransactions.length} payment transactions out of ${transactionList.length} total`);

    // If no payment transactions found, check if we filtered too aggressively
    if (paymentTransactions.length === 0) {
      console.log(`[${requestId}] ⚠️ No payment transactions after filtering - checking if we filtered too aggressively...`);
      
      // Check if any transaction has amount > 0 and approved status (might be a payment we missed)
      const potentialPayments = transactionList.filter((tx: any) => {
        const amount = tx.amount || 0;
        const txStatus = (tx.transactionStatus || "").toUpperCase();
        const returnCode = tx.pgTranReturnCode || tx.responseCode || "";
        return amount > 0 && (txStatus === "AP" || returnCode === "00");
      });
      
      if (potentialPayments.length > 0) {
        console.log(`[${requestId}] ⚠️ Found ${potentialPayments.length} potential payments with amount > 0 and approved status - treating as payments`);
        // Use these as payment transactions
        const txToAnalyze = potentialPayments;
        
        // Continue with analysis using these transactions
        let approvedTx: any = null;
        let latestTx: any = null;
        
        for (const tx of txToAnalyze) {
          const status = determineTransactionStatus(tx);
          console.log(`[${requestId}] TX ${tx.pgOrderId || 'unknown'}: ${status.status} - ${status.reason}`);
          
          latestTx = tx;
          if (status.isApproved) {
            approvedTx = tx;
            break;
          }
        }
        
        const hasApprovedPayment = approvedTx !== null;
        const txToReport = approvedTx || latestTx;
        const finalStatus = determineTransactionStatus(txToReport);
        
        const realAmount = txToReport?.amount || null;
        const realInstallments = txToReport?.installmentCount || txToReport?.numberOfInstallments || 1;
        const dbStatus = hasApprovedPayment ? "approved" : finalStatus.status;
        
        await supabase
          .from("orders")
          .update({
            status: dbStatus,
            amount: realAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);
        
        return new Response(
          JSON.stringify({
            success: true,
            isApproved: hasApprovedPayment,
            hasTransactions: true,
            message: hasApprovedPayment 
              ? "Ödeme onaylandı" 
              : (finalStatus.status === "declined" 
                  ? "Ödeme reddedildi" 
                  : `İşlem durumu: ${finalStatus.status}`),
            messageEN: hasApprovedPayment 
              ? "Payment approved" 
              : (finalStatus.status === "declined" 
                  ? "Payment declined" 
                  : `Transaction status: ${finalStatus.status}`),
            orderId,
            transactionCount: potentialPayments.length,
            totalTransactionsInParatika: transactionList.length,
            databaseUpdated: true,
            newStatus: dbStatus,
            statusReason: finalStatus.reason,
            bookingInfo: createBookingInfo(),
            orderInfo: orderData ? {
              amount: orderData.amount,
              currency: orderData.currency,
              status: orderData.status,
              createdAt: orderData.created_at,
            } : null,
            paidAmount: hasApprovedPayment ? realAmount : null,
            latestTransaction: txToReport ? {
              pgTranId: txToReport.pgOrderId || txToReport.pgTranId,
              amount: txToReport.amount,
              currency: txToReport.currency || "TRY",
              responseCode: txToReport.pgTranReturnCode || txToReport.responseCode || "00",
              transactionStatus: txToReport.transactionStatus,
              transactionType: txToReport.transactionType,
              date: txToReport.timeCreated || txToReport.transactionDate,
              cardMask: txToReport.panLast4 ? `****${txToReport.panLast4}` : txToReport.maskedPan,
              cardOwner: txToReport.cardOwnerMasked,
              approvalCode: txToReport.pgTranApprCode,
              installments: txToReport.installmentCount || txToReport.numberOfInstallments || 1,
              bin: txToReport.bin,
            } : null,
            allTransactions: potentialPayments.map((tx: any) => {
              const txStatus = determineTransactionStatus(tx);
              return {
                pgTranId: tx.pgOrderId || tx.pgTranId,
                amount: tx.amount,
                currency: tx.currency || "TRY",
                responseCode: tx.pgTranReturnCode || tx.responseCode,
                transactionStatus: tx.transactionStatus,
                transactionType: tx.transactionType,
                date: tx.timeCreated || tx.transactionDate,
                isApproved: txStatus.isApproved,
                status: txStatus.status,
                statusReason: txStatus.reason,
              };
            }),
            apiResponse, // Include full response for debugging
          }),
          { headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      // No potential payments found - truly no payment
      console.log(`[${requestId}] No actual payment transactions - only had auxiliary queries`);
      
      await supabase
        .from("orders")
        .update({
          status: "no_payment",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      return new Response(
        JSON.stringify({
          success: true,
          isApproved: false,
          hasTransactions: false,
          message: "Bu sipariş için ödeme işlemi bulunamadı. Sadece sorgu işlemleri mevcut.",
          messageEN: "No payment transaction found for this order. Only query transactions exist.",
          orderId,
          transactionCount: 0,
          totalTransactionsInParatika: transactionList.length,
          databaseUpdated: true,
          newStatus: "no_payment",
          bookingInfo: createBookingInfo(),
          orderInfo: orderData ? {
            amount: orderData.amount,
            currency: orderData.currency,
            status: orderData.status,
            createdAt: orderData.created_at,
          } : null,
          nonPaymentTransactions: transactionList.map((tx: any) => ({
            type: tx.transactionType,
            status: tx.transactionStatus,
            amount: tx.amount,
            code: tx.pgTranReturnCode || tx.responseCode,
          })),
          apiResponse, // Include full response for debugging
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use only actual payment transactions for analysis
    const txToAnalyze = paymentTransactions;
    
    // Find any approved transaction
    let approvedTx: any = null;
    let latestTx: any = null;
    
    for (const tx of txToAnalyze) {
      const status = determineTransactionStatus(tx);
      console.log(`[${requestId}] TX ${tx.pgOrderId || 'unknown'}: ${status.status} - ${status.reason}`);
      
      latestTx = tx; // Keep track of latest
      
      if (status.isApproved) {
        approvedTx = tx;
        break; // Found an approved transaction
      }
    }

    // Determine final status
    const hasApprovedPayment = approvedTx !== null;
    const txToReport = approvedTx || latestTx;
    const finalStatus = determineTransactionStatus(txToReport);

    console.log(`[${requestId}] Final status: isApproved=${hasApprovedPayment}, status=${finalStatus.status}`);

    // Get real amount from the transaction
    const realAmount = txToReport?.amount || null;
    const realInstallments = txToReport?.installmentCount || txToReport?.numberOfInstallments || 1;
        
    // Update database with ACTUAL Paratika status
    const dbStatus = hasApprovedPayment ? "approved" : finalStatus.status;
    
        const { error: updateError } = await supabase
          .from("orders")
          .update({
        status: dbStatus,
        amount: realAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);

        if (updateError) {
      console.error(`[${requestId}] DB update error:`, updateError);
        } else {
      console.log(`[${requestId}] ✓ Order ${orderId} updated to: ${dbStatus}, amount: ${realAmount}`);
        }

    // Update or create transaction record
    if (txToReport?.pgOrderId || txToReport?.pgTranId) {
      const pgTranId = txToReport.pgOrderId || txToReport.pgTranId;
      
          const { data: existingTx } = await supabase
            .from("transactions")
            .select("id")
            .eq("pgtranid", pgTranId)
            .single();

      const txRecord = {
              order_id: orderId,
              pgtranid: pgTranId,
        response_code: txToReport.pgTranReturnCode || txToReport.responseCode || null,
        response_msg: hasApprovedPayment ? "Approved" : (finalStatus.reason || "Declined"),
        raw_response: txToReport,
        captured_amount: realAmount,
        installment_count: realInstallments,
        card_mask: txToReport.panLast4 ? `****${txToReport.panLast4}` : (txToReport.maskedPan || null),
        card_type: txToReport.cardProgram || null,
        card_issuer: txToReport.issuer || null,
        currency: txToReport.currency || "TRY",
        approval_code: txToReport.pgTranApprCode || null,
      };

      if (!existingTx) {
        await supabase.from("transactions").insert(txRecord);
        console.log(`[${requestId}] Transaction record created`);
          } else {
        await supabase.from("transactions").update(txRecord).eq("pgtranid", pgTranId);
        console.log(`[${requestId}] Transaction record updated`);
          }
        }

    // Build response
    const responseData = {
            success: true,
      isApproved: hasApprovedPayment,
      hasTransactions: true,
      message: hasApprovedPayment 
        ? "Ödeme onaylandı" 
        : (finalStatus.status === "declined" 
            ? "Ödeme reddedildi" 
            : `İşlem durumu: ${finalStatus.status}`),
      messageEN: hasApprovedPayment 
        ? "Payment approved" 
        : (finalStatus.status === "declined" 
            ? "Payment declined" 
            : `Transaction status: ${finalStatus.status}`),
            orderId,
      transactionCount: paymentTransactions.length,
      totalTransactionsInParatika: transactionList.length,
      databaseUpdated: true,
      newStatus: dbStatus,
      statusReason: finalStatus.reason,
      // Include booking information
      bookingInfo: createBookingInfo(),
      orderInfo: orderData ? {
        amount: orderData.amount,
        currency: orderData.currency,
        status: orderData.status,
        createdAt: orderData.created_at,
      } : null,
      // Actual payment amount from transaction
      paidAmount: hasApprovedPayment ? (txToReport?.amount || null) : null,
      latestTransaction: txToReport ? {
        pgTranId: txToReport.pgOrderId || txToReport.pgTranId,
        amount: txToReport.amount,
        currency: txToReport.currency || "TRY",
        responseCode: txToReport.pgTranReturnCode || txToReport.responseCode || "00",
        transactionStatus: txToReport.transactionStatus,
        transactionType: txToReport.transactionType,
        date: txToReport.timeCreated || txToReport.transactionDate,
        cardMask: txToReport.panLast4 ? `****${txToReport.panLast4}` : txToReport.maskedPan,
        cardOwner: txToReport.cardOwnerMasked,
        approvalCode: txToReport.pgTranApprCode,
        installments: txToReport.installmentCount || txToReport.numberOfInstallments || 1,
        bin: txToReport.bin,
      } : null,
      // Only include actual payment transactions in the list
      allTransactions: paymentTransactions.map((tx: any) => {
        const txStatus = determineTransactionStatus(tx);
        return {
          pgTranId: tx.pgOrderId || tx.pgTranId,
          amount: tx.amount,
          currency: tx.currency || "TRY",
          responseCode: tx.pgTranReturnCode || tx.responseCode,
          transactionStatus: tx.transactionStatus,
          transactionType: tx.transactionType,
          date: tx.timeCreated || tx.transactionDate,
          isApproved: txStatus.isApproved,
          status: txStatus.status,
          statusReason: txStatus.reason,
        };
      }),
      apiResponse, // Include full response for debugging
    };

    return new Response(
      JSON.stringify(responseData),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
        errorEN: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
