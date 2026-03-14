// Supabase Edge Function: paratika-session
// Creates a Paratika session token server-side and stores the order.
// Production-ready implementation with comprehensive error handling, validation, and security.
// Deploy with: supabase functions deploy paratika-session --no-verify-jwt

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ==================== CONFIGURATION ====================
const MAX_REQUEST_SIZE = 1024 * 1024 * 10; // 10MB max request body (for receipt file uploads)
const API_TIMEOUT_MS = 30000; // 30 seconds timeout for Paratika API
const MAX_AMOUNT = 1000000; // Maximum transaction amount (1M TRY)
const MIN_AMOUNT = 0.01; // Minimum transaction amount

// Environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SERVICE_ROLE_KEY") ||
  "";
const paratikaApi = Deno.env.get("PARATIKA_API_URL")!;
// Note: HPP URL is constructed from API URL as {BASE_URL}/payment/{SESSIONTOKEN}
// PARATIKA_HPP_URL is kept for validation but not used in construction
const hppUrl = Deno.env.get("PARATIKA_HPP_URL")!;
const merchantCode = Deno.env.get("PARATIKA_MERCHANT_CODE")!;
const merchantUser = Deno.env.get("PARATIKA_MERCHANT_USER")!;
const merchantPassword = Deno.env.get("PARATIKA_MERCHANT_PASSWORD")!;

// Allowed origins for CORS (configure based on your domains)
const ALLOWED_ORIGINS = Deno.env.get(" ")?.split(",") || ["*"];

// ==================== VALIDATION FUNCTIONS ====================

