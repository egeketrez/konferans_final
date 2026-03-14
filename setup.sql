-- ============================================================
-- KONFERANS FINAL - SUPABASE SETUP
-- Run this entire file in the Supabase SQL Editor at once.
-- ============================================================

-- TABLE: orders
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        TEXT UNIQUE NOT NULL,
  amount          NUMERIC(10, 2),
  currency        TEXT DEFAULT 'TRY',
  customer_name   TEXT,
  customer_email  TEXT,
  customer_phone  TEXT,
  status          TEXT DEFAULT 'pending',
  session_token   TEXT,
  hpp_url         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: bookings
CREATE TABLE IF NOT EXISTS bookings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  email                   TEXT,
  full_name               TEXT,
  alt_email               TEXT,
  passport_id             TEXT,
  club_name               TEXT,
  term_assignment         TEXT,
  phone_number            TEXT,
  palace_choice           TEXT,
  transportation          TEXT,
  early_stay              TEXT,
  checkout_day            TEXT,
  roommate                TEXT,
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  additional_notes        TEXT,
  kvkk_consent            BOOLEAN DEFAULT FALSE,
  payment_method          TEXT,
  payment_receipt_url     TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          TEXT REFERENCES orders(order_id) ON DELETE SET NULL,
  pgtranid          TEXT UNIQUE,
  response_code     TEXT,
  response_msg      TEXT,
  raw_response      JSONB,
  captured_amount   NUMERIC(10, 2),
  installment_count INTEGER DEFAULT 1,
  card_mask         TEXT,
  card_holder_name  TEXT,
  card_type         TEXT,
  card_issuer       TEXT,
  currency          TEXT DEFAULT 'TRY',
  pg_order_id       TEXT,
  approval_code     TEXT,
  trace_audit       TEXT,
  settlement_id     TEXT,
  bank_return_code  TEXT,
  commission_rate   NUMERIC(8, 4),
  paratika_fee      NUMERIC(10, 2),
  net_amount        NUMERIC(10, 2),
  transaction_type  TEXT DEFAULT 'SALE',
  is_3d_secure      BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_order_id       ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email          ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_order_id     ON bookings(order_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email        ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_transactions_order    ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_pgtranid ON transactions(pgtranid);

-- ROW LEVEL SECURITY
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read orders"
  ON orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin read bookings"
  ON bookings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin read transactions"
  ON transactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin update orders"
  ON orders FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin update bookings"
  ON bookings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin delete orders"
  ON orders FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin delete bookings"
  ON bookings FOR DELETE TO authenticated USING (true);

-- STORAGE POLICIES
-- Run these AFTER creating the 'receipts' bucket in Storage UI
CREATE POLICY "Service role upload receipts"
  ON storage.objects FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Service role read receipts"
  ON storage.objects FOR SELECT TO service_role
  USING (bucket_id = 'receipts');

CREATE POLICY "Admin read receipts"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'receipts');
