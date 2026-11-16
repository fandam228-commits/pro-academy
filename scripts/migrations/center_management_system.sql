-- =========================================================================
-- PROFESSIONAL ACADEMY — CENTER MANAGEMENT SYSTEM MIGRATION (STAGING ONLY)
-- Safe, Idempotent, Zero-Destructive, 100% Backwards-Compatible
-- =========================================================================

BEGIN;

-- 1. Extend attendance_records with session linkage and audit tracking
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS group_id TEXT;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS scan_method TEXT DEFAULT 'manual';
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS arrival_time TIMESTAMP;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS updated_by TEXT;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_att_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_att_date ON attendance_records(session_date);
CREATE INDEX IF NOT EXISTS idx_att_session ON attendance_records(session_id);

-- 2. Create center_group_students (N:M Multi-Group Link & Membership State)
CREATE TABLE IF NOT EXISTS center_group_students (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES center_groups(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  custom_monthly_fee NUMERIC(10, 2),
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_reason TEXT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  paused_at TIMESTAMP,
  transferred_to_group_id TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_cgs_group ON center_group_students(group_id);
CREATE INDEX IF NOT EXISTS idx_cgs_student ON center_group_students(student_id);
CREATE INDEX IF NOT EXISTS idx_cgs_status ON center_group_students(status);

-- Auto-link any existing students having users.group_id into center_group_students
INSERT INTO center_group_students (id, group_id, student_id, status, joined_at)
SELECT 
  'cgs_' || u.id || '_' || u.group_id,
  u.group_id,
  u.id,
  'active',
  CURRENT_TIMESTAMP
FROM users u
WHERE u.role = 'student' 
  AND u.group_id IS NOT NULL 
  AND EXISTS (SELECT 1 FROM center_groups cg WHERE cg.id = u.group_id)
ON CONFLICT (id) DO NOTHING;

-- 3. Create center_sessions (Structured Physical Sessions)
CREATE TABLE IF NOT EXISTS center_sessions (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES center_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  session_date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  teacher_id TEXT,
  room TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  is_self_check_in_allowed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cs_group ON center_sessions(group_id);
CREATE INDEX IF NOT EXISTS idx_cs_date ON center_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_cs_status ON center_sessions(status);

-- 4. Create attendance_audit_logs (Track Attendance Modifications)
CREATE TABLE IF NOT EXISTS attendance_audit_logs (
  id TEXT PRIMARY KEY,
  attendance_record_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  reason TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_aal_record ON attendance_audit_logs(attendance_record_id);
CREATE INDEX IF NOT EXISTS idx_aal_student ON attendance_audit_logs(student_id);

-- 5. Create center_fee_invoices (Independent Center Tuition Invoicing)
CREATE TABLE IF NOT EXISTS center_fee_invoices (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL REFERENCES center_groups(id) ON DELETE CASCADE,
  billing_month TEXT NOT NULL,
  base_fee NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_approved_by TEXT,
  net_due NUMERIC(10, 2) NOT NULL,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  remaining_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  due_date TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cfi_student ON center_fee_invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_cfi_group ON center_fee_invoices(group_id);
CREATE INDEX IF NOT EXISTS idx_cfi_month ON center_fee_invoices(billing_month);
CREATE INDEX IF NOT EXISTS idx_cfi_status ON center_fee_invoices(status);

-- 6. Create center_collections (Official Receipts & Multi-Payment Transactions)
CREATE TABLE IF NOT EXISTS center_collections (
  id TEXT PRIMARY KEY,
  receipt_number TEXT NOT NULL UNIQUE,
  invoice_id TEXT REFERENCES center_fee_invoices(id) ON DELETE SET NULL,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL REFERENCES center_groups(id) ON DELETE CASCADE,
  billing_month TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  transaction_reference TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  collected_by TEXT NOT NULL,
  notes TEXT,
  collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cc_receipt ON center_collections(receipt_number);
CREATE INDEX IF NOT EXISTS idx_cc_student ON center_collections(student_id);
CREATE INDEX IF NOT EXISTS idx_cc_group ON center_collections(group_id);
CREATE INDEX IF NOT EXISTS idx_cc_month ON center_collections(billing_month);
CREATE INDEX IF NOT EXISTS idx_cc_status ON center_collections(status);

-- 7. Create center_financial_adjustments (Audit Trail for Voids and Adjustments)
CREATE TABLE IF NOT EXISTS center_financial_adjustments (
  id TEXT PRIMARY KEY,
  collection_id TEXT REFERENCES center_collections(id) ON DELETE SET NULL,
  invoice_id TEXT REFERENCES center_fee_invoices(id) ON DELETE SET NULL,
  adjustment_type TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  authorized_by TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. Create center_expense_categories & center_expenses (Operational Expenses)
CREATE TABLE IF NOT EXISTS center_expense_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS center_expenses (
  id TEXT PRIMARY KEY,
  expense_number TEXT NOT NULL UNIQUE,
  category_id TEXT NOT NULL REFERENCES center_expense_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  expense_date TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  recipient_vendor TEXT,
  receipt_url TEXT,
  notes TEXT,
  recorded_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ce_number ON center_expenses(expense_number);
CREATE INDEX IF NOT EXISTS idx_ce_category ON center_expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_ce_date ON center_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_ce_status ON center_expenses(status);

-- Seed Default Expense Categories
INSERT INTO center_expense_categories (id, code, name, description, is_active)
VALUES
  ('cat_rent', 'rent', 'إيجار السنتر', 'إيجار المقرات والقاعات الدراسية', true),
  ('cat_utilities', 'utilities', 'الكهرباء والمياه', 'فواتير استهلاك الكهرباء والماء', true),
  ('cat_internet', 'internet', 'الإنترنت والاتصالات', 'اشتراكات الإنترنت والألياف الضوئية والاتصالات', true),
  ('cat_salaries', 'salaries', 'مرتبات المدرسين والموظفين', 'مستحقات وأجور المعلمين والمشرفين والإداريين', true),
  ('cat_supplies', 'supplies', 'أدوات وقرطاسية ومطبوعات', 'أوراق المذكرات، أقلام، أحبار، ودفاتر', true),
  ('cat_maintenance', 'maintenance', 'صيانة وتجهيزات', 'صيانة المكيفات، الشاشات، الصوتيات والمقاعد', true),
  ('cat_marketing', 'marketing', 'دعاية وتسويق', 'إعلانات ممولة، لافتات ومطبوعات تسويقية', true),
  ('cat_hospitality', 'hospitality', 'ضيافة ونظافة', 'مستلزمات النظافة والضيافة اليومية', true),
  ('cat_other', 'other', 'مصروفات تشغيلية أخرى', 'أي مصروفات نثرية أو طارئة', true)
ON CONFLICT (code) DO NOTHING;

-- Seed Financial Notification Templates
INSERT INTO notification_templates (id, code, name, channel, meta_template_name, meta_template_lang, body_text_ar, body_text_en, is_active)
VALUES
  ('tmpl_fee_receipt', 'fee_payment_receipt', 'إشعار إيصال سداد الرسوم', 'all', 'pa_fee_receipt_v1', 'ar',
   '🧾 Professional Academy — إيصال سداد رسوم\n\nعزيزي ولي أمر الطالب/ة: {{student_name}}\nتم بحمد الله استلام دفعة بقيمة {{amount}} ج.م لحساب اشتراك شهر {{billing_month}} لمجموعة ({{group_name}}).\nرقم الإيصال: {{receipt_number}}\nطريقة الدفع: {{payment_method}}\nالمتبقي: {{remaining_amount}} ج.م.\n\nشاكرين حسن تعاونكم.',
   'Tuition receipt for {{student_name}}: Amount {{amount}} EGP, Receipt {{receipt_number}}.', true),
  ('tmpl_fee_due', 'fee_payment_due', 'تنبيه استحقاق اشتراك شهري', 'all', 'pa_fee_due_v1', 'ar',
   '📢 Professional Academy — تنبيه استحقاق اشتراك\n\nنحيط سيادتكم علماً بأن اشتراك شهر {{billing_month}} لمجموعة ({{group_name}}) للطالب/ة: {{student_name}} مستحق السداد بقيمة {{amount}} ج.م.\n\nيرجى التكرم بالسداد في موعد أقصاه {{due_date}}.\nشاكرين تعاونكم.',
   'Fee reminder for {{student_name}}: Amount {{amount}} EGP due by {{due_date}}.', true),
  ('tmpl_fee_overdue', 'fee_overdue_warning', 'تنبيه متأخرات اشتراك', 'all', 'pa_fee_overdue_v1', 'ar',
   '⚠️ Professional Academy — تنبيه مديونية ومتأخرات\n\nعناية ولي أمر الطالب/ة: {{student_name}}\nنلفت انتباهكم لوجود رصيد متأخر بقيمة {{overdue_amount}} ج.م عن مجموعة ({{group_name}}).\n\nيرجى التنسيق مع إدارة السنتر لتسوية المبلغ.\nمع خالص التقدير.',
   'Overdue fee alert for {{student_name}}: Overdue balance {{overdue_amount}} EGP.', true)
ON CONFLICT (code) DO NOTHING;

COMMIT;