function validateEnvVars(): void {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

function validateParatikaEnvVars(): void {
  const missing: string[] = [];
  if (!paratikaApi) missing.push("PARATIKA_API_URL");
  if (!hppUrl) missing.push("PARATIKA_HPP_URL");
  if (!merchantCode) missing.push("PARATIKA_MERCHANT_CODE");
  if (!merchantUser) missing.push("PARATIKA_MERCHANT_USER");
  if (!merchantPassword) missing.push("PARATIKA_MERCHANT_PASSWORD");
  if (missing.length > 0) {
    throw new Error(`Missing Paratika environment variables: ${missing.join(", ")}`);
  }
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidOrderId(orderId: string): boolean {
  // Order ID should be alphanumeric with dashes/underscores, max 128 chars
  return /^[a-zA-Z0-9_-]{1,128}$/.test(orderId);
}

function isValidAmount(amount: string | number): boolean {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return (
    !isNaN(numAmount) &&
    isFinite(numAmount) &&
    numAmount >= MIN_AMOUNT &&
    numAmount <= MAX_AMOUNT
  );
}

function isValidCurrency(currency: string): boolean {
  // ISO 4217 currency codes (3 letters)
  return /^[A-Z]{3}$/.test(currency);
}

function sanitizeString(input: string | undefined, maxLength: number): string | undefined {
  if (!input) return undefined;
  return input.trim().substring(0, maxLength);
}

function validateEmail(email: string | undefined): boolean {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validatePhone(phone: string | undefined): boolean {
  if (!phone) return true; // Optional field
  // Allow international format with +, digits, spaces, dashes, parentheses
  return /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(phone) && phone.length <= 20;
}

// Normalize phone number to Paratika format: +90XXXXXXXXXX (E.164 format)
function normalizePhoneForParatika(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  
  // Extract only digits
  let digits = phone.replace(/\D/g, '');
  
  // Remove leading 0 if present
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  
  // If starts with 90 and has more than 10 digits, remove 90 prefix
  if (digits.startsWith('90') && digits.length > 10) {
    digits = digits.substring(2);
  }
  
  // For Turkish mobile numbers: should be 10 digits starting with 5
  if (digits.length === 10 && digits.startsWith('5')) {
    return `+90${digits}`;
  }
  
  // If already in international format with +, return as is (if valid)
  if (phone.startsWith('+')) {
    // Remove + and check if it's valid
    const phoneDigits = phone.substring(1).replace(/\D/g, '');
    if (phoneDigits.length >= 10 && phoneDigits.length <= 15) {
      return phone.trim().substring(0, 20); // Max 20 chars per Paratika
    }
  }
  
  // If we have digits but not in Turkish format, try to format as international
  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  
  // Return original if we can't normalize (let Paratika handle validation)
  return phone.trim().substring(0, 20);
}

// ==================== HELPER FUNCTIONS ====================

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin =
    ALLOWED_ORIGINS.includes("*") || (origin && ALLOWED_ORIGINS.includes(origin))
      ? origin || "*"
      : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400", // 24 hours
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
  };
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}

// ==================== INITIALIZATION ====================

// Validate environment on startup
try {
  validateEnvVars();
} catch (error) {
  console.error("FATAL: Environment validation failed:", error);
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// ==================== MAIN HANDLER ====================

serve(async (req) => {
  const requestId = generateRequestId();
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // Check request size
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
    return new Response(
      JSON.stringify({ success: false, error: "Request too large" }),
      { status: 413, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Parse and validate request body
    let body;
    try {
      const bodyText = await req.text();
      if (bodyText.length > MAX_REQUEST_SIZE) {
        return new Response(
          JSON.stringify({ success: false, error: "Request too large" }),
          { status: 413, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error(`[${requestId}] Invalid JSON in request body:`, parseError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Extract and validate required fields
    const { amount, currency, orderId, customerName, customerEmail, customerPhone, returnUrl, cancelUrl, bookingData, saveBookingOnly } = body;

    // Handle saveBookingOnly mode (dekont/receipt payments) - save booking AND create order for admin visibility
    if (saveBookingOnly && bookingData) {
      console.log(`[${requestId}] saveBookingOnly mode (dekont payment) - saving booking and order for: ${orderId}`);
      
      try {
        const {
          email,
          full_name,
          alt_email,
          passport_id,
          club_name,
          term_assignment,
          phone_number,
          palace_choice,
          transportation,
          early_stay,
          checkout_day,
          roommate,
          emergency_contact_name,
          emergency_contact_phone,
          additional_notes,
          kvkk_consent,
          payment_method,
          payment_receipt_url,
          payment_receipt_base64,
          payment_receipt_filename,
        } = bookingData;

        let finalReceiptUrl = sanitizeString(payment_receipt_url, 500);

        // Handle base64 receipt upload to Supabase Storage
        if (payment_receipt_base64 && payment_receipt_filename) {
          try {
            console.log(`[${requestId}] Uploading receipt file: ${payment_receipt_filename}`);
            
            // Extract base64 data (remove data URL prefix if present)
            let base64Data = payment_receipt_base64;
            if (base64Data.includes(',')) {
              base64Data = base64Data.split(',')[1];
            }
            
            // Decode base64 to binary
            const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            // Generate unique filename
            const fileExt = (payment_receipt_filename.split('.').pop() || 'png').toLowerCase();
            const uniqueFilename = `${orderId}_${Date.now()}.${fileExt}`;
            
            // Determine content type based on extension
            const contentTypeMap: Record<string, string> = {
              'pdf': 'application/pdf',
              'jpg': 'image/jpeg',
              'jpeg': 'image/jpeg',
              'png': 'image/png',
              'gif': 'image/gif',
              'webp': 'image/webp',
            };
            const contentType = contentTypeMap[fileExt] || `image/${fileExt}`;
            
            // Upload to Supabase Storage (receipts bucket)
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('receipts')
              .upload(uniqueFilename, binaryData, {
                contentType,
                upsert: true,
              });
            
            if (uploadError) {
              console.error(`[${requestId}] Storage upload error:`, uploadError);
              // Continue without receipt URL if upload fails
            } else {
              // Get public URL
              const { data: urlData } = supabase.storage
                .from('receipts')
                .getPublicUrl(uniqueFilename);
              
              finalReceiptUrl = urlData?.publicUrl || null;
              console.log(`[${requestId}] Receipt uploaded successfully: ${finalReceiptUrl}`);
            }
          } catch (uploadErr) {
            console.error(`[${requestId}] Receipt upload failed:`, uploadErr);
            // Continue without receipt URL
          }
        }

        // IMPORTANT: Also create an order record so it appears in Admin panel
        // Dekont payments should be visible in Admin with status "receipt_pending"
        const { error: orderError } = await supabase.from("orders").upsert({
          order_id: orderId,
          amount: parseFloat(String(amount)) || 0,
          currency: currency || "TRY",
          customer_name: sanitizeString(customerName, 128) || sanitizeString(full_name, 128),
          customer_email: sanitizeString(customerEmail, 255) || sanitizeString(email, 255),
          customer_phone: normalizePhoneForParatika(customerPhone) || sanitizeString(phone_number, 20),
          status: "receipt_pending", // Special status for dekont payments awaiting verification
          session_token: null, // No Paratika session for dekont payments
          hpp_url: null,
          updated_at: new Date().toISOString(),
        });

        if (orderError) {
          console.error(`[${requestId}] Failed to create order for dekont:`, orderError);
        } else {
          console.log(`[${requestId}] Order created for dekont payment: ${orderId}`);
        }

        // Save booking data
        const { error: bookingError } = await supabase.from("bookings").upsert({
          order_id: orderId,
          email: sanitizeString(email, 255),
          full_name: sanitizeString(full_name, 128),
          alt_email: sanitizeString(alt_email, 255),
          passport_id: sanitizeString(passport_id, 50),
          club_name: sanitizeString(club_name, 128),
          term_assignment: sanitizeString(term_assignment, 128),
          phone_number: sanitizeString(phone_number, 20),
          palace_choice: sanitizeString(palace_choice, 50),
          transportation: sanitizeString(transportation, 50),
          early_stay: sanitizeString(early_stay, 50),
          checkout_day: sanitizeString(checkout_day, 50),
          roommate: sanitizeString(roommate, 128),
          emergency_contact_name: sanitizeString(emergency_contact_name, 128),
          emergency_contact_phone: sanitizeString(emergency_contact_phone, 20),
          additional_notes: sanitizeString(additional_notes, 1000),
          kvkk_consent: Boolean(kvkk_consent),
          payment_method: sanitizeString(payment_method, 50),
          payment_receipt_url: finalReceiptUrl,
          updated_at: new Date().toISOString(),
        });

        if (bookingError) {
          console.error(`[${requestId}] Failed to save booking:`, bookingError);
          return new Response(
            JSON.stringify({ success: false, error: "Failed to save booking" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        
        console.log(`[${requestId}] Booking saved successfully for order: ${orderId}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Booking saved successfully",
            orderId,
            receiptUrl: finalReceiptUrl,
            requestId,
          }),
          { headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (bookingError) {
        console.error(`[${requestId}] Failed to store booking data:`, bookingError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to save booking" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Validate Paratika credentials only needed for card payment sessions
    try {
      validateParatikaEnvVars();
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: "Payment gateway not configured" }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate required fields for payment session
    const validationErrors: string[] = [];
    if (!amount) validationErrors.push("amount is required");
    if (!currency) validationErrors.push("currency is required");
    if (!orderId) validationErrors.push("orderId is required");
    if (!returnUrl) validationErrors.push("returnUrl is required");

    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Validation failed", details: validationErrors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate field formats
    if (!isValidAmount(amount)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid amount" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!isValidCurrency(currency)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid currency code" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!isValidOrderId(orderId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid order ID format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!isValidUrl(returnUrl)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid return URL" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (cancelUrl && !isValidUrl(cancelUrl)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid cancel URL" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (customerEmail && !validateEmail(customerEmail)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (customerPhone && !validatePhone(customerPhone)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid phone format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize inputs
    const sanitizedCustomerName = sanitizeString(customerName, 128);
    const sanitizedCustomerEmail = sanitizeString(customerEmail, 255);
    // Normalize phone to Paratika format (+90XXXXXXXXXX for Turkish numbers)
    const sanitizedCustomerPhone = normalizePhoneForParatika(customerPhone);

    // Check for duplicate order ID
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("order_id")
      .eq("order_id", orderId)
      .single();

    if (existingOrder) {
      console.warn(`[${requestId}] Duplicate order ID detected: ${orderId}`);
      // Return existing session if available
      const { data: orderData } = await supabase
        .from("orders")
        .select("session_token, hpp_url, status")
        .eq("order_id", orderId)
        .single();

      if (orderData?.session_token && orderData?.hpp_url) {
        return new Response(
          JSON.stringify({
            success: true,
            sessionToken: orderData.session_token,
            hppUrl: orderData.hpp_url,
            duplicate: true,
          }),
          { headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Build ORDERITEMS - required by Paratika API but WITHOUT marketplace parameters
    const orderItemsArray = [
      {
        productCode: "BOOKING",
        name: bookingData?.palace_choice
          ? `Booking - ${String(bookingData.palace_choice).substring(0, 50)}`
          : "Booking Payment",
        description: bookingData?.palace_choice
          ? `Palace booking: ${String(bookingData.palace_choice).substring(0, 100)}`
          : "Booking payment",
        quantity: 1,
        amount: parseFloat(String(amount)),
      },
    ];

    // Build form data for Paratika API
    const form = new URLSearchParams();
    form.append("MERCHANT", merchantCode);
    form.append("MERCHANTUSER", merchantUser);
    form.append("MERCHANTPASSWORD", merchantPassword);
    form.append("ACTION", "SESSIONTOKEN");
    form.append("SESSIONTYPE", "PAYMENTSESSION");
    form.append("AMOUNT", String(amount));
    form.append("CURRENCY", currency);
    form.append("ORDERID", orderId);
    form.append("MERCHANTPAYMENTID", orderId);
    form.append("RETURNURL", returnUrl);
    form.append("ORDERITEMS", JSON.stringify(orderItemsArray));

    // Optional customer parameters
    if (sanitizedCustomerName) form.append("CUSTOMER", sanitizedCustomerName);
    if (sanitizedCustomerEmail) form.append("CUSTOMEREMAIL", sanitizedCustomerEmail);
    if (sanitizedCustomerPhone) {
      form.append("CUSTOMERPHONE", sanitizedCustomerPhone);
      console.log(`[${requestId}] Phone normalized for Paratika: ${sanitizedCustomerPhone}`);
    }
    if (cancelUrl) form.append("CANCELURL", cancelUrl);

    // Log request (sanitized)
    console.log(`[${requestId}] Paratika API Request:`, {
      orderId,
      amount,
      currency,
      hasCustomerInfo: Boolean(sanitizedCustomerName || sanitizedCustomerEmail || sanitizedCustomerPhone),
      phoneFormat: sanitizedCustomerPhone ? (sanitizedCustomerPhone.startsWith('+90') ? 'Turkish (+90)' : 'International') : 'none',
    });

    // Call Paratika API with timeout
    let res: Response;
    try {
      res = await fetchWithTimeout(
        paratikaApi,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
            "User-Agent": "Paratika-Integration/1.0",
          },
          body: form.toString(),
        },
        API_TIMEOUT_MS
      );
    } catch (fetchError) {
      console.error(`[${requestId}] Paratika API fetch failed:`, fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment service temporarily unavailable",
          requestId,
        }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse response
    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse Paratika response:`, parseError);
      console.error(`[${requestId}] Response text:`, responseText.substring(0, 500));
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid response from payment service",
          requestId,
        }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log response (sanitized)
    console.log(`[${requestId}] Paratika API Response:`, {
      responseCode: data.responseCode,
      hasSessionToken: Boolean(data.sessionToken),
      errorCode: data.errorCode,
    });

    // Check for API errors
    if (data.responseCode !== "00" || !data.sessionToken) {
      const errorDetails = {
        success: false,
        error: data.responseMsg || data.errorMsg || "Payment session creation failed",
        responseCode: data.responseCode,
        errorCode: data.errorCode,
        errorMsg: data.errorMsg,
        violatorParam: data.violatorParam,
        requestId,
      };
      console.error(`[${requestId}] Paratika API Error:`, errorDetails);

      return new Response(JSON.stringify(errorDetails), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Construct HPP URL according to Paratika API v2 documentation
    // Confirmed working format: {BASE_URL}/payment/{SESSIONTOKEN}
    // Documentation: https://vpos.paratika.com.tr/paratika/api/v2/doc
    // Format: https://entegrasyon.paratika.com.tr/payment/{SESSIONTOKEN}
    // Production: https://vpos.paratika.com.tr/payment/{SESSIONTOKEN}
    // Extract base URL from API URL (remove /paratika/api/v2 or /api/v2)
    const baseUrl = paratikaApi.replace("/paratika/api/v2", "").replace("/api/v2", "");
    const hppUrlWithToken = `${baseUrl}/payment/${data.sessionToken}`;
    
    // Log the constructed HPP URL for debugging (sanitized)
    console.log(`[${requestId}] HPP URL: ${baseUrl}/payment/***${data.sessionToken.substring(data.sessionToken.length - 4)}`);

    // Store order in database
    try {
      const { error: orderError } = await supabase.from("orders").upsert({
      order_id: orderId,
        amount: parseFloat(String(amount)),
      currency,
        customer_name: sanitizedCustomerName,
        customer_email: sanitizedCustomerEmail,
        customer_phone: sanitizedCustomerPhone,
      status: "pending",
      session_token: data.sessionToken,
        hpp_url: hppUrlWithToken,
      updated_at: new Date().toISOString(),
    });

      if (orderError) {
        console.error(`[${requestId}] Failed to store order:`, orderError);
        // Continue even if DB write fails - session token is already generated
      }
    } catch (dbError) {
      console.error(`[${requestId}] Database error:`, dbError);
      // Continue even if DB write fails
    }

    // Store booking data if provided
    if (bookingData) {
      try {
      const {
        email,
        full_name,
        alt_email,
        passport_id,
        club_name,
        term_assignment,
        phone_number,
        palace_choice,
        transportation,
        early_stay,
        checkout_day,
        roommate,
        emergency_contact_name,
        emergency_contact_phone,
        additional_notes,
        kvkk_consent,
        payment_method,
        payment_receipt_url,
      } = bookingData;

      await supabase.from("bookings").upsert({
        order_id: orderId,
        email: sanitizeString(email, 255),
        full_name: sanitizeString(full_name, 128),
        alt_email: sanitizeString(alt_email, 255),
        passport_id: sanitizeString(passport_id, 50),
        club_name: sanitizeString(club_name, 128),
        term_assignment: sanitizeString(term_assignment, 128),
        phone_number: sanitizeString(phone_number, 20),
        palace_choice: sanitizeString(palace_choice, 50),
        transportation: sanitizeString(transportation, 50),
        early_stay: sanitizeString(early_stay, 50),
        checkout_day: sanitizeString(checkout_day, 50),
        roommate: sanitizeString(roommate, 128),
        emergency_contact_name: sanitizeString(emergency_contact_name, 128),
        emergency_contact_phone: sanitizeString(emergency_contact_phone, 20),
        additional_notes: sanitizeString(additional_notes, 1000),
        kvkk_consent: Boolean(kvkk_consent),
        payment_method: sanitizeString(payment_method, 50),
        payment_receipt_url: sanitizeString(payment_receipt_url, 500),
        updated_at: new Date().toISOString(),
      });
      } catch (bookingError) {
        console.error(`[${requestId}] Failed to store booking data:`, bookingError);
        // Non-critical - continue
      }
    }

    // Return success response with properly formatted HPP URL
    // Format: {BASE_URL}/payment/{SESSIONTOKEN} (confirmed working format)
    return new Response(
      JSON.stringify({
        success: true,
        sessionToken: data.sessionToken,
        hppUrl: hppUrlWithToken,
        requestId,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred",
        requestId,
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
