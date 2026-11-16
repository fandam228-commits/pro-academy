-- =========================================================================
-- PROFESSIONAL ACADEMY — CENTER MANAGEMENT SYSTEM ROLLBACK SCRIPT
-- Strictly reverts Center Management schema additions without data loss on core tables
-- =========================================================================

BEGIN;

-- 1. Drop Center Management tables
DROP TABLE IF EXISTS center_expenses CASCADE;
DROP TABLE IF EXISTS center_expense_categories CASCADE;
DROP TABLE IF EXISTS center_financial_adjustments CASCADE;
DROP TABLE IF EXISTS center_collections CASCADE;
DROP TABLE IF EXISTS center_fee_invoices CASCADE;
DROP TABLE IF EXISTS attendance_audit_logs CASCADE;
DROP TABLE IF EXISTS center_sessions CASCADE;
DROP TABLE IF EXISTS center_group_students CASCADE;

-- 2. Remove seeded templates
DELETE FROM notification_templates 
WHERE code IN ('fee_payment_receipt', 'fee_payment_due', 'fee_overdue_warning');

COMMIT;
