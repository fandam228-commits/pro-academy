-- ========================================================================
-- PROFESSIONAL ACADEMY: AL WALED INTEGRATION ROLLBACK SCRIPT
-- Removes all imported center records cleanly without affecting platform data
-- ========================================================================

BEGIN;

DELETE FROM attendance_records WHERE id LIKE 'att_hist_%' OR student_id LIKE 'usr_waled_%';
DELETE FROM parent_links WHERE student_id LIKE 'usr_waled_%' OR parent_id LIKE 'usr_parent_waled_%';
DELETE FROM users WHERE id LIKE 'usr_waled_%' OR id LIKE 'usr_parent_waled_%';
DELETE FROM center_groups WHERE id LIKE 'grp_waled_%';

COMMIT;
