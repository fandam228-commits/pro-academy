-- ========================================================================
-- PROFESSIONAL ACADEMY: AL WALED CENTER INTEGRATION TRANSACTIONAL SCRIPT
-- Mode: Idempotent Safe Insert with Conflict Protection
-- ========================================================================

BEGIN;

-- Step 1: Ensure backward-compatible columns exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_code INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS group_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_expires_at TIMESTAMP;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS group_id TEXT;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS scan_method TEXT DEFAULT 'manual';

-- Step 2: Insert 13 Center Groups
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_sun2_wed2_sec1', 'مجموعة سنتر الوليد (الأحد 2 الأربعاء 2)', 'Secondary', 'First Secondary', 'usr_teacher_1', 'Mr. Waled', 'الأحد 2 الأربعاء 2', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_sat3_tue3_prep3', 'مجموعة سنتر الوليد (السبت 3 الثلاثاء 3)', 'Preparatory', 'Third Prep', 'usr_teacher_1', 'Mr. Waled', 'السبت 3 الثلاثاء 3', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_mon12_thu12_sec2b', 'مجموعة سنتر الوليد (الإثنين 12 الخميس 12)', 'Secondary', 'Second Secondary (Baccalaureate)', 'usr_teacher_1', 'Mr. Waled', 'الإثنين 12 الخميس 12', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_sun5_wed5_sec1', 'مجموعة سنتر الوليد (الأحد 5 الأربعاء 5)', 'Secondary', 'First Secondary', 'usr_teacher_1', 'Mr. Waled', 'الأحد 5 الأربعاء 5', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_mon3_thu3_prep1', 'مجموعة سنتر الوليد (الإثنين 3 الخميس 3)', 'Preparatory', 'First Prep', 'usr_teacher_1', 'Mr. Waled', 'الإثنين 3 الخميس 3', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_sat2_tue2_prep2', 'مجموعة سنتر الوليد (السبت 2 الثلاثاء 2)', 'Preparatory', 'Second Prep', 'usr_teacher_1', 'Mr. Waled', 'السبت 2 الثلاثاء 2', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_sun12_wed12_sec3', 'مجموعة سنتر الوليد (الأحد 12 الأربعاء 12)', 'Secondary', 'Third Secondary (Baccalaureate)', 'usr_teacher_1', 'Mr. Waled', 'الأحد 12 الأربعاء 12', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_sat12_tue12_prep3', 'مجموعة سنتر الوليد (السبت 12 الثلاثاء 12 السبت 3 الثلاثاء 3)', 'Preparatory', 'Third Prep', 'usr_teacher_1', 'Mr. Waled', 'السبت 12 الثلاثاء 12 السبت 3 الثلاثاء 3', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_sat5_tue5_prep1', 'مجموعة سنتر الوليد (السبت 5 الثلاثاء 5)', 'Preparatory', 'First Prep', 'usr_teacher_1', 'Mr. Waled', 'السبت 5 الثلاثاء 5', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_sun1_wed1_sec2b', 'مجموعة سنتر الوليد (الأحد 1 الأربعاء 1)', 'Secondary', 'Second Secondary (Baccalaureate)', 'usr_teacher_1', 'Mr. Waled', 'الأحد 1 الأربعاء 1', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_sat6_tue6_prep2', 'مجموعة سنتر الوليد (السبت 6 الثلاثاء 6)', 'Preparatory', 'Second Prep', 'usr_teacher_1', 'Mr. Waled', 'السبت 6 الثلاثاء 6', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_sun6_wed6_sec3', 'مجموعة سنتر الوليد (الأحد 6 الأربعاء 6)', 'Secondary', 'Third Secondary (Baccalaureate)', 'usr_teacher_1', 'Mr. Waled', 'الأحد 6 الأربعاء 6', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;
INSERT INTO center_groups (id, name, stage, grade, teacher_id, teacher_name, schedule, room, monthly_fee, is_active)
VALUES ('grp_waled_sun3_wed3_sec2', 'مجموعة سنتر الوليد (الأحد 3 الأربعاء 3)', 'Secondary', 'Second Secondary', 'usr_teacher_1', 'Mr. Waled', 'الأحد 3 الأربعاء 3', 'القاعة الرئيسية', 0.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule;

-- Step 3: Insert 393 Students
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_1', 'مريم سعيد خميس', 'student_1@alwaled.proacademy.edu', 'student_1', '6a20233fa1a5d822711ab6375063f4d2:872ea6f2ad0b79b819ea5d9ecfa93a810c33ab05c921b4e28f565d742a6875e8d0fb5649a062b0f200c6f6d1b60b62a211d77a18f7c2c8fc3637efe07d53d3cf', 'student', '+201012488023', '+201012488023', 'Preparatory', 'Third Prep', 1, 'grp_waled_sat3_tue3_prep3', 'wld_qr_31631983ae8d850b7bb489dcff640fbe', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_10', 'لوجين السيد احمد', 'student_10@alwaled.proacademy.edu', 'student_10', 'be9560019ad1242f32ced401be2348a3:a8cff71470b1be013ea502fd80e0c036decd4d66170f1f4c4d62c872bf00f000078a0d48064b09d829ecfa6fea1325c2934f623465b7f53fe4e6b7be8abd16d8', 'student', '+201032698504', '+201033702044', 'Preparatory', 'Third Prep', 10, 'grp_waled_sat3_tue3_prep3', 'wld_qr_0d2e23431e0d6f9d29bd484e0e9c2343', true, '2026-12-31 23:59:59', '2026-10-24 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_100', 'رقية عبد الهادي احمد', 'student_100@alwaled.proacademy.edu', 'student_100', '4dbaced1ac5cc866a09f6459398bfb13:c95ce9dd9e3080452375bb875ef09dc0aaafa21f5524d4b2fcbf9697f6691f2c2104d8b5602204dceddec7720cacebf1ebf82ad000e019fad685a34aa5f8e9f2', 'student', '+201275130505', NULL, 'Secondary', 'Third Secondary (Baccalaureate)', 100, 'grp_waled_sun12_wed12_sec3', 'wld_qr_23113bb233fd438abfab551605e563c6', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_101', 'جني شريف حسن', 'student_101@alwaled.proacademy.edu', 'student_101', '15ed46c19d2d28b07fb68a9eddfc80fe:c4573ee88a0c46cd52199c944c3c2cbd2264656cda4dd6b49477ec19e5d888bb6da1d83bca9ca83d09c421d691d9a4d51ac6ff31a4ea34fa0e7f180783ec6a85', 'student', NULL, '+201019013632', 'Preparatory', 'Second Prep', 101, 'grp_waled_sat2_tue2_prep2', 'wld_qr_f9fc761acc85eb739186833b8b898bd3', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_102', 'محمد شريف حسن', 'student_102@alwaled.proacademy.edu', 'student_102', '236c1892596bbb74fa14dcf57ec62cd5:d55e2727f59746348a1040a04bd24c2ec0849a0df173315e90d75d981e89006f62964f21ec18b2bb52de5981b07fe0ef99eeb1ad9a2ad956efd300cf4287c132', 'student', NULL, '+201019013632', 'Preparatory', 'First Prep', 102, 'grp_waled_mon3_thu3_prep1', 'wld_qr_6104708d54e5052bb93c00ffdf4a03c8', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_103', 'منة عطية', 'student_103@alwaled.proacademy.edu', 'student_103', '8b1e2d88bc1e959e08231c94b7c97f11:736d08f6efd910cccd62fd1c4a552009f0a6dba330a4a73cf016bf74b047da9783971924945877db721dac1317d9d748c4f33f88c7e408a50f2b3fbfad8b5951', 'student', '+201096179472', '+201011373816', 'Secondary', 'First Secondary', 103, 'grp_waled_sun2_wed2_sec1', 'wld_qr_a51776a718e029254da598c1de83636a', true, '2026-12-31 23:59:59', '2026-09-06 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_104', 'مريم محمد فتيحة', 'student_104@alwaled.proacademy.edu', 'student_104', '11d7a7e7afc8e33958403ea98ddd1fa6:8d9c372f3d0e5b3c1675355158da860b0e34ea5b3a8090ee85d62e40966c4559b633f1840d8c0b39e72990856ea4c421fced3753e76247fd00c7dc7d4fd7b839', 'student', '+201006805840', '+201006805840', 'Secondary', 'First Secondary', 104, 'grp_waled_sun5_wed5_sec1', 'wld_qr_b8e627ee9146c4dc40e0d8a2c6280904', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_105', 'مريم محمود', 'student_105@alwaled.proacademy.edu', 'student_105', 'c570c91880816752f4778587b56b8a39:2870a29b602aca83c833357e0fc0f65e553fa69bb25a4a2da84e3c627e5fb0263ee2743ba68989f299d47e3f0c08cbdf1f7d4d6738d31af5892b5245b6c0f24e', 'student', '+201211864953', '+201503148955', 'Secondary', 'Second Secondary (Baccalaureate)', 105, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_b1acade6d753c1c96d2b1df2bf1bc92b', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_106', 'سعيد محمد خضر', 'student_106@alwaled.proacademy.edu', 'student_106', 'bfa0d3fc8e5fc0a88fc1c73d3702a1e4:7a880dc1c921e809d0b4798a4fd5c69b6baec255e655c79e919ad615974a1cb641c7dd1e0c8597d257ff0153619a765cb5b7e809f08e93f812a64be9b51a94d2', 'student', '+201004940427', '+201004940427', 'Preparatory', 'Second Prep', 106, 'grp_waled_sat2_tue2_prep2', 'wld_qr_64854a205416f25ad502325ee8654037', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_107', 'سلمي علي', 'student_107@alwaled.proacademy.edu', 'student_107', 'fd6aa9ef0d1afc3490e3ffedbac0785a:f9c56a79ab5db1961c751af493d59c7311839c18e965422a45688dd8e33170a892f4a8967c0fcf86e6189fedd0a6474e6812a52f4782fd2ac9df4d57b981c698', 'student', '+201146925728', '+201143556761', 'Preparatory', 'Third Prep', 107, 'grp_waled_sat3_tue3_prep3', 'wld_qr_9704c0bfbb5e2c6d09bb86edeb1f1ceb', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_108', 'احمد ايمن نوفل', 'student_108@alwaled.proacademy.edu', 'student_108', '06d1bcc82c3885b352cd1bfa3ee70bba:aebedcd5c123df2d78bce5a3697e8f36316b79ee394c5cb993a5baa440bffa22e18a5625bad08e2406332fb78307e07fcb4f755c5fec8bf22c650cec899314bc', 'student', '+201096924417', '+201004323028', 'Secondary', 'First Secondary', 108, 'grp_waled_sun2_wed2_sec1', 'wld_qr_d6f75cb9d3b6235676a0f0a08ffaee02', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_109', 'سلمي البدري', 'student_109@alwaled.proacademy.edu', 'student_109', '073ab2d757792638c2c7737e9c86d1e9:e84f0f65fa9ad8d2f7706db9bb7414de0b68420dbf3bf483cb2efdf84039194858eba0c48bacac412f4842dd821753f407809236b3b688384f0066711f3247b5', 'student', NULL, NULL, 'Secondary', 'Third Secondary (Baccalaureate)', 109, 'grp_waled_sun6_wed6_sec3', 'wld_qr_6e9e7eb8a7dd5f1103e3475ab511b3df', true, '2026-12-31 23:59:59', '2026-10-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_11', 'ساندي محمد السيد', 'student_11@alwaled.proacademy.edu', 'student_11', '68642b4975abaf77cd7d329bc7b94bf0:656fea19d0aaa0637000ae77a504d7c45b1213d28dc17bccc3b1db94d529c8b7aa1aeced33a390a55d0938fbfaba39b554b37c961a5d81962644963ca853c557', 'student', '+201035549931', '+201013303273', 'Preparatory', 'Third Prep', 11, 'grp_waled_sat3_tue3_prep3', 'wld_qr_e02a6a7b49af10e28db79e87fcd620dd', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_110', 'اشرف محمد الصعيدي', 'student_110@alwaled.proacademy.edu', 'student_110', 'aafdd6b4ce333c4387d656d57a8b3cf3:5a989099a171e944e0080191740d0026a3c8ddd520ea1cf697bde9eed817a9f46dd825b9fd5ace5781b6fd3ef9bfa7c178ee1baf062b62b0e33118b764fbbdbc', 'student', '+201040614320', NULL, 'Preparatory', 'Third Prep', 110, 'grp_waled_sat12_tue12_prep3', 'wld_qr_c89723e0b79203f7bb5887d0bb562fc2', true, '2026-12-31 23:59:59', '2026-09-05 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_111', 'فهد إبراهيم احمد', 'student_111@alwaled.proacademy.edu', 'student_111', 'c709defd2ee8cbed27703201221889a7:63b1aece96b1af4aad3805b50d658e543fbe22b901f280306b8cba0feb2ca9bb8450b692087b14566b151805fa8d5b1cfb586537dd7e24fad4f4b7a49e12bdab', 'student', '+201092390112', '+201092390112', 'Preparatory', 'First Prep', 111, 'grp_waled_mon3_thu3_prep1', 'wld_qr_c4ccae1e13d570d00272e341258f7472', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_112', 'ريماس محمود الجبالي', 'student_112@alwaled.proacademy.edu', 'student_112', 'cc3aadf9a53dc44b7a58660d7e1bc8fc:a59f1647b357cd5fdcfbd5cdb13d692a69a3210dcee121684b7eec6566e8628f1cabf78843a87fbf4546b86a0f21b8e467fe3e97412630fc724b659c8d3362a9', 'student', '+201099840079', '+201550892109', 'Preparatory', 'Third Prep', 112, 'grp_waled_sat3_tue3_prep3', 'wld_qr_e2395948edfaddcd7bf7f352e4f9633f', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_114', 'ايمان أسامة كشك', 'student_114@alwaled.proacademy.edu', 'student_114', 'd62c5bf9ed9872660fd177f378897119:4e102e40c0619130d4cbf544a340edc7df307065938cbf4a7928e9f30751de0c475142fdc0c02608ed310aa761dfd3e74e11168ce10aaf274db112614a28c4b4', 'student', '+201271229777', NULL, 'Secondary', 'First Secondary', 114, 'grp_waled_sun5_wed5_sec1', 'wld_qr_73341bb150126a7459b7285b09f05886', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_115', 'كنزي محمود هاشم', 'student_115@alwaled.proacademy.edu', 'student_115', '5a718562ec00a51d119d82cb14016fb7:36ac2c42ccfffec0146c12cf97c4c4b0d79f965701af7b1bc09cc62edf5ca103bef2af6d9ae4778a123a58a2ffac3e667de97fed2582d4875e5198f278366103', 'student', '+201203950361', '+201001270305', 'Secondary', 'Third Secondary (Baccalaureate)', 115, 'grp_waled_sun12_wed12_sec3', 'wld_qr_bf5d6eba9b12ef10b8b22b936df69037', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_116', 'ريناد إيهاب', 'student_116@alwaled.proacademy.edu', 'student_116', 'c17d9135780871be72aef1420996ae5d:4ec4001241fbd9b92382b7214f55a2c89a9ff1168ba15fe816e265775af4db09172a19faed541e0a3cf5127ac9a6bceb16f2367385c28b1298b78f5e6386e9e4', 'student', '+201003602651', '+201062880210', 'Preparatory', 'Second Prep', 116, 'grp_waled_sat2_tue2_prep2', 'wld_qr_c1cb56b41cf84883dd662eb910b0d56c', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_117', 'جومانا حمدي خالد', 'student_117@alwaled.proacademy.edu', 'student_117', 'b9f88570c0ff7f9cec115e212ce0397a:15808ace0a9d272546ca1bf40afc70a037ade77b5f787f715b347f3c96289af35e87580caea60a204c5b1afea1b10ec3644ae18c99bb6e7849801900d33d34f2', 'student', '+201003789319', '+201003789319', 'Preparatory', 'First Prep', 117, 'grp_waled_mon3_thu3_prep1', 'wld_qr_3be726076110bc74c11e12b24bba8de8', true, '2026-12-31 23:59:59', '2026-09-26 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_118', 'زياد فتحي', 'student_118@alwaled.proacademy.edu', 'student_118', '1f429cad3729d22fdd0635d9727231ed:073d70e19dd214d1d7adfcd0a51d2841089313768b8ed2a3b0655f761cbd1e5dfb6d889abd9a10144d83215e93c52267878d3854078184eb2e7b757aed51416a', 'student', '+201096242891', '+201092855612', 'Secondary', 'Second Secondary (Baccalaureate)', 118, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_0a0ec4bedd4483fad3c2ce4ef1ecffc5', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_119', 'محمد محمود عبد العزيز', 'student_119@alwaled.proacademy.edu', 'student_119', '735acc1d4a85f758d11673b9320d3d9a:b935a2301067e01b19275b019d1d83c6d0defb8f806f152565bb70a08e1dc5bcff6ae9b515937f7f26b539b999e522b3958e519e231719350c262cb8cf715b27', 'student', '+201063995671', '+201091373633', 'Secondary', 'Second Secondary (Baccalaureate)', 119, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_f1b0d7bbeedb54cb7a54ccda169832e7', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_12', 'خلود جلال طلعت', 'student_12@alwaled.proacademy.edu', 'student_12', 'de1032682760a14d41b02403dc342930:dd86cf04b6dbe5f53d51adc36a5cb800b51a7e025bc4d151c788128a4d0f715642d676ecda3969d4d02a002025a1e342b117b24abac7507310ca1cbb5c6a38be', 'student', '+201027727458', '+201024713744', 'Preparatory', 'Third Prep', 12, 'grp_waled_sat3_tue3_prep3', 'wld_qr_4c0cec9ff27c546ba75ec2d639cc0cd9', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_120', 'إبراهيم  سلامة طلبة', 'student_120@alwaled.proacademy.edu', 'student_120', 'dc39a4f02b215bf83f27129d0fc1c1ac:a5801e8ea3a1e860906522d4f81442a4e58d89b15b021ba71ae84f8230c50d8b0ce06c1956ad63fb26248d5973520ceba638c37fba56c749919faa075992cd4f', 'student', '+201119279957', '+201090879171', 'Preparatory', 'Third Prep', 120, 'grp_waled_sat12_tue12_prep3', 'wld_qr_c617998029695aaa8b46145d3d8adb2c', true, '2026-12-31 23:59:59', '2026-11-10 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_121', 'ملك طه علي', 'student_121@alwaled.proacademy.edu', 'student_121', 'ae2e6db58d12392d9c6f29df44b9e0d2:06940ff9367056cfd107414e6002039284740372809d0b772a0102148c909985abddcc31049cb48deeaa74f5370a799d8e2fc34b7ba6e14b64d906b42216fa99', 'student', '+201123039932', '+201123039932', 'Secondary', 'First Secondary', 121, 'grp_waled_sun2_wed2_sec1', 'wld_qr_728cfd61cc1d5403389fd7e498c0a7cd', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_122', 'فاطمة إبراهيم سليمان', 'student_122@alwaled.proacademy.edu', 'student_122', '0443e67634315c389ea863c1f7763b0c:c1ab588dc7045a6863b584b09ed058094bbb4aa69b9e556ef6076434575e4783a100aa364b7425f9749dc9ff0954af7d83d5640def0c06010bfa28318507bef3', 'student', '+201030177266', '+201030177266', 'Secondary', 'First Secondary', 122, 'grp_waled_sun2_wed2_sec1', 'wld_qr_79791c84731aaa92911e98c2710f8c50', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_123', 'سما السيد هتهوت', 'student_123@alwaled.proacademy.edu', 'student_123', '9952325d7964af114e986894067652f6:636033a9884f7ea94ddb19bdaaa6e179b3146532681aa99c1880104fd10b09e34bfc6b254711496049a9dc6e1bf6706bf811c232cd74088c6f5de4da00497f7c', 'student', '+201050446873', '+201050446873', 'Secondary', 'First Secondary', 123, 'grp_waled_sun2_wed2_sec1', 'wld_qr_1ad97c97b8aad52a4b38338452ed1886', true, '2026-12-31 23:59:59', '2026-09-30 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_124', 'واءل محمد راشد', 'student_124@alwaled.proacademy.edu', 'student_124', '440e0568db416e68d1a054f2bee84465:cbfd434bc9386b35bc3f1b545146ae21e9f571eebd54014b4f67bb1237de3abbe59b033daa380b5c44fb3382493469ff52d70670b2484a9e0315d625a1b1d801', 'student', NULL, NULL, 'Secondary', 'First Secondary', 124, 'grp_waled_sun2_wed2_sec1', 'wld_qr_f2aafea54bf9eb1d4d3b3170b081d275', true, '2026-12-31 23:59:59', '2026-09-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_125', 'ياسمين عبد الفتاح', 'student_125@alwaled.proacademy.edu', 'student_125', '5272f2413ac19c0477d88ff24ca49419:fc14af65267dfd1d0b553d064953aac1dede69b739ccc45b13db92b2b5fda4897d0efd26e29eaa7768a36d5495dc82484d277dceb2042d32fc59bca07f8c728d', 'student', '+201008262911', '+201020689011', 'Secondary', 'Second Secondary (Baccalaureate)', 125, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_a072d7b27695e1a450d1f65f3e65f071', true, '2026-12-31 23:59:59', '2026-11-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_126', 'سلمي ياسر علي', 'student_126@alwaled.proacademy.edu', 'student_126', '52d147b8a8e08210915aaa49608e4509:2ace582bc33103914c7150c99b82a58918f61fc21944dc676a66c0863fa3232c371e3df5cb706fc6316bdba894dea11bc54cf4bc0d336ab76891ddd41fccd6f6', 'student', '+201280952017', '+201040688716', 'Secondary', 'Second Secondary (Baccalaureate)', 126, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_f64d06e44eebf0c0629643259aff7745', true, '2026-12-31 23:59:59', '2026-10-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_127', 'اروي احمد سيد', 'student_127@alwaled.proacademy.edu', 'student_127', '8de563262af58b74cf651fbc26b22bb7:88bdb0b16e85eb88fc13a0b315405d2e7715a22d7d1db29eb5c93127695fdf824162fe7780afdbe58f5a27456f4fba29f1abc10bceebc6c7309784306d73d4e1', 'student', '+201124820054', '+201033788620', 'Secondary', 'Second Secondary (Baccalaureate)', 127, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_8765b9b78b9166d98fbe4867137ea875', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_128', 'إسماعيل احمد محمود', 'student_128@alwaled.proacademy.edu', 'student_128', '2ae400e4a32d6116a3d23175a23e12e9:6be19996e4b4d95ace7113c73b97eef9f4663a0af82a071ff45d1c59bd519be9ca37d48b083dee207435b618332f3d31638a4a514f5c5cc78befb38746f5a105', 'student', '+201288301783', '+201038818578', 'Secondary', 'Second Secondary (Baccalaureate)', 128, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_52a6eb89e16cb7c389bf22285fc6b42d', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_129', 'عبد الرحمن احمد عبد النبي', 'student_129@alwaled.proacademy.edu', 'student_129', '33f450d788592250993c09283035c032:80e7592208133c9463f21c15651f00933017f5fda5039f587103d267a8927ac7740ff5b2686bc3d6f8da995373456a08125ef602241df129e1c0bc8bd90cc817', 'student', '+201011698315', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 129, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_fb0fe8e7f662b4a75ff32698bbaa499b', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_13', 'ادم احمد', 'student_13@alwaled.proacademy.edu', 'student_13', 'dc80239210f27437d2891bad5bddfbbb:b8df675eb7b84a88d0cce1d5a50124d5e07ba055e1a3d3c190e625cc469b2d34f88f2a20242d42199a756585f07ad55efd61f1254d2fa34288cb7c151ba880af', 'student', NULL, NULL, 'Preparatory', 'First Prep', 13, 'grp_waled_sat5_tue5_prep1', 'wld_qr_b64ba4f5d6d6c5363c9faa2e0cfe3667', true, '2026-12-31 23:59:59', '2026-10-17 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_130', 'محمد هاني الجرم', 'student_130@alwaled.proacademy.edu', 'student_130', '13adf78942bf39de62084c15d48ee97c:89e4e6cc5c9fab4602c26862c915082d8119a58c00ed6edda39268edd9c37961b749cec780eb682972be8c2ec36a75b7f4406f0d836075eb079f3658918d7a29', 'student', '+201095837946', '+201116655673', 'Secondary', 'Second Secondary (Baccalaureate)', 130, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_a16f1d0d8e0788e8ff90511fe358b99e', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_131', 'زياد محمد كمال', 'student_131@alwaled.proacademy.edu', 'student_131', 'e48e7d01f5313b2491a0059753d451d7:8a0aba7bf3bf5349f5215f54f0dac87cc8fbdc53ffab07105cdc266b81c831e95facaff41849b6bc798f67237d9a6bfe282276e98e01b5b34dd357ad2811a1e2', 'student', '+201067095647', NULL, 'Preparatory', 'Third Prep', 131, 'grp_waled_sat12_tue12_prep3', 'wld_qr_86c124c127251b13e30dea7a6468973b', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_132', 'ياسمين عادل مجاهد', 'student_132@alwaled.proacademy.edu', 'student_132', '4280d8bbbc028705b93a4b0eb625c096:29909de2372fd45ebbdb503b2912a693a2b9ab31e2bf164e4922ee25e6d625304fc53fe177f1c6a6c0261d21538de7f2198a51cdaecb276a92cf527e728b76c2', 'student', '+201206435692', NULL, 'Secondary', 'First Secondary', 132, 'grp_waled_sun2_wed2_sec1', 'wld_qr_8a68348227051490644e4698c78b5a0c', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_133', 'اسراء الفرماوي', 'student_133@alwaled.proacademy.edu', 'student_133', 'ffce5b8a0ad4d9887c4317d72d945c07:06351cc603496c590ace07cdd6d99fcd120e0b5e728860f0eeaa841018df0cfb001dfae12f03bac903903bec7df06a936aff67b3749743f4e3ae4a9bde4e88ac', 'student', '+201110316535', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 133, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_6114319737c846a1cbb8d562c27a9a31', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_134', 'اسراء محمد إسماعيل', 'student_134@alwaled.proacademy.edu', 'student_134', '6f2a0adb7194752f3f623f4e42aae586:32dc4efee83286ce49ae21b65f463e9fac2268cdce379a212b00ed1eca5320b67254ffe7dcd6877cb1f2eb81e41bb350c977da3fd2c0b7c770205f2bbd30cfe0', 'student', '+201022392474', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 134, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_06cef9b1cd73a1fbaf3d9f5b914b4b68', true, '2026-12-31 23:59:59', '2026-10-17 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_135', 'أسماء عصام الفرماوي', 'student_135@alwaled.proacademy.edu', 'student_135', 'f43798ea348a0156de7a4745332bb326:ad9f22fd1f22be3b016ef7d5e0e4db536829f588a1b6b380c4170658d5ed12020ed26aedb0d3238b7d84b6567fd93cad7a97e600b449eff04b32bc6fc9269357', 'student', '+201555047194', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 135, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_ef6d478138fb015fd8cc7fe475bb1827', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_136', 'روان عبد الخالق', 'student_136@alwaled.proacademy.edu', 'student_136', '439f0ef3956146fb88a2c40aee7f981c:9833ef18cd3e40044d0f20a37fef4363976b5a32fc2918bb4d8460860420aa0595c07441c7cbcbabe5a36af791833a00e6ca323f314fbf1c841e04fe3b4c783c', 'student', '+201274502248', '+201002017278', 'Secondary', 'Second Secondary (Baccalaureate)', 136, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_bae3176c6a5caace3f836a7d4f90e3b4', true, '2026-12-31 23:59:59', '2026-11-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_137', 'يارا  هاني فاروق', 'student_137@alwaled.proacademy.edu', 'student_137', '4906feef2dc5384fa5441ad28eceb068:26a0f1d6fb5ab5867e63c303f38c22bfba1875256ff117967de1ebc0ec358e7a1a8f6ea87ea8c9712d34a93d8d91d0e34b46d5a2f3774f199958d824ed19f3b2', 'student', '+201033425521', '+201001030779', 'Preparatory', 'Third Prep', 137, 'grp_waled_sat3_tue3_prep3', 'wld_qr_95b5e325f853c5cf33894f4f826a84b6', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_138', 'ايمن احمد عبد الهادي', 'student_138@alwaled.proacademy.edu', 'student_138', '1fcd5318e88da8c6c4ee13c171215359:c0490438d7ae8264093df924b3848032c5d6f0e57a8885336084108f9dbd7e6db85bb024eb286dbdbf4a6726d0e66ad48ca561c9f80b0c7b144f7904c32b23a6', 'student', '+201064539170', NULL, 'Preparatory', 'Second Prep', 138, 'grp_waled_sat6_tue6_prep2', 'wld_qr_167de6023d89166354ea2ac7abae4e6c', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_139', 'لوجي احمد عبد الهادي', 'student_139@alwaled.proacademy.edu', 'student_139', '2cfe359cba8665e5deda9f5850bd503d:12dab738867a35ad58614514f79b8cc53630001db4e2d99cff433d3ae118f47be3202b37959fe65108841ceab93387192eb1a02e86160d501db6d65b73767445', 'student', '+201064539170', NULL, 'Preparatory', 'Third Prep', 139, 'grp_waled_sat3_tue3_prep3', 'wld_qr_e88e6404833c7458021a1d74996b159d', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_14', 'احمد محمد حامد', 'student_14@alwaled.proacademy.edu', 'student_14', '3a4ca2f8e703755818b3b50c7e1f74cc:d720bc949f1a63aa5408cd8505b0c3e124ada757b9df5ad6f5ed4830f7e2e8309e54695fdf57917961ebcbdcc22934b8b234aac664f5eafe89f64589c4cafa72', 'student', NULL, NULL, 'Secondary', 'First Secondary', 14, 'grp_waled_sun2_wed2_sec1', 'wld_qr_80722a9b7a9a2e2a73746847daaa7f6a', true, '2026-12-31 23:59:59', '2026-10-18 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_140', 'ريماس هيثم محمود', 'student_140@alwaled.proacademy.edu', 'student_140', 'd985c8d0d1b4664bc63220cccb66e550:0f9a10b2920eebff0db1a2b2e0d2be9b38fc61045337ec76d105bf7c78a50384bba6f58f8cf375e3c25a5d83e20e198ef95948b626822ec1d9632b9f4ca6ad5f', 'student', '+201063403201', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 140, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_5c63a910e2327904e2d4559d07f6acef', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_141', 'اسلام اشرف زيدان', 'student_141@alwaled.proacademy.edu', 'student_141', '108443e06a5cc788f10b1313f5c0b890:ef57fdacddaafe44ecf34262a8a71b20f7ec2cbae2b88cd2e6c6c0c0b65158b9d4169237df14f070fe4b96a67b9a31f1cb0191de9c85ea42c1ce286012c712b3', 'student', NULL, NULL, 'Preparatory', 'Third Prep', 141, 'grp_waled_sat3_tue3_prep3', 'wld_qr_f7399603c4216440564dfbf175eac6e6', true, '2026-12-31 23:59:59', '2026-11-10 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_142', 'يوسف عبد الحميد', 'student_142@alwaled.proacademy.edu', 'student_142', '42970c7a459a1a82a35b518131f653f1:82cfaef37a50ec53319e0f9451be3363da837f2bcceb0314681618f5060a3fa0b0e4019cd75ffec011d530f4933823d935c250ba74e6569dd8dca3eb9adb0b8e', 'student', '+201007877014', '+201010735249', 'Secondary', 'First Secondary', 142, 'grp_waled_sun2_wed2_sec1', 'wld_qr_bbbedff2d9a469fad5a20ac78211945f', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_143', 'حنين خالد', 'student_143@alwaled.proacademy.edu', 'student_143', 'd2b5e46aba6c5acb17c2b65e94fbc5f8:3c791183af17f9d9d479992d6da94957efdc539022e07ae78ddd54af739e46de978af987562ea3eddeb8237844be534826f37852ebb4f34c16ccea65798ba716', 'student', '+201037684319', NULL, 'Secondary', 'First Secondary', 143, 'grp_waled_sun5_wed5_sec1', 'wld_qr_a6b2ac6f88e8737706edffa9f8901e82', true, '2026-12-31 23:59:59', '2026-08-23 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_144', 'محمد محمود إبراهيم', 'student_144@alwaled.proacademy.edu', 'student_144', '186b7998457e305938f4984950639c66:40bd891a2daf619007db4ac1a992c9fd1f76a0d9465b6ff5726b8caadfede8abf1a73240fd2407539b73a9e906de2f5489059d1ba664dd6a0f7bc4b17105ec41', 'student', '+201091292345', NULL, 'Secondary', 'First Secondary', 144, 'grp_waled_sun5_wed5_sec1', 'wld_qr_a492d4c95d1c6b2ebdae76e6ab03c926', true, '2026-12-31 23:59:59', '2026-10-25 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_145', 'حازم وليد', 'student_145@alwaled.proacademy.edu', 'student_145', '672f8342a267ff2d67a9c25ecdb08338:ffed5e8239505cb067ad0dde5f01460b9d7166251603d33a20a2ecf7106c8fc61d8c5e17a93248b7de1b6f02e730134e8ed14ffa34b111b3463eed244a5c4e4c', 'student', NULL, NULL, 'Secondary', 'First Secondary', 145, 'grp_waled_sun2_wed2_sec1', 'wld_qr_83f793a065039df3e36250d0425e3e27', true, '2026-12-31 23:59:59', '2026-10-18 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_146', 'احمد نبيل الفحات', 'student_146@alwaled.proacademy.edu', 'student_146', '3111c33726ecf4647b490386d07d8532:342279bc15b1c2434f9affa6ad1da60358985b3366a9486eff3187bf82111bba9317e467ac11ecd12de8f59271bdd53bf99709c6e7d606c255074c9a116ef938', 'student', '+201030906452', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 146, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_db980b5c32d7d3ce9a4229fed815cf08', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_147', 'منة مصطفي الاباصيري احمد', 'student_147@alwaled.proacademy.edu', 'student_147', 'cad62fb0e284eea26286c1211397a011:03ea0da1d5943573ff943c6f75e65668154befeb1bf8c23371d836958be13d31cd8959b01e55d43e3e33054a3381fa2d48f3cd109c744c5ae05590734783dfa2', 'student', '+201069142007', NULL, 'Secondary', 'First Secondary', 147, 'grp_waled_sun2_wed2_sec1', 'wld_qr_490278ef7f9948153c969cf8b94dd9dd', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_148', 'إبراهيم علاء عراقي', 'student_148@alwaled.proacademy.edu', 'student_148', 'd66c0ec556772bf99d4c923c00991926:69c7833ebd4ef95b81c27e794155e6696f0c29b573f3ff31bb7e2a9ec8c5f660784adfb1d19e2a9b2e96d9d32cd206da8e88761c80ccd103bb9ed790433cc3bc', 'student', '+201002432633', '+201014822555', 'Secondary', 'Second Secondary (Baccalaureate)', 148, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_f26a77e882be8c4b5d4825487ad8a820', true, '2026-12-31 23:59:59', '2026-10-14 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_149', 'احمد اشرف راشد عبد الرسول', 'student_149@alwaled.proacademy.edu', 'student_149', 'b16b57bed42eacd48a4515860e47833c:3f49dbc4fc875689ccf691a89323fbe0a705ed671231e93f8efc184354489f8d4ce7a276c508d3b2528ed144d0e99f0abc57dd3aa87cb63f0660833f114f7944', 'student', '+201068599538', '+201068599538', 'Secondary', 'First Secondary', 149, 'grp_waled_sun2_wed2_sec1', 'wld_qr_c1b084acd844a7ad1a978bf75dcbcf4d', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_15', 'محمد عبد الرحمن', 'student_15@alwaled.proacademy.edu', 'student_15', '049718593950c9f492d043aa560cf362:3867bd221c39a4d0761634043bee1ed9e6623eb775ad9949f3982098efb904f254fbe9c5318aaa0471b9c68e7c267c234530300c4f62100af161e1bdd1142620', 'student', NULL, NULL, 'Secondary', 'First Secondary', 15, 'grp_waled_sun2_wed2_sec1', 'wld_qr_565e6218fa462abaa03878fe0f89f6a8', true, '2026-12-31 23:59:59', '2026-11-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_150', 'احمد محمد جمال', 'student_150@alwaled.proacademy.edu', 'student_150', '662f8e3074a2fbb48738e6cef38a831a:7ae9f0bbc34a0c27ab138e5582888b70661ca5f3361847052fc0f2c678c47d29eab386352750a9cf5b539fb987a5e519d63e603e055fd607234b636ba4bd2ba4', 'student', '+201023939433', '+201019793665', 'Secondary', 'Second Secondary (Baccalaureate)', 150, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_e316c9bc0847fac3cbbdabe11cb8ed35', true, '2026-12-31 23:59:59', '2026-11-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_151', 'هدية', 'student_151@alwaled.proacademy.edu', 'student_151', '91cbdf7073ca7ce7e191ad84b2decba2:ccd6db02db958d389339d7930fe944d641850d9565b2fc3a8c5df91f783c010b765b1d9a1d36d7287354edef6d5c1b982b36b559bbda473e674c0214546fd846', 'student', NULL, NULL, 'Secondary', 'First Secondary', 151, 'grp_waled_sun2_wed2_sec1', 'wld_qr_2156bafe6d3294083306a97f453c93a1', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_152', 'سعيد الشاذلي', 'student_152@alwaled.proacademy.edu', 'student_152', '8cabb322ededb5324aed667344b2df49:5d620f0dc8bc43c76ed1bdb49d03317fb576aa2f2f2908f6356ca071fbfa980c494e81d21bac3338f37b6da63eb90a6e33683f5e2bf0f299096c7f97ef91ee9c', 'student', '+201005146606', '+201002049870', 'Secondary', 'Second Secondary (Baccalaureate)', 152, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_5b9d761d9732532bdbf23cdfde55ccc8', true, '2026-12-31 23:59:59', '2026-10-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_153', 'ايه طه محمد طه', 'student_153@alwaled.proacademy.edu', 'student_153', '34d88de1a2f52c681202779b547819f5:1d27965479d8cffcd6550b68113694bbb660bb045a50dff87abbf9e19b843d898204209f20be7799f3e86de20c560d14b72c8485f2adb6ab54242035eab57002', 'student', '+201503819614', '+201068158139', 'Secondary', 'First Secondary', 153, 'grp_waled_sun2_wed2_sec1', 'wld_qr_65cd82da9ed623cb71223f89763a1855', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_154', 'محمد بهاء فياض', 'student_154@alwaled.proacademy.edu', 'student_154', '467a3f30a0ca4e0a6dc55f5ccdb47c8a:29612f68d8954bc72aa8c6cba7d23ddf4b94bf38dfa92e56423d1fe536ba4f6a118a6bd7cc6c59338cb965458a79d0d2b963bcffae9f78b8895f610641f5d61f', 'student', '+201029085774', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 154, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_abac6681700cfd46a04b68948948cdcb', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_155', 'مريم إبراهيم كمال', 'student_155@alwaled.proacademy.edu', 'student_155', '63d92ea916c23e68a915d17c33d8ca45:493d099127e03bd4ba348e657958b4b02137c6cbd5cd70abb20feec6a9b090d22d95327b97416c033ed31b7456fedd2d70dcbeeb750e1bbbd39c3936126b604b', 'student', '+201280887813', '+201003540106', 'Secondary', 'Third Secondary (Baccalaureate)', 155, 'grp_waled_sun12_wed12_sec3', 'wld_qr_855c949586e7b5c656994fec84812a5c', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_156', 'ملك سامح إبراهيم', 'student_156@alwaled.proacademy.edu', 'student_156', '7f7c7af640d3d43e5e97d1ae10a3fbb8:e1012581cf9b5c7fbb73c3e5518683a9a3ff66c04947b0d3e459b1e2dcefb4291f14a43c7f87d75d795fa4f6d8c1f35c300bcc5d3052c281a7bf6e73548f6c3a', 'student', '+201036185683', '+201203208030', 'Secondary', 'First Secondary', 156, 'grp_waled_sun2_wed2_sec1', 'wld_qr_d69184edc4ae4000ea96ead8751fbd0e', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_157', 'سما محمد امين سعد', 'student_157@alwaled.proacademy.edu', 'student_157', '1471926f1c58b06aa66c9d61d629c033:78de0130c720fe212dd1b62edb2621a52ce961a5430736e6400a3bc162a5cf1cdde4d748df6558d87263cd6e9e663700a03bfcf1f581f2ac822f112fe062b255', 'student', '+201551037821', NULL, 'Secondary', 'First Secondary', 157, 'grp_waled_sun2_wed2_sec1', 'wld_qr_e047ae0525b5770a112ffe7a4db68623', true, '2026-12-31 23:59:59', '2026-07-12 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_158', 'مصطفي رافت', 'student_158@alwaled.proacademy.edu', 'student_158', 'ea75bf5651ee002acde3ac3ac6f8029a:ad6d10f97713704a27a41846898772328a11eafcdbea599d4cc8703bc482473c387febafba9347602e180f048eddd4e2fb6e43dce927a48ff02bb0e7bbf32ac8', 'student', '+201093528531', '+201025710400', 'Secondary', 'First Secondary', 158, 'grp_waled_sun2_wed2_sec1', 'wld_qr_42f14b05e974b9a93781e73914e49fc5', true, '2026-12-31 23:59:59', '2026-11-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_159', 'ياسين عبد السلام شعبان ياسين', 'student_159@alwaled.proacademy.edu', 'student_159', 'ab1c1a6a548e5c2afa6c4b87221e8917:03a5a12dba9c969e0a1fbeb570914cd5200cf6044cd1839e1d937f87562e3388b488d5d495f098e670e2033cf65f3275a5fe603693ee9d04da94b6f73b599eb3', 'student', '+201090637987', NULL, 'Preparatory', 'First Prep', 159, 'grp_waled_mon3_thu3_prep1', 'wld_qr_c8841a18ab7379fd07a580a1c2981f23', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_16', 'خديجة احمد نصار', 'student_16@alwaled.proacademy.edu', 'student_16', '33e5a4e383c4f5fe16b6355ef6618009:fc1057e84de2996be6ec40cf23afb65b620fc138c433987878e5758f5a0a61d8b249ca9116c2acdecf6e79faca1ee288f77aec3936f20e13efb97773887790d7', 'student', '+201550681978', '+201550595490', 'Secondary', 'Second Secondary (Baccalaureate)', 16, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_33cdb292e6c2dc9270a9ca8745d19995', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_160', 'فاروق خليل فاروق', 'student_160@alwaled.proacademy.edu', 'student_160', '73a7d53b6d784ac284cb80d36055f634:3fad6ac67a6c7a14446dcdec62f4fdbf4341748449613588d0aa46e2f7ae9a81ee2c508757848dd127772c5f1ea8601adbeb83f132a7445195f55bb4587342c2', 'student', '+201035476619', '+201028448231', 'Secondary', 'Third Secondary (Baccalaureate)', 160, 'grp_waled_sun12_wed12_sec3', 'wld_qr_cac9dfa3805ce8cb3dc25a1cae0e5507', true, '2026-12-31 23:59:59', '2026-09-02 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_161', 'سيف الدين محمود حمدي', 'student_161@alwaled.proacademy.edu', 'student_161', 'ad8031353ca8bd855dc74ff470ae957c:e5bd21f803ef85f38776e9bd92a04ab2695607b9f0141bde58d3838a6aff0f26ef8661422d8d5e68d2ca04b07fda0602db5d50bc379f2732a43495afe6ba33c4', 'student', NULL, NULL, 'Preparatory', 'Second Prep', 161, 'grp_waled_sat6_tue6_prep2', 'wld_qr_a91dbbfd39108025b250e0668178c04d', true, '2026-12-31 23:59:59', '2026-11-14 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_162', 'ياسين إيهاب منصور', 'student_162@alwaled.proacademy.edu', 'student_162', '580c3a87bc7453869d82086ceb7603ab:9cc5ebdadf38eb501d2dfe1a1b7baaf3e080d7b207e2411af29f621f25d6e7d4aae1a30c3eb8ddbbe9077b1db68144a8d003590d3e3538faf20234a4931a8c59', 'student', '+201004543582', '+201019701754', 'Secondary', 'First Secondary', 162, 'grp_waled_sun2_wed2_sec1', 'wld_qr_f9c671b6fc5a8d5d791d913081c0c992', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_163', 'أسماء و ائل سعد محمد النجار', 'student_163@alwaled.proacademy.edu', 'student_163', '7fdeabb512e4d6c21bfa8f91e32f5b43:cc45b4ca2f3b858f27ae6ef0998b2183a7538b2e33be45f8486a0cba01975cca058cf8277f6537afd518a2901db17ecd33b120802f5c282d05bc97ee64b464d5', 'student', '+201155063125', '+201156914716', 'Secondary', 'Second Secondary', 163, 'grp_waled_sun3_wed3_sec2', 'wld_qr_5628f45a3b3b478177afe42d9ec1699d', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_164', 'جني محمد سعيد', 'student_164@alwaled.proacademy.edu', 'student_164', '05bdd641acac57497f1d2e7eb4dcd156:dbe47f83f89a21dc2eb652799bff088f702dc894e8f9033d7dc7c645c25b7f1f464e7929b72eb985663782a3b9e7663c9a9ca8644e62ec734e9b46b4355c4eeb', 'student', '+201558324570', '+201099531911', 'Secondary', 'Third Secondary (Baccalaureate)', 164, 'grp_waled_sun12_wed12_sec3', 'wld_qr_756783a1caf2e9d615a8f7ae6143751d', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_165', 'ملك محمد المصري', 'student_165@alwaled.proacademy.edu', 'student_165', 'fbbced673d60ee9e8de664ce7057a66a:5fba3f3204b028b7c63923339608cd86e45b4da062d0f4effd7150b229c20db34f78406cc90792219488b123d0bc35fc61bf5b6c77938091ef48ecbaf9ec75f1', 'student', '+201093712030', '+201022322810', 'Secondary', 'Second Secondary (Baccalaureate)', 165, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_c763674e4a3225bcc86765707ffa3bb9', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_166', 'يوسف وليد السيد', 'student_166@alwaled.proacademy.edu', 'student_166', '1e219a567fa901283208c9ecd408d670:80e83042f242cbb9d4d12f7c5b976cec25dd775c780eb6aa3b1fbcff77afda2042d08a50a1e5a8591adf53b88cf597018fbc472bebc6c3a5011bfec7c3176ca6', 'student', '+201200807014', '+201200807014', 'Preparatory', 'Third Prep', 166, 'grp_waled_sat12_tue12_prep3', 'wld_qr_f96451c781ba53b600e1b1e0028aefa1', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_167', 'عبد الرحمن وليد السيد', 'student_167@alwaled.proacademy.edu', 'student_167', '7f31b1ccfff9acb3823a2252a9dd8bee:1f66b9477ae2ddf961c93c09e69783377843190fd9b46b0fbdf591bdee19d32523c10705bef08be707d346fe5bfd262e479fd13c55cfed5273717fa39a453cb5', 'student', '+201200807014', '+201200807014', 'Preparatory', 'Second Prep', 167, 'grp_waled_sat2_tue2_prep2', 'wld_qr_0507d0034e3fc9b70b46f4cfa3a55c2c', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_168', 'اسراء وائل', 'student_168@alwaled.proacademy.edu', 'student_168', '9798577bcfbfb55e18f4069b71e2810f:47a8e292703a956991d867147c86b1cdc9fb350f12ad9014cc2e6be8818fd4ec4db12ff8343b80bca89cbd2ceb4f248f0e4d717b363d50b60200111b10bfd3e6', 'student', '+201044982757', NULL, 'Preparatory', 'First Prep', 168, 'grp_waled_sat5_tue5_prep1', 'wld_qr_f6e9f5f20a46659c0a9fe7d618ad326d', true, '2026-12-31 23:59:59', '2026-10-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_169', 'احمد محمد عز الدين', 'student_169@alwaled.proacademy.edu', 'student_169', '37837093b5b4ce1f8f9747c19c8b0d7f:302f07db56839716843bfc98c37984c549438f2b446d159c78a2f4b9ed30b64877e8f3f3d2b53b03584f77957ab6b46dc1cf814c8fa5f0c7d5f0d4095aefe258', 'student', '+201007928376', '+201029554879', 'Secondary', 'Second Secondary (Baccalaureate)', 169, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_74861a8d5e7f0b2107f51ce7cd61c270', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_17', 'ساجدة احمد نصار', 'student_17@alwaled.proacademy.edu', 'student_17', 'e0ebdc93edee0c4873370d64b252bd67:e1d1d41e72274007cadb05626c1071042ac526e028493dd447dc45c19f2a06eefde999a745dbd29439170f6c8f0215dab1ff43b40e19bbc8a443ec0b044b091c', 'student', '+201550461978', '+201550595490', 'Preparatory', 'First Prep', 17, 'grp_waled_mon3_thu3_prep1', 'wld_qr_bc8884c02f8953a39a5de3b450f19f73', true, '2026-12-31 23:59:59', '2026-10-29 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_170', 'زياد ايمن', 'student_170@alwaled.proacademy.edu', 'student_170', '1dfd57423f8d24843f6cbbfa12720d99:31fabda24fc5e1cdb62e22a189854bf8c6931b84721c7fe955ab18680875d1e7d06f984d8e00414941f1c3a816a65bb18f6207adfd5179402d8280586f51b5b0', 'student', '+201024033828', '+201014674881', 'Preparatory', 'Third Prep', 170, 'grp_waled_sat3_tue3_prep3', 'wld_qr_cd820f3c21fa1b323715a9cc14c39a30', true, '2026-12-31 23:59:59', '2026-10-20 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_171', 'يوسف ناجي', 'student_171@alwaled.proacademy.edu', 'student_171', '6580ac50f7b54585f6eaac5b432612c3:a15f87f629407421ef0208fb7c1f1c9d2404ccde8dffa96eeaf6fab15144b82693917e39317d0806827635bc9dcd30b9f40ac2da152dc2ea3f77feb3e3ab7b2f', 'student', NULL, NULL, 'Secondary', 'First Secondary', 171, 'grp_waled_sun2_wed2_sec1', 'wld_qr_c457d1a7fe07d8d3211b24b34632bb2a', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_172', 'محمود أسامة محمد', 'student_172@alwaled.proacademy.edu', 'student_172', 'd45ad982804298be21f488df691f3182:7b2e225223d259a989c0593be87e199e0a1dbad1479a014f7e8de34e1f74f9a57b5267785f37e8f718739f243a61e9104162d0f11a58e481d2cfa7637985d56a', 'student', '+201004515669', NULL, 'Secondary', 'First Secondary', 172, 'grp_waled_sun2_wed2_sec1', 'wld_qr_a7199174bc17c7e244d179d08abb832f', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_173', 'محمد احمد جمال الليثي', 'student_173@alwaled.proacademy.edu', 'student_173', '6be55416c1881b919bc277141851e9e3:885bda18f65bb2ddc0b7c2abbc7afedbd7419e7f80226947f80a2e89065846e6d36110579453d131d9551383b73e428612d38799d565cd513baf9b7a6dbd940f', 'student', '+201100738566', NULL, 'Preparatory', 'First Prep', 173, 'grp_waled_mon3_thu3_prep1', 'wld_qr_b98aa493cdea613849c9e84eee2b4191', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_174', 'ايه حامد محمد', 'student_174@alwaled.proacademy.edu', 'student_174', 'e367fa1dfe5f600786e3ccf9ea69f487:857b34dc3def8f99760ef862435749797849ffb093bb034b28a7509c8dbad92d19e90f1488a027675264a7a8772b70d0dc84a807bf2bc42462ab3837fe6835db', 'student', '+201221859639', '+201120107175', 'Secondary', 'First Secondary', 174, 'grp_waled_sun2_wed2_sec1', 'wld_qr_29f1535470e6d0ffcc17ceab5a426fb1', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_175', 'احمد ايمن عبد الرحمن', 'student_175@alwaled.proacademy.edu', 'student_175', '40b16605b4f71654e3d16f6ff9f73e5a:a72f806f249f4c25e4e1fa44ddb04a53c5effd43afb208b5801aac6031fa9996aa04f6fd5202467ff1a30e9e67e4d390872c9a9679682b0f78fa08ea23caed51', 'student', '+201093494027', NULL, 'Preparatory', 'First Prep', 175, 'grp_waled_mon3_thu3_prep1', 'wld_qr_6f1b0cce2d0b00029712cc111d97b1fc', true, '2026-12-31 23:59:59', '2026-11-12 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_176', 'طارق احمد توفيق', 'student_176@alwaled.proacademy.edu', 'student_176', 'dd73a4e0b0cb7ab6bd02966581ca24b9:68e8b491d99fe8764624d2ad0b5c6bb2b1115ef6ee4203e3d557d94938d2a8b56fb4b3b8dd221587e6d7ee9ec0ab3949c97afb9f358c856f4aa4696b459f20f3', 'student', '+201050337840', '+201063533970', 'Preparatory', 'First Prep', 176, 'grp_waled_sat5_tue5_prep1', 'wld_qr_11770983830c295abf5b20e48314d1e3', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_177', 'عبد الرحمن محمد اغا', 'student_177@alwaled.proacademy.edu', 'student_177', 'a8e25bbc87b02f2c9de4e280ff9ca636:721f80dc6d18ddd4f2c0e03184c16ef009619b28cdd10b9891d9b115eaaea617b21fc697fb9ab9ba44d210f82b0ef669bafc399d7218727c52012e868d2ef879', 'student', '+201158180076', '+201273466039', 'Secondary', 'First Secondary', 177, 'grp_waled_sun2_wed2_sec1', 'wld_qr_98dd46e9dc1062991a475c98a6b00921', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_178', 'يوسف احمد مهدي', 'student_178@alwaled.proacademy.edu', 'student_178', 'ae16bc1755648c83395b7913d7eb9938:6f0b09d3847989f6be705a1fd2b85ab1f7b1605afa34f34d25ab93508e70154652f3ad6bbda85042418f45e4103faa8dcad11294202c6ac33bb739e2c4bf04b0', 'student', '+201024645490', NULL, 'Preparatory', 'First Prep', 178, 'grp_waled_mon3_thu3_prep1', 'wld_qr_9e73198fa0758c2746a1db0f0f1baffb', true, '2026-12-31 23:59:59', '2026-11-12 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_179', 'محمد طارق عبد الحميد الشوني', 'student_179@alwaled.proacademy.edu', 'student_179', 'c1892744d289c5bef8fa6f1efae29b2a:bb3f30348ff1aafea50af905ea6d4c4dfdb3de3f8299ab50835074fcf53f07f410349d3211531646a2b7d40abd44e155f05c6115ab48d606f14b25c6f14c6d86', 'student', '+201000742166', NULL, 'Preparatory', 'First Prep', 179, 'grp_waled_mon3_thu3_prep1', 'wld_qr_216b8f1526510a4d8c27b6660b1bc076', true, '2026-12-31 23:59:59', '2026-10-19 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_18', 'يوسف احمد شرف', 'student_18@alwaled.proacademy.edu', 'student_18', '61ae12d91b11221201e68f46842887ec:bc51d81b7ad0a1093012ed52b0c9ab7706175e992d4549d7f4f6784f7da0334e48af08b3e7df26db73691e725f77d1f637a6505232df04320ed83f738ab19a33', 'student', '+201503022535', '+201008701447', 'Secondary', 'Third Secondary (Baccalaureate)', 18, 'grp_waled_sun12_wed12_sec3', 'wld_qr_df9f1900ccee75fa57b771deb8a76092', true, '2026-12-31 23:59:59', '2026-08-05 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_180', 'احمد محمد عمرو', 'student_180@alwaled.proacademy.edu', 'student_180', '5513c8774ab9627a670c539800ebbbbd:e15053f11de5b8692c889ef2a1261a410146b0e4a1791476a011c4bb007c900314e5f75722c3b0fb5c149ccf7e4037f4e54882b034d554f2f12bae5d24326a9a', 'student', '+201111301809', '+201090547570', 'Secondary', 'First Secondary', 180, 'grp_waled_sun5_wed5_sec1', 'wld_qr_3919b98d3d7a30f0980393563800efb9', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_181', 'علي محمد علي', 'student_181@alwaled.proacademy.edu', 'student_181', '04a5686b34244d3c96b6c6f2443138ef:061c747efcad031afea1e5810e961f45bbebe310161ab6a86cc51f3a6b3c57a5dbc6b908b85383c3aa25d95b0f9a9480a6a5a5422569fba228b300b1a17664d2', 'student', '+201022754009', NULL, 'Preparatory', 'Third Prep', 181, 'grp_waled_sat3_tue3_prep3', 'wld_qr_1ddb2b0eda8bc6fb6ca0033d94caa650', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_182', 'يوسف محسن صبري', 'student_182@alwaled.proacademy.edu', 'student_182', '202f5e0e9bfd0d89860713ced154ab90:a2536b5d3d23c24290206ee20b7bb11b54885d16a1ad7b7890cd9fea30f153c57ed090bf19a0a2c76bea82443d57f1cd08a94e7595132710c9954f0eda852459', 'student', '+201158487067', '+201007808079', 'Secondary', 'Second Secondary (Baccalaureate)', 182, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_7ef3e5621aff669f68bf0f2d2145bd8d', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_183', 'أسماء محمود القصراوي', 'student_183@alwaled.proacademy.edu', 'student_183', 'e663c529b52863b6311a0c8bec730f52:51e7ff76d551c886ab1c438d7274e0e692cc89bc638631b90c42b797c22c3dab7bc8bd944a6b4d694c8c4b42bee3f34b8b4cf68d249f6df4c1cbd9f0cbedfcad', 'student', '+201061262729', NULL, 'Preparatory', 'First Prep', 183, 'grp_waled_sat5_tue5_prep1', 'wld_qr_b08a67e736fac40f610d3e2fb541dfab', true, '2026-12-31 23:59:59', '2026-10-29 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_184', 'جلال شفيق الشيخ', 'student_184@alwaled.proacademy.edu', 'student_184', 'f73564d3712eb717ee47d25cc7f5e006:c416ba12caf22aad174c7f4b89f68e850e2700fdef986d98925cce3e07c32105c6fcdf5ecc80192ba320249f1101e6490cce0731ffe46d589a91ae281ed5b544', 'student', '+201044380452', '+201014431690', 'Secondary', 'First Secondary', 184, 'grp_waled_sun5_wed5_sec1', 'wld_qr_55fff19322475e4cd33fc75adc01db9b', true, '2026-12-31 23:59:59', '2026-09-09 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_185', 'محمد الحداد', 'student_185@alwaled.proacademy.edu', 'student_185', 'e4747f54e3e6010227dbe0b560dba7eb:d0112f697ad1722f4cd1a8652d1ade83ba61b0457078873aea140a737f5abdcf1d40ecbc3e933f5b3af76d5a23186a18c7789c143d537c24b526741abb9ebcec', 'student', '+201100698941', '+200106802270', 'Secondary', 'First Secondary', 185, 'grp_waled_sun2_wed2_sec1', 'wld_qr_47367ca7d65ba15087b90e2457327bf3', true, '2026-12-31 23:59:59', '2026-10-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_186', 'محمد رمزي', 'student_186@alwaled.proacademy.edu', 'student_186', 'ab754fbedc9abb429320f65352089656:70fd18ceba1544c8d8c15dcd61ab4ece25d52b51834f73a382f0935ccc4e6d1ba3507c30442b3cf49d8c0cb7d6c953688bc8cc83d7b5d5b679ad230879d81d1d', 'student', '+201040143386', NULL, 'Preparatory', 'Third Prep', 186, 'grp_waled_sat3_tue3_prep3', 'wld_qr_9fd6c1fc1d422558125c04485d37f100', true, '2026-12-31 23:59:59', '2026-10-24 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_187', 'محمد إبراهيم احمد', 'student_187@alwaled.proacademy.edu', 'student_187', 'd2295df55b35fd87ae12fccd5de4848b:6cd3985ed7f08ac3ceb4e4578504f1a3e551cf1734b1523fe94a963e91e357d5edbe7330f957a2e1bcd8500f8d9ee4cd18310d8e47eff5a70fe58249d9b06aec', 'student', NULL, NULL, 'Preparatory', 'Third Prep', 187, 'grp_waled_sat3_tue3_prep3', 'wld_qr_a95a2303ebde8ec9665011637c1481cf', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_188', 'مازن علاء حماد', 'student_188@alwaled.proacademy.edu', 'student_188', 'eeab252bdeec32f56bdd8447709df178:a8d5348dc75d8264d1212c2db5961414b5127aab6923ec1b60f0720f3a0bac15651752cf1a0824edfd661d501f2484f7294670a380681fbad90bfb688e5fe01c', 'student', '+201068936693', NULL, 'Preparatory', 'Second Prep', 188, 'grp_waled_sat2_tue2_prep2', 'wld_qr_d99292b693be6f3f0df834be15fc975f', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_189', 'محمد حسن مختار', 'student_189@alwaled.proacademy.edu', 'student_189', '7c93cf765bddd573d805184c6684e3b1:cda5731cabf00b57a817d425f42cbf19a6d8fc3faec849cc1fa2fb6e17e839ce5c2f52d8bcc18030a2ac3306b71cc10d28569579f48c8a76946c2d5485b77908', 'student', '+201068080689', NULL, 'Secondary', 'Third Secondary (Baccalaureate)', 189, 'grp_waled_sun12_wed12_sec3', 'wld_qr_fa66c69e0efa4d74aac7d2c7317abea4', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_19', 'محمود محمد محمد السيد', 'student_19@alwaled.proacademy.edu', 'student_19', '4eb080d8567a2f5c291c1fa8f7a7757e:87c68b90ecbf91c59eecb16e069ff5f0329bc022dc318a54efab5a3bd3c4e794da7d6352a62d0353868d5d0d1dd4617edc06f31dac93e08d52c8769827f020e4', 'student', '+201280133368', '+201211628778', 'Secondary', 'First Secondary', 19, 'grp_waled_sun2_wed2_sec1', 'wld_qr_44c0c43435643747569a6dc509ad9edb', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_190', 'يوسف حسن مختار', 'student_190@alwaled.proacademy.edu', 'student_190', 'be2def3322015ac61a73ea7313a9be4c:e3b4edb0a1b4a3cb5ba07778d9dcf2a3ea3b58d6aa19883130e7b6f2aa9d27c1a531fc166adcb26f892851416789a93fec96800f0a982c18628491590215e349', 'student', '+201068080689', NULL, 'Preparatory', 'First Prep', 190, 'grp_waled_mon3_thu3_prep1', 'wld_qr_f27d8c51b8d76b8ab54025baf2401207', true, '2026-12-31 23:59:59', '2026-09-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_191', 'عبد الله محمد رمضان عيسي', 'student_191@alwaled.proacademy.edu', 'student_191', '6b3ff92b0de696957ef5435d944c0c97:b62ccb7df0a770e5c9c49c95e470604b4e36a9371b802919da2f8ced8f04386f9cbf163fd9ce78153f01efd7d2bcc612236cdec5170427ca52f97fb7baf7a61a', 'student', '+201221757202', '+201552738745', 'Preparatory', 'Second Prep', 191, 'grp_waled_sat2_tue2_prep2', 'wld_qr_50365e4e1e83bc9e4f8742c520cbff20', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_192', 'يحي احمد فتحي', 'student_192@alwaled.proacademy.edu', 'student_192', 'afdd079119331700711291b603c9fed1:a852e00f4627c5d555c8002352c570e07ed7dec4079938de651447cc1864e62d2f02e14f099632f8d08f44174b33051402cb08dcb8ba97a81d0fe814eae5a536', 'student', '+201093729345', NULL, 'Preparatory', 'First Prep', 192, 'grp_waled_mon3_thu3_prep1', 'wld_qr_0f7353116e684ffd98c2682e9a3960d2', true, '2026-12-31 23:59:59', '2026-11-10 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_193', 'محمد مصطفي العيص', 'student_193@alwaled.proacademy.edu', 'student_193', 'd5ba07000823dc07400627f4f1039a28:8e3e15072be69d8104a05c94e5bb552ac9390dee00f3e17e2bc58217949f82375a31d157d76a2fe07116a79730f0da35ea3dda69504273eb96e4c18a4cb3162b', 'student', NULL, NULL, 'Preparatory', 'Third Prep', 193, 'grp_waled_sat3_tue3_prep3', 'wld_qr_79d9795329c11f34c337ad5d43a5b648', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_194', 'نور محمود', 'student_194@alwaled.proacademy.edu', 'student_194', '84ef2311ac2292b69c8dd7cea3d427f7:74ff31aa43efd150f43b360d86cea8f696b822158b3692a58bc0481276f1a8f4254c9a9cf2089d8c1139b1fbae483100773d90de0eb4a062fc841de2a364f6b6', 'student', NULL, NULL, 'Secondary', 'Third Secondary (Baccalaureate)', 194, 'grp_waled_sun12_wed12_sec3', 'wld_qr_ad543d8ac6a4622ec56b31980e26c5e8', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_195', 'محمد محمود حسين مهران', 'student_195@alwaled.proacademy.edu', 'student_195', '8b5ecb18c93f29585b08f465726e233b:3e894ee4ac6b8dcd74c30ea388f56e367cc44d5b416542b65fcc9005a0218b05b56865f739323dee3d7c45f4bcc19f3f98a312fc317d26fac5c21c03695bcd0a', 'student', '+201120573295', '+201094800657', 'Preparatory', 'First Prep', 195, 'grp_waled_sat5_tue5_prep1', 'wld_qr_239d13ea96a237103d0bd618f26d7f31', true, '2026-12-31 23:59:59', '2026-10-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_196', 'حازم سعيد', 'student_196@alwaled.proacademy.edu', 'student_196', 'cef72a4986a640592e3d782ce58f6426:bd948fec78cc89d89c0978646f3832379521f0986e12dc4ecaab1795f854a58c698c0757cf4eb5ee0a9aab11f782e6587bf2ad74e19b026010d1a0b78946aa07', 'student', '+201062643398', NULL, 'Preparatory', 'Third Prep', 196, 'grp_waled_sat3_tue3_prep3', 'wld_qr_58c98774231dd7488aa9bc2b602a2568', true, '2026-12-31 23:59:59', '2026-10-25 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_197', 'روميساء محمد سعيد', 'student_197@alwaled.proacademy.edu', 'student_197', 'f7f17c7b18f95367bf0040e145435f6b:fb2d528d62be21e4526fbddcaf349d5ccdd15ba467c15b7e240269d1b7619f3b4967464038e8a941a7ced4045fcf8968996c4dc7df42096742410056b74ae71a', 'student', '+201044902375', '+201060427355', 'Secondary', 'First Secondary', 197, 'grp_waled_sun2_wed2_sec1', 'wld_qr_82d112bf4de4c3a9c13dc675f67ce178', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_198', 'انس محمد سعيد', 'student_198@alwaled.proacademy.edu', 'student_198', 'af07e556ad938c4cca589405e5b55be3:571700a7acc5905034e10ab6dc9e879bd9e47abad4e537b01f46992a54ce5bd0d7f2a2ddce16025b79b40923f131b1b4c8f1da2198ee87a34f00717acca2124d', 'student', '+201092815581', '+201060427355', 'Preparatory', 'Third Prep', 198, 'grp_waled_sat3_tue3_prep3', 'wld_qr_dafd84eab5ee8bfb863d477e683e8551', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_199', 'احمد شحاته زعير', 'student_199@alwaled.proacademy.edu', 'student_199', '6578c76eeb6e7b77e31352038e91a7fa:6b2ac2e28e5f271f45433a2f5c1dbdbdeeada32d3401177043c80aa228def32d4b4b40ede42bfb197a95604f370d27d00528adbee0bf75531d9841c38ab7d9b0', 'student', '+201274740424', NULL, 'Preparatory', 'Third Prep', 199, 'grp_waled_sat3_tue3_prep3', 'wld_qr_09a46fd8927736f7a834a9ca9873dba5', true, '2026-12-31 23:59:59', '2026-10-17 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_2', 'سعيد رضوان بيومي', 'student_2@alwaled.proacademy.edu', 'student_2', 'd5b787bfd5090c102cfc3d02ed8a785c:d8472ff9d606948d546447ae49234642638e960f5bb75c38ec428e6d316ce6b30cc47f00b9b628bca22ba7e8be5d1233645d67deb1aa29fbf784fbf9306a35bf', 'student', '+201014545551', '+201014545551', 'Preparatory', 'Third Prep', 2, 'grp_waled_sat12_tue12_prep3', 'wld_qr_db9ed54ff60627ac9578e775beac470d', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_20', 'عبير احمد فؤاد', 'student_20@alwaled.proacademy.edu', 'student_20', 'e64345919fb1015c5afef4bac95f1a3b:a41a9896bd561b8083ec7846058169f86f574e9f95a3eaccdb2b34855d1b1f34dcd715bea1b860816b7b351e5138240189f8cd43f38f6cf6f98375711b9442b5', 'student', '+201030374688', '+201008825689', 'Secondary', 'Second Secondary (Baccalaureate)', 20, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_5c62b9fa83046c93b1854eae3cfa3e67', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_200', 'عمر فادي الخولي', 'student_200@alwaled.proacademy.edu', 'student_200', 'e7ce2c3b5c34daa1b50f53a20b179230:8f1c79620c28a763c984ed6a1980ddf8277e42fa54b68a1d514e3ac98ab311ccb0d0e9ac38965cfb8d1e3a2b17ce1c9fd4b63af09d01fc75a2eadeb5fe61ef84', 'student', '+201018727262', '+201098356245', 'Secondary', 'First Secondary', 200, 'grp_waled_sun2_wed2_sec1', 'wld_qr_364521349adba6b3ef29228abe0bff4e', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_201', 'محمد السيد كمال', 'student_201@alwaled.proacademy.edu', 'student_201', '1a3ba086c31900071f9c24b3caa9bfa8:35d12207b3f39ec93645a1bdbc33c04e8c352c6e46a46cadb33ae999f1f413e20edfdb92f48464aea32c6a427d5dc1551e2ccb9ac389c37a6d117d5445ce75a6', 'student', '+201285880725', '+201063880624', 'Secondary', 'Third Secondary (Baccalaureate)', 201, 'grp_waled_sun12_wed12_sec3', 'wld_qr_af76d00f624e9de288a48d640ddd1817', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_202', 'مصطفي سامي صالح حماد', 'student_202@alwaled.proacademy.edu', 'student_202', '89a9ff4ee2ed71edbb16e4e5865694de:3b48e14406991167976505f4c7f38b296a200b0bae389dc818f28412bafcc83a8d950891fb739f64146e942d849127eb39ed0780e4460fda0c85b39ebb6ff2ba', 'student', '+201273681286', '+201505541716', 'Preparatory', 'Second Prep', 202, 'grp_waled_sat2_tue2_prep2', 'wld_qr_5bfaff301fcfae0a0b8ae456531780bc', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_203', 'فاطمة سامح', 'student_203@alwaled.proacademy.edu', 'student_203', '4abe85458f683cdd99c1d09f3955e1aa:d99a7532f3c22f6edd6656b249776642dc34585f1fb1eb6ccd13b8e511932ab0e2c68d5669483c0152d70255f00a831937b12e1ad9e2bfe43c5d0a866cfa1486', 'student', '+201091392866', NULL, 'Secondary', 'First Secondary', 203, 'grp_waled_sun2_wed2_sec1', 'wld_qr_60226c60d282caa8684154208687f780', true, '2026-12-31 23:59:59', '2026-10-18 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_204', 'رحمة السايس', 'student_204@alwaled.proacademy.edu', 'student_204', 'f3d0f1bf3a5c427f8d531d346c0c6013:13c0318209cdef974b86a8d5d1f37fe1e709a2f89cffff816809e60d597f1c1eebf1242c72978e913a36ac0aab97317a8d1a7789ba620ea2a679d47481df20ba', 'student', '+201025526810', NULL, 'Secondary', 'First Secondary', 204, 'grp_waled_sun5_wed5_sec1', 'wld_qr_8e7fe70503aa9016681f709a479b9b93', true, '2026-12-31 23:59:59', '2026-10-18 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_205', 'رؤي محمد عبد الله', 'student_205@alwaled.proacademy.edu', 'student_205', '4d76c7482321d5d6a3512b0b81aee714:e3c3542eada3cd9ef187bf3b31483b789c35b4119862903f339ddd11e2e24711c6ae29f4b65b6abee90e792006d80b2b077879b540730667a9587c45a162cde4', 'student', '+201502233631', '+201093122631', 'Preparatory', 'First Prep', 205, 'grp_waled_mon3_thu3_prep1', 'wld_qr_4a1a2a8011ac6e8ff854990ea9901c5d', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_206', 'روان محمد عبد الله', 'student_206@alwaled.proacademy.edu', 'student_206', '276be4741980d7b2fd1b81fa2aadcfcd:238c1329435f1b8d1a5c2a3488cab6e6a2ef1e6d54b93f26b7bf21a8ccb7f7c07c29c1637029c2d327fbe2d0e289530b6903624a7e4980dcf973a0fa499bfb21', 'student', '+201552002631', '+201093122631', 'Secondary', 'Second Secondary (Baccalaureate)', 206, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_702c12f767d2ebf35cd5c0bded91f7d3', true, '2026-12-31 23:59:59', '2026-10-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_207', 'أسماء علي شرويد', 'student_207@alwaled.proacademy.edu', 'student_207', '45d156d3a95c15e0a0b59781f35e117b:e7775ad992002c811f7fde931f2d6f7e9ba04a343e494da37ac3207877b7cdfba4414ffe8fb68c7a246163249e9087717df558164d533c7a235962fa436f5595', 'student', '+201271166390', '+201278956782', 'Secondary', 'Second Secondary', 207, 'grp_waled_sun3_wed3_sec2', 'wld_qr_cd8ef0e0b874e1287ed81c64ba60a371', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_208', 'ياسين احمد محمد', 'student_208@alwaled.proacademy.edu', 'student_208', '84a68d8a62a88acc47ff061192721a70:95ec3c6e59b0962db101f218321fb59c06f34093d888e38fd028252657048776f370a430c1f4926546bbd3f9c776b31ebb1f0e3bd733da47d811fd0f215fa491', 'student', '+201222682906', NULL, 'Preparatory', 'First Prep', 208, 'grp_waled_mon3_thu3_prep1', 'wld_qr_109f02340c22a53e5b5856969cc875c9', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_209', 'فاطمة محمد محمود إبراهيم', 'student_209@alwaled.proacademy.edu', 'student_209', '467dc849686c0013a670ae02b0660b60:ee7aa0bfa4964bb5451ec39d983563d0d1be5cf8b8aa3962485c52f064588d95dd16c2bcc8fe0950555b50f52987c73be64aede0afaf698a0ae3b8394a2e7d49', 'student', NULL, NULL, 'Secondary', 'Third Secondary (Baccalaureate)', 209, 'grp_waled_sun12_wed12_sec3', 'wld_qr_a31294ec1b74293394aa66bbf2a7c517', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_21', 'عبد الرحمن احمد فؤاد', 'student_21@alwaled.proacademy.edu', 'student_21', 'b3688f5ccdd57930b45425aa127a63b4:aaf97a9f0e7231bb5e755af9323a69dde95af98fb3b261c73de2a05299407ef258af61d56f7a16f0c0d551f201e90780c330e46c31d9e7cd448ad1148fbeec26', 'student', '+201005582768', '+201008825689', 'Preparatory', 'First Prep', 21, 'grp_waled_sat5_tue5_prep1', 'wld_qr_27a3d4fe4aac35b232ce3319a3f6a95f', true, '2026-12-31 23:59:59', '2026-11-12 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_210', 'روان محمد القيعي', 'student_210@alwaled.proacademy.edu', 'student_210', 'b7da6814d2f4efe9269ba5cdf94a43f8:a70e28292ff068ab803f03afc0a476797b8b437f22ceb795fcdb58b06e9832297e1c9c53977d37a7f5e8f430805312caa3a38a7c9ed9be1c86ad06bbbedccfc8', 'student', NULL, NULL, 'Preparatory', 'First Prep', 210, 'grp_waled_mon3_thu3_prep1', 'wld_qr_8651cf615a7d747898676f2ae18d96c0', true, '2026-12-31 23:59:59', '2026-09-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_211', 'نور رامي حسين', 'student_211@alwaled.proacademy.edu', 'student_211', 'bdd2426cef82518661ba1b542e184928:7eff8bcd3409a6e3b924bbdcdf8aab0e2a459e332b2836c92fd8506a43ca46bdcd1735de03b290e9cb9fe5632bee1524246e1d1af61259d2a5f12b8725596d6f', 'student', '+201062070305', '+201061922757', 'Secondary', 'Second Secondary (Baccalaureate)', 211, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_fd6c7459cc78033839c4fae06c76970a', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_212', 'عمر فؤاد محمد', 'student_212@alwaled.proacademy.edu', 'student_212', '53e1d07cc5e108008be84c2da1edfd2b:70f914395b17723c3f37b721c3828fe3fa57b491c3077139cc89cb9d46e25cd396f9802fd76d1dc60c399f9ef21e393a3b24a5943f0f8ad26a7a43abe2b04cb5', 'student', '+201010568566', NULL, 'Secondary', 'Third Secondary (Baccalaureate)', 212, 'grp_waled_sun6_wed6_sec3', 'wld_qr_97741091d0a55cffefe15d12b0c6c77c', true, '2026-12-31 23:59:59', '2026-10-25 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_213', 'ادم محمد', 'student_213@alwaled.proacademy.edu', 'student_213', 'e8ac2a4ca1cda78e81382b5c7c8734ea:7bc1e78a46fe5635ee41eab20e5ba2900731cdba1fbb253126dcda3d891e1d96e4db54b7827545327281761071d281e506a885fc0919ae248314de8e28655e36', 'student', '+201017847862', '+201515933853', 'Secondary', 'Second Secondary (Baccalaureate)', 213, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_cebee25abe15f737e865b7bbb22f9546', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_214', 'انس محمد يونس', 'student_214@alwaled.proacademy.edu', 'student_214', '1f8a23e48e55cab341470eb5331fc3ea:f330c38c4b5767d7e6335a10203a0ac06775aa27474aeb9e4c9bbe599d1681edccd8230d51c76b0e341053906175e4f70c728f2150a16a79cfe695d38f219778', 'student', '+201507516976', '+201010070166', 'Preparatory', 'Second Prep', 214, 'grp_waled_sat2_tue2_prep2', 'wld_qr_6dd8c897eaf8aaa1b2a7b3f0831bc50e', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_215', 'جنا محمد البدري', 'student_215@alwaled.proacademy.edu', 'student_215', '624c8c9e1324923bb478e490fac7634b:f5fbd3a74c52db631664cc99628acca69d7f470dae4c5e6812ccd5a157be96d281992a220c569bc65a58091ed413355de10f69f4822acd8b9c8dfd9d2adb853b', 'student', '+201001814733', NULL, 'Secondary', 'First Secondary', 215, 'grp_waled_sun2_wed2_sec1', 'wld_qr_300b6656a930e0dcb540cde1b6aca7cd', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_216', 'امينة محمود عبد العزيز', 'student_216@alwaled.proacademy.edu', 'student_216', 'ae59c36cbf97b1a6530e0a711d6309a0:2a44aade1b7bb40ccd1faf3022ac2fb7b76c789e81ccfd089ae54c00bf26332d49e64d2fba17beb6c7c532e1e66fee2a20c4ef228f66498a480994f4d2bd79f1', 'student', '+201009781205', NULL, 'Secondary', 'First Secondary', 216, 'grp_waled_sun2_wed2_sec1', 'wld_qr_19500b4862ab9c1eedb73e8f58e9d66a', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_217', 'بيري محمد', 'student_217@alwaled.proacademy.edu', 'student_217', '0625b8b2a3c8f64feb4cb005da172137:cb2bdcd530b3dbd5c0986692d775218bc1430c05b2e8e446f81f93cbef3cf146ca213515f8ff98b4fd7ef9b876490c5851e24e02458cbd174f40e1ccd26e9a46', 'student', '+201228366804', NULL, 'Preparatory', 'Second Prep', 217, 'grp_waled_sat6_tue6_prep2', 'wld_qr_af9810af50c2faa9fc038bb17008387d', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_218', 'حبيبة محمد إبراهيم', 'student_218@alwaled.proacademy.edu', 'student_218', '6d8dcc6bc73f82a81264819aa3962999:968872cd9b105773cc7a40f79f9aeca46613e14811cf94ac3be1d40bf183d9fb559d5f72b0e935c3e7895349f06353bc481ca4a3361b71fd34a50996048d5a31', 'student', '+201025504887', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 218, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_a1bba2ee8883cd2b81255309ffc65e89', true, '2026-12-31 23:59:59', '2026-10-06 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_219', 'ادم عمرو', 'student_219@alwaled.proacademy.edu', 'student_219', '786be9ac35a87a4bd193f57cea809d4d:f3bbf517803b4610d5f8ef42f4fa4e5f8023b512ad3ea9382680be4444d42d82cdb156adc1fecf6271dba3d83318b5a1eabcc7ef6cc353230f4a61e7a159ed6a', 'student', '+201505914748', '+201069469658', 'Preparatory', 'Second Prep', 219, 'grp_waled_sat2_tue2_prep2', 'wld_qr_c8706572fd1f35e6fb46dd5ec3035f5d', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_22', 'حبيبة عبد القوي', 'student_22@alwaled.proacademy.edu', 'student_22', 'a50b3f780455c7288591cbe72da9a3c6:1687c2e3fe55eedbd996016b517eeb4bbba121a0c1cd15c1ec22f1e3810660a1e952021b56c1432646177632be9eba751607dc9ee22a167c912b8d4e435dffb5', 'student', '+201025504887', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 22, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_4045b8e3babfea8276f9a7f749bee791', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_220', 'ناهد ياسر', 'student_220@alwaled.proacademy.edu', 'student_220', '24429d01ebd6e7bf23fba47695241cc7:7e006e60541aa0bc4c711524eb6cbbd92fd4a0bfc7448f82ddd199d0dcd7d14e221c86df255778179aa0c3b6535225a5d58fd416eb5b2d2467c8cca7e03ae2ea', 'student', '+201022941569', '+201008512100', 'Secondary', 'Third Secondary (Baccalaureate)', 220, 'grp_waled_sun6_wed6_sec3', 'wld_qr_852ef380532c5bd9a32bcd13abe20758', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_221', 'مالك حسن بدران', 'student_221@alwaled.proacademy.edu', 'student_221', '57a65fa619c5ffcadeea59cdcb36aecf:494568ca68e58c5da401a08a855fb23e9e579a119c25b37aedac98812819ffc695b64546fb086346ad0cf523932a6b1f008e26b1a3797343c247ce6783466c80', 'student', '+201014208577', NULL, 'Preparatory', 'First Prep', 221, 'grp_waled_sat5_tue5_prep1', 'wld_qr_b961fddffd33f243c285dc657e2141fa', true, '2026-12-31 23:59:59', '2026-11-02 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_222', 'ملك حسن بدران', 'student_222@alwaled.proacademy.edu', 'student_222', '4fd68ff302d5386064c3b66935e20687:33ad8fbf7da9274f464d60a5680dddacd5807a285bbf6ad52f9d2eb946112a82d163941bcca5b9915fb1eaad9cd406110a44b7dc150e912cd8d27651af839915', 'student', '+201288050168', NULL, 'Secondary', 'First Secondary', 222, 'grp_waled_sun5_wed5_sec1', 'wld_qr_f4848c361f226e46844e7c39e52996a6', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_223', 'عمار ياسر', 'student_223@alwaled.proacademy.edu', 'student_223', 'c79d7e005474f80ae4ca43337abad293:aa4e802a69e3bd8104b29477b69f3b806fb0f86e32fcc26a1954908ad2a172f997d440be66e1c558eadc5bd466d1c4cb62c096f48bfae83af4d13c02d58c6135', 'student', '+201093700349', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 223, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_1eaaef0bb184918d46b9a3b405955f9d', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_224', 'ملك احمد مغاوري', 'student_224@alwaled.proacademy.edu', 'student_224', '581092db44917928eeb3ae2bc13eaebf:05fbb0b117ea70c990d5d6b6b7ba837804b03269f25f6b867264410e206ebe5407d98d4f51431e503a52c8b3acf1b4350610c7237aff413b793963e3091ca15a', 'student', '+201226280746', '+201094407076', 'Secondary', 'Second Secondary (Baccalaureate)', 224, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_f7b77638ab79c7f0b6dbd46b48f12a17', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_225', 'عمر إبراهيم انصاري', 'student_225@alwaled.proacademy.edu', 'student_225', '112991049958cd5589864fd989e8865c:d4ef90fd0e3e4e22959fd0a650779cafd3a1421aa41c725816435a9eab59aad49fd29b3114ef8f394a6fc0c74a379009093ecf73b7e7d7852b6b8f4ab5e565e3', 'student', '+201031256906', '+201067974057', 'Preparatory', 'Third Prep', 225, 'grp_waled_sat3_tue3_prep3', 'wld_qr_b9c0a74915ac076836996a3ee544139a', true, '2026-12-31 23:59:59', '2026-10-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_226', 'ياسمين محمد العشري', 'student_226@alwaled.proacademy.edu', 'student_226', 'ecb8d7c2cb59866dec2102deed70d197:7b41585ef3d11b648fc20f14d5fd07afa525c3a1546c6f4d7b81f9dfa826ec57a802d48f44de954779e3ed53455eda5c6beda9ac083da438f724b70d58dd4db4', 'student', '+201023688706', '+201023688706', 'Secondary', 'First Secondary', 226, 'grp_waled_sun2_wed2_sec1', 'wld_qr_239947193d916d811670b2b720452d0e', true, '2026-12-31 23:59:59', '2026-11-15 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_227', 'محمد إبراهيم محمد', 'student_227@alwaled.proacademy.edu', 'student_227', '7fc9ddeaebbdb0e097ceb2bf560655df:2482795561d8072f5db822a87b32a135f425941bc7c785b4361903bd1539ff2fc7e227d2cce008201e8694cbe62061118a0ffcff30e635bb1bbf0af10931b591', 'student', '+201032863199', '+201279822904', 'Secondary', 'First Secondary', 227, 'grp_waled_sun5_wed5_sec1', 'wld_qr_7ea52cb28898320df8d5c58669542e65', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_228', 'الاء فتحي عبد النبي', 'student_228@alwaled.proacademy.edu', 'student_228', '39c8ec68d3e11b02fe89f73339a3e8cb:1f1c46f08d43de9a30992c3d436f927472ae9b3abca87b4d07a96a94b8b8371aafe944b213a3f55afa8309dbca785d0b02fd48115b894d4b3b8cb6477ddbe766', 'student', '+201270734023', '+201272494881', 'Secondary', 'Second Secondary (Baccalaureate)', 228, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_a339142b0d6511e584280b7676d31eba', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_229', 'عمر اشرف سليمان', 'student_229@alwaled.proacademy.edu', 'student_229', 'ec514ae904c508de73a85401ca60a1ad:ec8529ecc94f8043a41fa0f08efb3a8c8e67e22a2839d2d53d1304faaf6148e95ae1265a7837a7e8296a4282471484659e2dbe1b2700d7ecb392c407648d358c', 'student', '+201227166375', '+201010212360', 'Preparatory', 'Third Prep', 229, 'grp_waled_sat3_tue3_prep3', 'wld_qr_7af69ea805f40534ddc7c032adc8a880', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_23', 'مونيكا عازر ايميل', 'student_23@alwaled.proacademy.edu', 'student_23', '18086077910090d8583b3b2266b65a50:f677b7e6ca01dc67d84ccf91dd8b781d81bc43a02f9da82ebae6e891e469d6bcb8a924174bbd9abbb7544d22bf96e64c58e9e9ca996fbef5f5a305eef72c574c', 'student', '+201203561438', '+201233364674', 'Preparatory', 'First Prep', 23, 'grp_waled_mon3_thu3_prep1', 'wld_qr_9db4464dff319b851456e25c0937a705', true, '2026-12-31 23:59:59', '2026-10-20 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_230', 'ريماس عطية', 'student_230@alwaled.proacademy.edu', 'student_230', 'fd3c278c73756f350e046224e766b19c:207fbddcd6928a7efa133d74e80c7f858427fb1a229d7a15f29173c2a9e6cf60b2f117ed6185de8c3ec9491018e2d14d8a563109a44ba92c826340cf26c2ec0b', 'student', NULL, NULL, 'Secondary', 'First Secondary', 230, 'grp_waled_sun5_wed5_sec1', 'wld_qr_e63187297d7ec994d1191cc573d1f92e', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_231', 'اسلام ايمن حمد حماد', 'student_231@alwaled.proacademy.edu', 'student_231', 'fd76fa8719a587e2cf08d49c5e223eb2:f34a8b4097179217debaab97d6867de11cc8d9ebf0a0002cf9396e03d88ad89e3c03409da7df5f446c83e07b5d569352ce5b9b4e48884a0acd85624fe591c014', 'student', '+201017677640', '+201112202946', 'Secondary', 'First Secondary', 231, 'grp_waled_sun2_wed2_sec1', 'wld_qr_91fac999416216cf2dccabc1182a520d', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_232', 'محمد شوقي', 'student_232@alwaled.proacademy.edu', 'student_232', '23df28e638b70fa26a0f071e45db3c72:64897332563b75b50e90001beb7569a211ddb278a33f24fd4ccc1332c75bbc2ec221903c3d9d2443699127725752a78b7c32d2b68bfa632da2853d161adee3ef', 'student', '+201094798573', NULL, 'Secondary', 'First Secondary', 232, 'grp_waled_sun2_wed2_sec1', 'wld_qr_370c2e81c9af6332278e5ee0ddc5502d', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_233', 'محمد وائل سعد', 'student_233@alwaled.proacademy.edu', 'student_233', 'a3726642f445c25a57cc3d39da69bf7e:738991f5ae27e44d783d76c19a491f34e954255ba04e1ae751b345d0e33364611c8050b537c838ec8210dd5f5a7e0759dda9d99f212dab76812f529cf0c89fdb', 'student', '+201156914716', NULL, 'Preparatory', 'Third Prep', 233, 'grp_waled_sat3_tue3_prep3', 'wld_qr_2eb3ead099aaaeb3442212ac596b2b75', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_234', 'فريدة محمد', 'student_234@alwaled.proacademy.edu', 'student_234', '555cb42bb38a5562d9e2bae50816cf5e:45e7cfda2085085e6582a1c34903f125a1c8206cf321eda7688e436509d908f7348c13d435b7514ba71d0194bf5422d5f6d711070c8bca18b0b5832ef0eab841', 'student', '+201097392425', NULL, 'Preparatory', 'Third Prep', 234, 'grp_waled_sat3_tue3_prep3', 'wld_qr_31189099c077ff57e74918f923044f39', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_235', 'نور علاء محمد', 'student_235@alwaled.proacademy.edu', 'student_235', '585af33bce2e001339eb57a869ca09a7:2895b77a3fff4a259396b39b06b193009a7b9a99ecafe9b4096fb8623c47679009f2df5f253b71d1c7268c095239543b472fe0e667e88e59d31400221d64dfa9', 'student', '+201013894469', NULL, 'Preparatory', 'Third Prep', 235, 'grp_waled_sat3_tue3_prep3', 'wld_qr_d74738460dd9fe93f59a0e5acfd49a7d', true, '2026-12-31 23:59:59', '2026-09-26 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_236', 'علي حسن بركات', 'student_236@alwaled.proacademy.edu', 'student_236', '1ea1a7f50f3198b1a6190b049a272d85:2c1784758bc12bdc3bb9551a3ccadebe2f13fb27b4b5d813521a9b771693ab06bc7700694eaa5348f0214cbb3601021409a545dc4af38667cd126c9aa503e52e', 'student', '+201030481052', '+201015831681', 'Preparatory', 'First Prep', 236, 'grp_waled_sat5_tue5_prep1', 'wld_qr_4f5e33f2604c1d198d2e8417bf10809c', true, '2026-12-31 23:59:59', '2026-11-12 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_237', 'زياد شريف محفوظ', 'student_237@alwaled.proacademy.edu', 'student_237', '5e17f75c1da3c538940da701c8cea79d:1d9a256ddabd8ac317dcb03d8bdbe49367ea479d0086d888d4c8f09b31b67ad7a4fef336450188da080ad8097506b808e786330174176af3fd594412b4df2988', 'student', '+201014906229', '+201033882450', 'Secondary', 'First Secondary', 237, 'grp_waled_sun2_wed2_sec1', 'wld_qr_a9e605ff081549417ffd6ae21174bb86', true, '2026-12-31 23:59:59', '2026-09-02 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_238', 'هدي حمد محمود', 'student_238@alwaled.proacademy.edu', 'student_238', 'bfd301a8647f7a66d096ef04f21a3c8e:a03a94951645730160dff9a2499b228cf50d74a932ba8ef26db95dca47895d97234e028cdc4aca2dc05d636ca494dad8dc42ddf5d89d56f3566da4f6c9e12f24', 'student', '+201205552069', '+201018407797', 'Secondary', 'Third Secondary (Baccalaureate)', 238, 'grp_waled_sun12_wed12_sec3', 'wld_qr_8b5bf24ed1687db4f27d2449aca9fee5', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_239', 'ماهر اشرف ماهر', 'student_239@alwaled.proacademy.edu', 'student_239', '82582b45ca630a71a19326af037d1651:46d489bd4664d4014a1b014e0a28a9e1494e7c6648704d5fa813a04dae71b2dda6c3695638d76489132208cd4bc6dcb6d91c5f8460d237455df60d9fae3f3472', 'student', '+201006138963', NULL, 'Preparatory', 'Second Prep', 239, 'grp_waled_sat6_tue6_prep2', 'wld_qr_de62e050cf3f1ec9644568fc418393b7', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_24', 'يوسف فرج', 'student_24@alwaled.proacademy.edu', 'student_24', 'bfc7d0c7640be8a5a1df8e7dee89bc8e:99affef110d16b9cd9527aec691cac3408ea26a347add4621c68650bb2368bfed5d5352990815ced901ca611be838c0b075d7cc679a3fbbd52f0aa81db6fa933', 'student', '+201212076984', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 24, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_ad09455ed96ae99941a2b018fe4c003b', true, '2026-12-31 23:59:59', '2026-09-13 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_240', 'محمد عطية عاطف داوود', 'student_240@alwaled.proacademy.edu', 'student_240', 'f385acbcffd4863932df0eedd93806c3:55a2b7449be954d24206cc0b6d1c1406cd0fe8d3336e36da15d7162dbb1b6781bd9cc0c15545a4ea02ebbf154d8cc51e71d116e1048d4c87b9d54b6803604335', 'student', '+201033874533', NULL, 'Secondary', 'First Secondary', 240, 'grp_waled_sun5_wed5_sec1', 'wld_qr_b3ba19fa600c7a011dfb57ef57353120', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_241', 'محمد إبراهيم حسن السيد', 'student_241@alwaled.proacademy.edu', 'student_241', '6d64151a926a09a6f7fd2933f8efcaae:27db16eafb94aef2c2f2f8151bf5b900989acdb403c96db42811c8368461b1b9768821c19bbdbc3387e18af45eb3e81d2d3d293b35612c2641fed37817f7abe3', 'student', '+201098410103', NULL, 'Preparatory', 'Second Prep', 241, 'grp_waled_sat6_tue6_prep2', 'wld_qr_aca2306a3f87fe39884b23a26e960714', true, '2026-12-31 23:59:59', '2026-10-20 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_242', 'ملك علي الجمال', 'student_242@alwaled.proacademy.edu', 'student_242', '8db81f47aa95cbc3510e0bfda493b4ef:81debc39750522839c844cd76398c13178d7cf144db43e37a74c34c7fd6bf44e459c54f0add550285cf8aa436a330eb919f5e14deb3aed9772c9f1e55e61844c', 'student', '+201141218833', NULL, 'Secondary', 'Second Secondary', 242, 'grp_waled_sun3_wed3_sec2', 'wld_qr_a9bb32e406b2bb89927e4fc16545b13d', true, '2026-12-31 23:59:59', '2026-10-19 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_243', 'اسيل السيد رجب', 'student_243@alwaled.proacademy.edu', 'student_243', '787ab5fff7d6ac9d6c1965285e2ecea3:e0b243193f608cbea3f785fa487b79cea10639ad21cff0506dbb792dc3544259da3e65afec269a8a50cc5902cc7fa25808e7ea697bec2a3e1afd9811e807e766', 'student', '+201014091640', '+201014091640', 'Preparatory', 'First Prep', 243, 'grp_waled_sat5_tue5_prep1', 'wld_qr_779b017b947f1c4f62cc7bbd47b63261', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_244', 'خالد الشيمي', 'student_244@alwaled.proacademy.edu', 'student_244', '4d178c0e9f3ee9c2e42de30530a092dc:7bee3c7f2df02cf17397e471f0ba3e13eff2f956123b8d016fe04211bd199f4b048c7da5905961072097f81e9666e113807cd7da8a53eaae3caf9e88aa55ba1e', 'student', NULL, NULL, 'Preparatory', 'Third Prep', 244, 'grp_waled_sat3_tue3_prep3', 'wld_qr_98efb2211a4bfd7aec79fa9e21a57737', true, '2026-12-31 23:59:59', '2026-10-24 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_245', 'محمد السيد الطناحي', 'student_245@alwaled.proacademy.edu', 'student_245', '193f0570ac859053b1e6457529f46b5b:cd8408ea3b11724242561f732d47c2a7d0c445784bad11ce5a6bd6a4104cdd25c8712cb4205b50595855022e8e3b2c20126faadedf352faf091c5774af035fbc', 'student', '+201202704916', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 245, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_46f8ea7d3d43541f92b26b20b00d4bbd', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_246', 'أحلام عامر محمود الصاوي', 'student_246@alwaled.proacademy.edu', 'student_246', 'd48ea6a489c4ea0a2bed59b7d3011049:908c395332ab00f588ccb7b6074b178f199b3b5ec84a692c4a6bfc1e297d95e1a35d8ec4fa0a6d534a596a3e0077c020ba6a9df4803e25fc45738ba7bc5ebf37', 'student', '+201551671288', '+201207446150', 'Preparatory', 'Third Prep', 246, 'grp_waled_sat3_tue3_prep3', 'wld_qr_18bc4aaa6ca8017e5d3144fb629e3d37', true, '2026-12-31 23:59:59', '2026-11-10 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_247', 'عبد الرحمن ياسر فتحي', 'student_247@alwaled.proacademy.edu', 'student_247', '9bc7e7b7d8df5e0fe1a93e1d9bfc5c21:aabc6dadeca014f30572e3c348631455c2ede1253784a85a7401252715ba9515bcc93b96bc0d693a54d484ada0fd637909805a77eb94fb9b6efdb48a0a5be3aa', 'student', '+201040385212', '+201003493380', 'Preparatory', 'Third Prep', 247, 'grp_waled_sat3_tue3_prep3', 'wld_qr_b5064a1e2fe7de8c3cf3615239daa222', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_248', 'كريم رجب سعيد', 'student_248@alwaled.proacademy.edu', 'student_248', '14ba96b942b68348228e74d8629efc44:5513315e742e153bdaf0dc322abe08d79455ee786433fc780460bf1b612226acb1bad4bca953afb13688991136425a8508c72e0a6893be664351e133ca30b401', 'student', NULL, NULL, 'Preparatory', 'First Prep', 248, 'grp_waled_mon3_thu3_prep1', 'wld_qr_fce5e1bce307b93d0406139f3bdc3632', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_25', 'قاسم عبد الحميد', 'student_25@alwaled.proacademy.edu', 'student_25', '059bc1bb4fd05285445b12fda5396b99:b116d8f4a69a9c976563c20f09e5222bdd61f4778c22440afb4e90babbec7c8f760c8133918adcad201662b67167e1b9eed50bf1f057753019063adf3edebb53', 'student', '+201507606846', NULL, 'Preparatory', 'Third Prep', 25, 'grp_waled_sat12_tue12_prep3', 'wld_qr_0a6ead650a07f0b1db5dca1c1afd3417', true, '2026-12-31 23:59:59', '2026-09-12 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_250', 'نور رجب سعيد', 'student_250@alwaled.proacademy.edu', 'student_250', 'a648acaff4097dda34f097949abffcd3:3e91eae8218fd95c97fcfa94e5b65993a20a368d87ffafef6b709e4c22a11575f5fbedc7523884b602a0fe126a4b020c2d877e6e7298ca7f3ec17572df94b3e0', 'student', NULL, NULL, 'Preparatory', 'Third Prep', 250, 'grp_waled_sat3_tue3_prep3', 'wld_qr_99d1edc4f9363e069fe9338f8b7620e4', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_251', 'عبد العزيز رمضان ياسين', 'student_251@alwaled.proacademy.edu', 'student_251', '91e8cae17f6b5ca4f7afd6ff5fd385e5:7f941328ebb40669a4eda8ea1db1dc92cceeb87dce865512e0d58e89ae83d0ca58a4656f8156c0762e95d9a277625eff9dc181e571fd6814c252b37823fc3de9', 'student', NULL, NULL, 'Secondary', 'First Secondary', 251, 'grp_waled_sun2_wed2_sec1', 'wld_qr_05b80879bc40cf37f1a70bb9a343a9d9', true, '2026-12-31 23:59:59', '2026-10-21 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_252', 'محمد سعيد عبد الباسط', 'student_252@alwaled.proacademy.edu', 'student_252', '972d99d6e3a3cdd66be1a13ab9301029:2119fccda02fe57537725674594e2ac565e8fcbf7a562354a0b8d5fe5e8f1d37b984c9cd5a918fb10fd021ec2060c5d4bdae0f24b6b46b7e962e38919fd09d04', 'student', '+201012002173', '+201012002173', 'Preparatory', 'Third Prep', 252, 'grp_waled_sat3_tue3_prep3', 'wld_qr_f10e14431046e0196e0db03989d30e7c', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_253', 'إبراهيم حسن', 'student_253@alwaled.proacademy.edu', 'student_253', 'bf21947168dafaedb88750bb1f745636:c683cda93713c9f300465d43a90116696c39b78731686da6d80f113226a629e40553a9a7a50cc732c0faa0ce792c725f57d497322755fab80d061cc860837f91', 'student', NULL, NULL, 'Preparatory', 'Second Prep', 253, 'grp_waled_sat2_tue2_prep2', 'wld_qr_b9ef2fb24c8a2fcb24d8ba8dab090c66', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_254', 'عمر و ليد عطية احمد شلش', 'student_254@alwaled.proacademy.edu', 'student_254', 'a212b41277b405b1ae690ce852b79c5d:007a265988c929f3beb1794d2e13ebae4bb8d121c979dc4f3941ed20ff03bb43b3191a18a255f9c3ba9cbda77fd0ebe16414551cb174d81ee954647a41cb4673', 'student', '+201558477403', NULL, 'Preparatory', 'Second Prep', 254, 'grp_waled_sat2_tue2_prep2', 'wld_qr_00eff2ec8cfe9df198c7f294d1ec396a', true, '2026-12-31 23:59:59', '2026-10-24 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_255', 'محمد وليد عطية شلش', 'student_255@alwaled.proacademy.edu', 'student_255', '18f66fd2c56f4fbaea4af3c6bf7ce1f9:97c76a93dca12730f92b66eedac1cdafb22766c377b8882279c65877a90b5d681f9acbf962f796a9e4b12bf2945f49c1d035415a3285d81a5b0f6ae8b0ffc7d4', 'student', '+201004015432', NULL, 'Preparatory', 'Third Prep', 255, 'grp_waled_sat3_tue3_prep3', 'wld_qr_60fcfc2279d338d6c51c803a2144e7b0', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_256', 'سيمو محمود سعد', 'student_256@alwaled.proacademy.edu', 'student_256', '712cc5e6b627f23556bd948c2271a162:a3943b0276cd5df35524da449d2f4ce3c49996e152db0eef53997482236c5217c775828cc1ca13c2ca925b9977b81a0bdc3bed6a9cf9446892a7235f69a7b328', 'student', '+201130340353', '+201108067041', 'Secondary', 'Second Secondary (Baccalaureate)', 256, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_9c127fd1b0f42bfac46e33f64a4b158d', true, '2026-12-31 23:59:59', '2026-09-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_257', 'عبد الرحمن ياسر', 'student_257@alwaled.proacademy.edu', 'student_257', '7df7b9b71b1df2ec88926c51713d011b:df1118f1a1aa8431d81396a972a1f39bf9687b27eb4fdaf6cbfb5c11376241feabba5fcb9ffe5a26da1f435785a79b7fd937db5fd65a72173f9fb2966441e647', 'student', '+201505594807', '+201100414805', 'Preparatory', 'Third Prep', 257, 'grp_waled_sat3_tue3_prep3', 'wld_qr_57c5ea11adedb9b4239a3fa1b8089624', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_258', 'حسام حسن', 'student_258@alwaled.proacademy.edu', 'student_258', '32b0a194b3900daf003f30619e4c9bc9:0cca0a912a9d0a73f17ffaac6ebd1d6c4cf8867e63deb9e3e7276a2d245637bb2b746ee8c2e8019679ed333cc14c0f04ec7a342639769cbc1fd6bb644de7a6ed', 'student', '+201092299131', '+201099294060', 'Secondary', 'Second Secondary (Baccalaureate)', 258, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_fc748edc33a2d88a7c4c0325688e3c25', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_259', 'مروة ماضي', 'student_259@alwaled.proacademy.edu', 'student_259', '2651dfbbc02c0f61b4903acdacda12b9:7068f9edc8740892e659eb07427930319ccc1feba7ec3fa78741506006e65f55d7d42e5d18e36f43903107cd9a5c20741a18c0174619771cf0d420341b5bfac1', 'student', '+201210530512', '+201006070876', 'Preparatory', 'Third Prep', 259, 'grp_waled_sat3_tue3_prep3', 'wld_qr_3f5f5a6d937b7d52671880bf637f9dbd', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_26', 'سلمي طارق سيد حسن', 'student_26@alwaled.proacademy.edu', 'student_26', '3f4fc07331aab0aed4fae8879b35946c:e047cc508a57147f8f728aabdda0545d13ca2257a8b39109a69bad5c5979f598b0a1b52d8aa4d62c1ecddb085eed6b77d4c9bc4861accd5a7bcd4d3b92a46a0f', 'student', '+201222188509', '+201210394137', 'Preparatory', 'Third Prep', 26, 'grp_waled_sat3_tue3_prep3', 'wld_qr_53a0939e43e1eb8c3e5f6f7583cc52db', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_260', 'رحمة رحاب', 'student_260@alwaled.proacademy.edu', 'student_260', 'd61f6c242ca4d435baef2ff9a3e00a20:22865c7a554a060e96bf9a4499eadb16953301c1d2f94dabe45e350433e3ffe47d14cba4783c0fb85b30efd2c1db1eab621fe182812f9446b76d1328c1320a73', 'student', '+201555411842', '+201277952750', 'Secondary', 'Third Secondary (Baccalaureate)', 260, 'grp_waled_sun12_wed12_sec3', 'wld_qr_3fdedb07fd5e9bc716511e1e7f182251', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_261', 'محمد احمد عبد العظيم', 'student_261@alwaled.proacademy.edu', 'student_261', 'bc4b0a2fc53076fe88b7a585d8956cfc:3ad629e6f506cb114dceace6eaf68b33cdd633ce6b8564cb2372a4c73cf9526af372f6465764bad327daf8e006b5dbb66821c72ee93f88e1a69c0d2d3d38c1ee', 'student', '+201557980840', NULL, 'Preparatory', 'First Prep', 261, 'grp_waled_sat5_tue5_prep1', 'wld_qr_ef5c631a709c8325174c48b22c21e62b', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_262', 'محمد عاطف احمد فرج', 'student_262@alwaled.proacademy.edu', 'student_262', '17056cf317ace325aaa5bdc12f15fdb9:b2ad31e125193addcb159137fc8bc24b7561286c43563cf000bebd05fecc96f1c2a0d0cb6c2382306eb5ae2fbfbeef65ea8c2a42025463eb38fbca3c60b9ff29', 'student', '+201129355228', NULL, 'Preparatory', 'Second Prep', 262, 'grp_waled_sat6_tue6_prep2', 'wld_qr_01b484d9d585f4019b6dd6dc41c70f79', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_263', 'فوزي عبد الجواد لاشين', 'student_263@alwaled.proacademy.edu', 'student_263', '83b130796f4da781823098649e46b6dd:65bf4e6b8af883e650ba2433d3af1a35c691c15d66c3ecc6ca91ac93faf5eee55b3bcc2731bb414c899bc1f17b9239cb922e65307b405f8fa07f5b2018f33479', 'student', NULL, NULL, 'Preparatory', 'Second Prep', 263, 'grp_waled_sat6_tue6_prep2', 'wld_qr_67439755e79fd2e2a815d02cf94f4b73', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_265', 'محمد عابد', 'student_265@alwaled.proacademy.edu', 'student_265', 'c2c6f918a40ee3e4ec4abae4d43d2f2b:ef77eabf533f166574ce2186708092aee72eed23cacaca04865ded8afb2ef4a89ed944888c3b38b64124be38cc5d007d3b89f138435f818ebab54b36e5f01e7a', 'student', '+201063086039', NULL, 'Preparatory', 'Third Prep', 265, 'grp_waled_sat3_tue3_prep3', 'wld_qr_3a6a3690bb6e0f1874fc70522dfc54d5', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_266', 'سعيد هاني فياض', 'student_266@alwaled.proacademy.edu', 'student_266', '4d7d22d69a29c4ce9845733d53ac90bd:a3450cb86ba11b894304b1c90301f5670a585a3d433395afb7f91c4f47a9905802c3cbfec84890c436bd12c42351a72431c068292c3d57f4bc4899185caefcfc', 'student', '+201000880129', NULL, 'Preparatory', 'First Prep', 266, 'grp_waled_mon3_thu3_prep1', 'wld_qr_d59f3ef0ad22cd81bce0a39867bd152a', true, '2026-12-31 23:59:59', '2026-09-12 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_268', 'عبد الرحمن محمد الحسيني', 'student_268@alwaled.proacademy.edu', 'student_268', '834b4add1479ac9225ae38b39a351159:330df690341c599ddf018141ad0411448ce2ad946319fe9b97a5eb500f0680554edd754edbd7b803971d64791dc3204edfac8ab61e72e9ff4da11ef9df5705f2', 'student', '+201011398201', NULL, 'Secondary', 'First Secondary', 268, 'grp_waled_sun2_wed2_sec1', 'wld_qr_3752d2bd048e8e22ca0344e47e93cd4c', true, '2026-12-31 23:59:59', '2026-09-02 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_269', 'عبد الله رياض', 'student_269@alwaled.proacademy.edu', 'student_269', 'd34073f2dd0ef83fb17f806dd9624870:22331ec45d5cf9ac7f37b0202f474e7d116e82d86833ed0c94dfb6beb28713187a4427cf96843cabb70a19fc9fd4954739f87aecdd1dc1af0fc76f699c1bd5e8', 'student', NULL, NULL, 'Preparatory', 'First Prep', 269, 'grp_waled_mon3_thu3_prep1', 'wld_qr_d1f78a348f886a8b799ab6c46a14171f', true, '2026-12-31 23:59:59', '2026-09-22 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_27', 'عبد الرحمن صبري القاضي', 'student_27@alwaled.proacademy.edu', 'student_27', 'bdb0cbda6cf880d1af0e8d10d0c54399:675a2a0d852c00e1738815134ae3faa3c8cbe7ee1a69f76c149599dc0975d026429dac6b179b1e66e0efbcbb36977b52411e3b723cc3540359bd04274e4d63e1', 'student', '+201022366834', '+201022366834', 'Secondary', 'First Secondary', 27, 'grp_waled_sun5_wed5_sec1', 'wld_qr_43a2608fb30b23c1dd6a7ccf8457092e', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_270', 'كريم محمود عبد العزيز', 'student_270@alwaled.proacademy.edu', 'student_270', '35c80d1dbdecf4119aeae029e929a9ef:d5d07fca37328b6b07ae37b8f5cce95fc3aafa4cae8ecd8c60c199a15478c2a39c3b42390366a1e878e319ba385871caf21b9b4e80a25d90b2765d41544871c1', 'student', '+201091373633', NULL, 'Preparatory', 'Second Prep', 270, 'grp_waled_sat2_tue2_prep2', 'wld_qr_a47a72be8bc6b8dd63078975783351b8', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_271', 'شيماء محمد حمدي', 'student_271@alwaled.proacademy.edu', 'student_271', '44682da47601be42934e78132184be3a:9f441f2b38888566583f3c3a851c62f6af3a531c98c8954edc2fdabc192b0964e08bc0476c08238fd2bf5d6b32228e407d5f6475b3465f6bd12c60a33a51f597', 'student', '+201554215250', '+201286061599', 'Preparatory', 'Third Prep', 271, 'grp_waled_sat3_tue3_prep3', 'wld_qr_f3bbb4508b4b696a4fc783d0e3572f4d', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_272', 'مي محمود حسن', 'student_272@alwaled.proacademy.edu', 'student_272', 'ed82b7fe053a4560ccbf25cf1248261f:24e0907ae0254eab854fe35a9d10dcd5e870a753a841398fc208ff5cedcb8564d8c9b045462bde12d677c66358bfe3a3e94a272782a99f63d61798287df0f5b1', 'student', '+201006311586', '+201002009462', 'Preparatory', 'Third Prep', 272, 'grp_waled_sat3_tue3_prep3', 'wld_qr_ce930cecab4bd18393a7ddab4c87a57c', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_273', 'يوسف اشرف محمد', 'student_273@alwaled.proacademy.edu', 'student_273', 'a1a0e539e6cb749480d826a535c6f1ff:3c94b1662029c8bad11a58f62d4284d7c4feba77e7d348764d35209768366d33e91ffd85c88e8d6fe811e4c5087f261d7bc94ba2ab44d90bf6b90333f255ce0e', 'student', '+201501033428', NULL, 'Secondary', 'First Secondary', 273, 'grp_waled_sun2_wed2_sec1', 'wld_qr_f573cb140f2bc3658a7d413817450583', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_274', 'حمزة إبراهيم محمد رمضان', 'student_274@alwaled.proacademy.edu', 'student_274', 'e876d6f67777b743e82cbab6050c1052:58f0a8f72052e887454da52b5acc75dd30e48e2369fe64ebef50a4f2165185e9fedee4826411d483d9779babf253b85914dd809e494fd3c306fc3855de0d480a', 'student', '+201037683122', '+201225638138', 'Secondary', 'First Secondary', 274, 'grp_waled_sun2_wed2_sec1', 'wld_qr_63dd2b4688962cd5458f2734791eb141', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_275', 'محمود اشرف محمد', 'student_275@alwaled.proacademy.edu', 'student_275', '2ba05971426cad59f9e4e175acbaf882:a90d4b87b704aef2431d63b49c9d3abb6930d019e15f7179cfe3756d37256fb4775533181af7bfcb7bdf31a702556c5adad15208a92a65378798900989f7503e', 'student', '+201501033428', NULL, 'Preparatory', 'Second Prep', 275, 'grp_waled_sat2_tue2_prep2', 'wld_qr_a588380e0f7c560a2988b1f1f92d5fee', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_276', 'يوسف محمد رضا', 'student_276@alwaled.proacademy.edu', 'student_276', '7534f03a215ea6d9287af5e6f677b825:eca8672392e1326b54ba1646216d268d6fb4af76cc0cc0ea9faa081a5b89fc99ad1e05f050fe99f10b5ceeac7adebebafc4af02805521161319d637cc72d9231', 'student', '+201091921265', NULL, 'Preparatory', 'Third Prep', 276, 'grp_waled_sat12_tue12_prep3', 'wld_qr_cd0c6fc6b1ea9db07546c37d85fb973f', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_277', 'مازن عطية رضا', 'student_277@alwaled.proacademy.edu', 'student_277', '677eb6266d305278ccfa98fe640ebbaa:320e4460dc05bb6a421eff61e97a5c881929c6d4aef2c2a943f8f65476ad04427f7bad9c60f91aa7660f12931efba53ffabd96c08ff98352386af33816d9e7ec', 'student', '+201552991713', NULL, 'Preparatory', 'Third Prep', 277, 'grp_waled_sat12_tue12_prep3', 'wld_qr_e02032b48f895cb918547c4d3e13aaf4', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_278', 'اية امين محمد', 'student_278@alwaled.proacademy.edu', 'student_278', '052887a91d52e99b09238ddbf2e38956:384d0d21ade04935d3a9082e94c1d395d77059e1491131de429d9a895bcf27d620adeeb75102158b82c72df976cbcac44f5c7b073dd1713a5a66115e950fada4', 'student', '+201125986523', NULL, 'Preparatory', 'Third Prep', 278, 'grp_waled_sat12_tue12_prep3', 'wld_qr_4be295e9d4a752ad35f0012edd455f21', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_279', 'السيد كامل', 'student_279@alwaled.proacademy.edu', 'student_279', '9cb38541a74f84171c4e36a60c0eb41c:7fbba7c682c1fbd2752a21f29bf6391438cb99b626b75673beed2c307ccc08c3669ff99ef3c9f669bab24039d4a0104df3ef090864de38257827b58e0dc19f51', 'student', '+201285701177', NULL, 'Secondary', 'First Secondary', 279, 'grp_waled_sun2_wed2_sec1', 'wld_qr_5f60a69ae7b8aba7653314207b73fa0a', true, '2026-12-31 23:59:59', '2026-10-21 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_28', 'هاجر علي محمد فرج', 'student_28@alwaled.proacademy.edu', 'student_28', 'd5ba75e3ccc31443d811cd20d8f83dc7:047d157e6e0961d0e0ea243bf5f03e30a55ddb127ebe162869bbce3cd5c58551c9366e6ae4f9b0cd8be78e8fd74c5b32b533d16b7febd933a61a8df9052e4d6a', 'student', '+201103175959', '+201103175959', 'Preparatory', 'First Prep', 28, 'grp_waled_sat5_tue5_prep1', 'wld_qr_37fd807b9d48cd36b030085f12837584', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_280', 'اسر وليد الششتاوى', 'student_280@alwaled.proacademy.edu', 'student_280', '61d088a68e8873aba4bcbc29804b341e:d4d18e29fdf2fbb45df45478b2482235f3cb0f52dad82d45f5eccbca24a97ada6224864a400ef0d897f3eac73f57c4b246d2ebb1281c56b3a34e231ba0c0c4f3', 'student', '+201550327148', '+201550327146', 'Preparatory', 'Second Prep', 280, 'grp_waled_sat2_tue2_prep2', 'wld_qr_252c8773165395d5d33bb7e628c159c3', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_281', 'احمد شريف احمد', 'student_281@alwaled.proacademy.edu', 'student_281', 'b608af3242f3f55b9bac33cacee4b468:31edbf889b72cbb932be497890bef19933c9dae50ba81b29737d01b159de904f70538de1d22927bf8c83cc5a36f5fe95f881496379e1a05210736aef4f54eb5f', 'student', '+201507402596', NULL, 'Preparatory', 'Second Prep', 281, 'grp_waled_sat2_tue2_prep2', 'wld_qr_4d9d0e60908f17d324a6a425c170e6a8', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_282', 'امل عمرو', 'student_282@alwaled.proacademy.edu', 'student_282', 'b058018f2db3af596b08f98165d42703:0f95eac385b68a4ca725ce076519680302dddbe3e3ab8e991823118342dd5d17b462de218205465cbcb735925212b415c9fa034d8cb9e7d814950e38cc94a2a2', 'student', '+201007308939', NULL, 'Preparatory', 'Second Prep', 282, 'grp_waled_sat2_tue2_prep2', 'wld_qr_2389b231fa3ea0e7a26e7722185c40d2', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_283', 'يوسف فتحي إبراهيم', 'student_283@alwaled.proacademy.edu', 'student_283', '6cdef45b01a246f85047c517964b10b4:6eedc86a601c5793ef60bda28e19d78f322240b1a4039d67748c6b4da221db41e24e7408924ad84a5ce0b150ec2618f6123d555ae28006644cfc2edcb79857b6', 'student', '+201211339823', '+201211339795', 'Secondary', 'First Secondary', 283, 'grp_waled_sun2_wed2_sec1', 'wld_qr_49be5446d174662edd99a6bc027b9c97', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_284', 'هنا عطية رضا', 'student_284@alwaled.proacademy.edu', 'student_284', '54eff0e53a02bd76e4cd71d3a018ec6f:0812c596d31b2523e4f02f694a419f6ec1d4ab32da3cd9d0ed2016418957b87469fb34f6ded9ad1bf83807d99a00ff1db73af519eaa55e8b300e09c51e81a980', 'student', '+201070601270', NULL, 'Preparatory', 'Second Prep', 284, 'grp_waled_sat2_tue2_prep2', 'wld_qr_820445960919465ca7962f8ad7b6bfd1', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_285', 'ايات عبد اللطيف', 'student_285@alwaled.proacademy.edu', 'student_285', '90ec1b64662a8ab69917a357c406bef7:cc6dead2616c3bb4cd3657114d886b4dd11bc5f7f21f1de8f03d17fde2bb62f46a4cb5b54bcb7f560a22524daea60f3d31a32bf773d95ad36056150c88b55bd4', 'student', NULL, NULL, 'Preparatory', 'First Prep', 285, 'grp_waled_mon3_thu3_prep1', 'wld_qr_d4c7b3f0d285a036410c234953168b2a', true, '2026-12-31 23:59:59', '2026-11-12 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_286', 'مالك خضر احمد', 'student_286@alwaled.proacademy.edu', 'student_286', 'cd1467a96538dfde47892191ab3be975:f7fc3b250093f4390c1f2d57feb6a2ebe3a73a15ee30348d61487c02c9525ea9c1f3464886438bbd04c284ece69a10a765b296ef05534afb60231eb554338ab5', 'student', NULL, NULL, 'Preparatory', 'First Prep', 286, 'grp_waled_sat5_tue5_prep1', 'wld_qr_bf6941529a19ef5d7a940a4c29b6777c', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_287', 'محمد عماد العشري', 'student_287@alwaled.proacademy.edu', 'student_287', '9a64220409f22542e10ee3b7e276df81:8ea5496a2dca57619b23d175ad72704f4d5e5af5db0b93b0191776be492e9fa9b2300c51fc242b8a4b599b8a987286cce7a8f3a39b233927b5beaf326852843c', 'student', '+201224623481', '+201200626525', 'Preparatory', 'Third Prep', 287, 'grp_waled_sat3_tue3_prep3', 'wld_qr_afc8b4c34ec1769210cb2cad1fd9e34a', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_288', 'مؤمن محمد الشرقاوي', 'student_288@alwaled.proacademy.edu', 'student_288', '79ff8aa4b61535fe44ea201c8452543a:7bd5365b5f31c4a7b058a1e4222c5149621c85abb118570f0657ff27557f978a5b557db265d1a133fadb2147f32220b340b1b197dc9d475dd195cccc149ca6dd', 'student', '+201005027723', NULL, 'Preparatory', 'Third Prep', 288, 'grp_waled_sat3_tue3_prep3', 'wld_qr_1df584ac9ed8583b5eb614093b6783f2', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_289', 'اسلام السيد', 'student_289@alwaled.proacademy.edu', 'student_289', '96dd5cfb36ec31faf65d1026fe56e247:efe22bb07dc3f0d803d48da46df263e516ff65791a9e2d5c7622680652e6eb8c7da7ba0e88daeed37beb4680338a07118587db66ff8b75ac76e9d522d0dbce7b', 'student', '+201012729158', NULL, 'Secondary', 'Third Secondary (Baccalaureate)', 289, 'grp_waled_sun12_wed12_sec3', 'wld_qr_693d643cd06881f1128fd1b893840635', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_29', 'محمد احمد فرج', 'student_29@alwaled.proacademy.edu', 'student_29', '5bfb53e87326ecd11fb4ec9a92509142:754cacc2ec86d3c85896af403421f205b28029822d1a5a703453037ac810cdb655a7909662b2d80df12a492128fe1c6cd299e98c8ff6a005d498be8ce44ea2ce', 'student', '+201099116556', '+201099116552', 'Preparatory', 'Second Prep', 29, 'grp_waled_sat2_tue2_prep2', 'wld_qr_a809a9461ad67e264ab9a75122ec4821', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_290', 'مريم محمد الرفاعي', 'student_290@alwaled.proacademy.edu', 'student_290', 'cf52e1f91085b00bcfa791571a3a1fb9:15be8625ab4bb704d5f45b0bdaf60fc240e340bec37bec98a1834d2052f5e49f5fc4ea5b7721265cb741baca93b17e5af00ac4971e4f294bf15fc93bfe4e499b', 'student', NULL, NULL, 'Preparatory', 'First Prep', 290, 'grp_waled_sat5_tue5_prep1', 'wld_qr_7725ad615468eeee2616fcb15a09de88', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_291', 'محمد محمود الشيخ', 'student_291@alwaled.proacademy.edu', 'student_291', '023a71b3d457b429a8b8597b4be1c2d8:6ce31200812e8bf29b44427e13aa2d0db2c8b860aaf735ef7433846c208b8f9c355cb3bd9aabba1c11140b3928ddffba088788426072d0f1619bb75a7c8c5e26', 'student', '+201286699582', '+201067163795', 'Preparatory', 'First Prep', 291, 'grp_waled_sat5_tue5_prep1', 'wld_qr_bed0ac1ca755f65bb7e3f4064631f397', true, '2026-12-31 23:59:59', '2026-10-29 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_293', 'جودى محمد صقر', 'student_293@alwaled.proacademy.edu', 'student_293', 'c714311f150a3e4254cea76732dca622:f7e5b380f5ec1f05be889cb72d87a709252358f78ebd1fa63a5886599d5f87ab0c560f8d199a2f5931c7823c1c91e2c0072646bf9adf9c520cb5bb7fb2c44fe3', 'student', NULL, NULL, 'Preparatory', 'Second Prep', 293, 'grp_waled_sat6_tue6_prep2', 'wld_qr_32b1e775b9b9e73c8cc7bb134458fd33', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_294', 'يوسف محمد القزاز', 'student_294@alwaled.proacademy.edu', 'student_294', '68a3bf626338f8ae6af686392800c982:5a2d63a6b79f82dbea08a54947ed101d0e51b14a88ca0517f2d9eae102eeff903e5181c23ce4fb126fd0a2833bc5c089a025e3d345974f85a8ddfd8eabe0c460', 'student', NULL, NULL, 'Preparatory', 'First Prep', 294, 'grp_waled_sat5_tue5_prep1', 'wld_qr_763e209b9760291e37e1634d0dcc39bf', true, '2026-12-31 23:59:59', '2026-11-12 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_295', 'لوجينا محمد إبراهيم', 'student_295@alwaled.proacademy.edu', 'student_295', 'f7f8e9f4c294623bd8bf7f709364e008:a0975055900ae8072ee8206da78cc3ca9a4b6daf58ab9d3bd02552e13b3e7c619595627d31ed7ca9b292f42ad5a93132d5beac452ab0f966e903167fad7a1465', 'student', NULL, NULL, 'Preparatory', 'First Prep', 295, 'grp_waled_sat5_tue5_prep1', 'wld_qr_4536e09a0de03677cf58dac2fa6dc7e9', true, '2026-12-31 23:59:59', '2026-11-14 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_296', 'بسملة مصطفي رجب', 'student_296@alwaled.proacademy.edu', 'student_296', '60aa8098bb590a68c01a5412120b6ab1:b5c8bdd88eb9d2b41e0e7b16b96907824c5c793f5ffb1ce6ecd5f59023c0d3dd219d2736066377dcf630d68ba850533dc2e5d6ddb5f93d3482b5187fcc2b4908', 'student', '+201092891537', '+201273647554', 'Secondary', 'Third Secondary (Baccalaureate)', 296, 'grp_waled_sun12_wed12_sec3', 'wld_qr_850c6fc07f2318a89dbd01a2d29471dc', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_297', 'رحمة صبري', 'student_297@alwaled.proacademy.edu', 'student_297', 'a2dfcce4c5f3f415ce3d570ed14b0661:a2e8c0405787b7f732e4fbf5e7987a3654d1800ca56b2036e34bc89033d6d8fd7ebb1547a487dadd7a18e95ac182e410cb5894be634dc08dfb68dbb306e8a4df', 'student', NULL, NULL, 'Secondary', 'Third Secondary (Baccalaureate)', 297, 'grp_waled_sun12_wed12_sec3', 'wld_qr_be9122be5f3dc4cacb9f17cf5b313ffc', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_298', 'حبيبة حمدي سعيد', 'student_298@alwaled.proacademy.edu', 'student_298', 'b08a10decbaf4264ab160c585e408b6a:e436f245fc44e1a0cf13770ffba118918008472c5f50197610aeb5d3631ca774cd86d8f35d7fd9c216fc2f69f04dcbf61363b5553254d885deea5cbbdc598c97', 'student', '+201032458481', '+201016922486', 'Secondary', 'First Secondary', 298, 'grp_waled_sun2_wed2_sec1', 'wld_qr_73b7e401bd5f99488311bc71a1542809', true, '2026-12-31 23:59:59', '2026-08-02 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_3', 'سعاد رضا محمد غرابة', 'student_3@alwaled.proacademy.edu', 'student_3', 'e4a7a52fa3c2df23d231817d12e2f313:f89a4b2b38d6dbcf0d2fef4a6af1f52d66d67eceacce33e3a9194403e8915b84977fc380192d2981db3a6ba5fedb561ae310fe1821b663cb8171444ab3440f9c', 'student', '+201220702359', '+201067646632', 'Preparatory', 'Third Prep', 3, 'grp_waled_sat3_tue3_prep3', 'wld_qr_c568947d694a8de704f5d7a64d453d86', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_30', 'سجدة احمد عبد الله', 'student_30@alwaled.proacademy.edu', 'student_30', '0aae34776e925e88408e621a84005715:51cc63d8317defefd636114f06d8c8b10531b171a639be2197ecfa7cb1c1a15602460b25fa35be880d020cb238bf68064a3f0f4c96ecbf33860533938ebccac8', 'student', '+201040668052', '+201040668052', 'Secondary', 'First Secondary', 30, 'grp_waled_sun2_wed2_sec1', 'wld_qr_ca03534f4a088caea8d7deb531613bf2', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_300', 'فاطمة احمد عبد الفتاح', 'student_300@alwaled.proacademy.edu', 'student_300', 'f2bd17c09d42865834c52ccb28e771f8:0c791edb6a925fcba1139a8c88e5e40a622e018999aee756ead21a22e72e84d099680fb33e7157f508830631f20a7011fe812028b0ec5429d3349e309c1cb99e', 'student', '+201092326674', NULL, 'Secondary', 'Second Secondary', 300, 'grp_waled_sun3_wed3_sec2', 'wld_qr_845697982e91699c0ac024088c7ca781', true, '2026-12-31 23:59:59', '2026-10-14 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_301', 'حنين احمد الطنوبي', 'student_301@alwaled.proacademy.edu', 'student_301', '6c522a7c0de0c17c6230087e1987778a:0a5f5c63db391cb85d0057a7ca47e03010938738d312a16a48319660e2fb5ec4ef04ef97a4192b734a0b02f273f2508e4b142efef8d145d0509c569a411ef483', 'student', '+201015631722', NULL, 'Secondary', 'Second Secondary', 301, 'grp_waled_sun3_wed3_sec2', 'wld_qr_3aeeda6ccb695070d49f8fdca6a7ee45', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_302', 'هند صبري', 'student_302@alwaled.proacademy.edu', 'student_302', 'c453a1d2d1466a71fcc4329472bf7e3f:0e6f1cb193d416e9a3e8fe312180e2e15ad495c656a4ded8e3e5d65a3b4afb6cad3ef9a653aac028638975647e9af86860f60053d27783fc097138305dc0932e', 'student', '+201206566249', NULL, 'Secondary', 'First Secondary', 302, 'grp_waled_sun5_wed5_sec1', 'wld_qr_62f173ee31757e931721ff143ede432b', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_303', 'باهي هاني بكر', 'student_303@alwaled.proacademy.edu', 'student_303', 'ea5158ea9541c8bf9d98e3f109912bb7:560ec17db1fef1f73671ac5731a0495c295239fadc481998c97043e404d3348014c1880a59c60c393dd2afca0393accd083a57b0afc1feadf4badc9a172c87f9', 'student', NULL, NULL, 'Secondary', 'First Secondary', 303, 'grp_waled_sun5_wed5_sec1', 'wld_qr_4fcfad9ab0151cc88635f5b06b2b3aec', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_304', 'سامية عماد', 'student_304@alwaled.proacademy.edu', 'student_304', '27e5614c2ead7c8069bc7e134f20d801:ff64b0069f584fc81911a9ab81d38826d97f9eac72575c476ff060067566ab49a028550d45d930ecacef45c305e9d858876be4abf533b76d59bc185035cd9795', 'student', '+201121302584', NULL, 'Secondary', 'First Secondary', 304, 'grp_waled_sun5_wed5_sec1', 'wld_qr_d5037afd2a808bd781d2fd0e3d28e391', true, '2026-12-31 23:59:59', '2026-08-02 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_305', 'امال محمود', 'student_305@alwaled.proacademy.edu', 'student_305', '5ed391642b1322408dbd034f5b2853b9:ac242f9b651b8f9c3e5f18a46198b7adcd92fd4b6931d04583c6d9d60f28b7a970e7961800b76e786b53cac05342f46d85c7b3244f75188f036316c5e584ded7', 'student', NULL, NULL, 'Secondary', 'Third Secondary (Baccalaureate)', 305, 'grp_waled_sun6_wed6_sec3', 'wld_qr_fbb6ba0569c84d8138a0e0765fef34bb', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_306', 'محمود علاء شعبان', 'student_306@alwaled.proacademy.edu', 'student_306', 'c4b96b627d618f6f9b1f0a484d0ede97:c00ac8948e77419eb40b7c4d2d4e4ba2c23fa0f9a97a321f0cba969d138861e7427ff7fc445ca8de6a332aea6499e430a90002a1a178483327b3a59bccdaff13', 'student', '+201228742492', '+201200054172', 'Secondary', 'Second Secondary (Baccalaureate)', 306, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_a8e6ceb5c5cf7e745f0f8cbce4b9115b', true, '2026-12-31 23:59:59', '2026-08-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_307', 'يوسف عماد', 'student_307@alwaled.proacademy.edu', 'student_307', '3ba1e53ead7fb0ec4f6a15f4ba54b9e6:1451103f6085c6d03b6a096eaa5104bb012e5b6909f75aa0b36191e849ae46caf32e28833e21512a8e9051393c564ef26559c822f3c456a2c611249da99e7a81', 'student', '+201034159403', '+201090132675', 'Secondary', 'Second Secondary (Baccalaureate)', 307, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_0d897bf17f19b418dc2fbf61d8bfc80d', true, '2026-12-31 23:59:59', '2026-08-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_308', 'يوسف سعيد عبد الفتاح', 'student_308@alwaled.proacademy.edu', 'student_308', '1e9ee09080b080f4f0f32f32e94162ce:f48e678ff8d6beb38efdc457c0f1cc2710248d037281fb4f228feee699be16222eb57a46589dbaf9c30f1194af6ad4c8c358d38a15813d0d04896c3edefec846', 'student', '+201026939587', '+201120814694', 'Secondary', 'Second Secondary (Baccalaureate)', 308, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_d96da4f54447955d008ee38a2d35910c', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_309', 'صلاح عصام محمد صلاح', 'student_309@alwaled.proacademy.edu', 'student_309', '5ed0729b62fa73745c1ec51d5ffee22d:893516e753abe1d92c5080b7cd8cee7a26271f816d0dd11dafc4e8b7e44552f63a6b5dc5ffd6897f7b4e8caada941ff1c44db5f17de65dc79ded706978671a05', 'student', NULL, NULL, 'Preparatory', 'First Prep', 309, 'grp_waled_mon3_thu3_prep1', 'wld_qr_77403403780bd9892290e27ad6cd36bc', true, '2026-12-31 23:59:59', '2026-09-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_31', 'سارة صلاح فايد', 'student_31@alwaled.proacademy.edu', 'student_31', '52d81b4e8a57ff60ad16a5e10e5b3224:bd559082b86874254beb78809f3b553a7e855e6663b685be0f3299ccd3b897c39940bb2876b931880e1c547c0b829d4aee33f6bc31c6806ebe8f77e801c3c5be', 'student', '+201050153013', '+201091831912', 'Secondary', 'First Secondary', 31, 'grp_waled_sun2_wed2_sec1', 'wld_qr_b9a2c54ee824b4ec1310a953b233b5e7', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_310', 'عمر إبراهيم حسن عجمي', 'student_310@alwaled.proacademy.edu', 'student_310', '52dac7506dbd09f3bef62322d5e65ae0:92c731137d50e8f4039e3ff98c92cc2b0c59659945cca01664eee706e275e046ef7a5bd5373bf4385ce7976319f5e92219fd7282cc042df77cc3bf139c3aa872', 'student', '+201557791104', '+201094965128', 'Preparatory', 'Third Prep', 310, 'grp_waled_sat12_tue12_prep3', 'wld_qr_921fe9e7426c5a58a14a9d14f0c424d7', true, '2026-12-31 23:59:59', '2026-09-15 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_311', 'شادي اشرف الهباش', 'student_311@alwaled.proacademy.edu', 'student_311', 'd8d54d4b753dd591a0a18f71ecca2279:d7126069763263aec9e49d9845a530707382f0ee68e1596f29fc6601f680db14b068c620f5696733606c179c83588af5cd203d52201e36f66d210bcdc615d471', 'student', '+201272176432', NULL, 'Preparatory', 'Third Prep', 311, 'grp_waled_sat12_tue12_prep3', 'wld_qr_da2e1fc9922620eb735d3a4731d62ae2', true, '2026-12-31 23:59:59', '2026-11-14 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_312', 'زياد إبراهيم عبد العال', 'student_312@alwaled.proacademy.edu', 'student_312', 'f2e9e83537d1f32a1556102e76f16107:7170544950a56e89619a680758c3abe2697b34e53d6ddaef8bfea1355d43b24c455dc40dc44452b8910200c2359984857d37362b4e96bc152d0531a335972f90', 'student', NULL, NULL, 'Preparatory', 'Second Prep', 312, 'grp_waled_sat6_tue6_prep2', 'wld_qr_9988296471c683deb308587c829336c1', true, '2026-12-31 23:59:59', '2026-10-17 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_313', 'عمر شريف فوزي', 'student_313@alwaled.proacademy.edu', 'student_313', 'c05f1bd64846bdda861b3dc37fe722d7:cb0c740ac72dfb51e30274600560a898a36b40b595a570cbb45217ecc9851562975faf0c90b26555fb184329b2604996c6bf0ebc593093104a3b9798e34cd2f5', 'student', '+201005825956', NULL, 'Preparatory', 'Third Prep', 313, 'grp_waled_sat12_tue12_prep3', 'wld_qr_b1cc3607bda550fe8905c9c49eb00e43', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_314', 'احمد سعيد عبادي', 'student_314@alwaled.proacademy.edu', 'student_314', 'cb20ff3662a8cb3076792cc0fde6ce30:1381bdcd7d0dbcc88748053c4575f0bcad86bc9339e63663c4ac37e6955d819e424abdf8180421031d94fb29fd73fab11a8cd5ab7a8c03837bd13472ee49efee', 'student', '+201067218251', NULL, 'Preparatory', 'Second Prep', 314, 'grp_waled_sat2_tue2_prep2', 'wld_qr_f6de615d34186508b4062b2082012487', true, '2026-12-31 23:59:59', '2026-09-05 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_315', 'يوسف إبراهيم محمد', 'student_315@alwaled.proacademy.edu', 'student_315', 'ceb7483488ed2416e770ddd99fa01da7:1554112d1238e9ba26e743235bf2d11b6ec7c490d38a0417e4567372b9a1e63206e6ce82d852bb95ea677a29b706c0487b5d0f723cf2416edd7474dce9a165b0', 'student', '+201207133980', NULL, 'Preparatory', 'Second Prep', 315, 'grp_waled_sat2_tue2_prep2', 'wld_qr_d765c8f63c76b379dc6511aa63460db9', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_316', 'نجاة ياسر', 'student_316@alwaled.proacademy.edu', 'student_316', '43cbcd4a18be8e92ca757c566a3fa5fa:b661edb85604fc09a8e276e7cef528e675e44ce81ea3f65bfe9767519d26606bf109abd270b07b6feb58bdcf378038c461232738436b7782d247b936937a7578', 'student', '+201146489589', '+201284670793', 'Preparatory', 'Second Prep', 316, 'grp_waled_sat2_tue2_prep2', 'wld_qr_7df3a7927807442e1d9ca30a6cb7477f', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_317', 'ادم محمد فؤاد', 'student_317@alwaled.proacademy.edu', 'student_317', '543b58d85a1bf18e5b8f0bcc3d86f144:65135f468d76fa3c32ec3ecc6df3e77cd30d4cf9af21d13eddcdb7c46cc3353bb781ef31b63b9b6f7748e1b07e82f2a104656de2d457c382ece5e53203cd2a91', 'student', '+201205007428', '+201270829320', 'Preparatory', 'Second Prep', 317, 'grp_waled_sat2_tue2_prep2', 'wld_qr_68e1f433caaf8aec8c15aa9c15c2e5b2', true, '2026-12-31 23:59:59', '2026-09-05 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_318', 'جنا إبراهيم حسن', 'student_318@alwaled.proacademy.edu', 'student_318', '287a5ed605a1244b35b02a9f8774ca16:dae011e83e0c2acee03038c4b28e9149830f1df60ba4c03962492ec7f5882e451c3350ecd745383073272964fb2c670a9f669c15a6e9ddb45b13d94a1b9e0218', 'student', '+201063410103', NULL, 'Preparatory', 'Third Prep', 318, 'grp_waled_sat3_tue3_prep3', 'wld_qr_75eb91579c91ac44a829855d9e321c5c', true, '2026-12-31 23:59:59', '2026-10-20 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_319', 'اسيل احمد صبري', 'student_319@alwaled.proacademy.edu', 'student_319', '8f42ecc3a9b52d9ce8bf24ee2b6bc280:ea202b009104a8678dabcc0d7827fdc78a836353099ef1337f96357d8afa05e8d95ec9f808b7a3e6986936cc7eb6da96ed70f2b3c7275910b2110ff8a167e631', 'student', '+201015124860', NULL, 'Preparatory', 'Third Prep', 319, 'grp_waled_sat3_tue3_prep3', 'wld_qr_7d3e848923c48f1d0912376f3ac10599', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_32', 'غادة حازم', 'student_32@alwaled.proacademy.edu', 'student_32', '9d46fe1fe415dc5d45affb9a67353fb6:9f59958de73e46ad5c0bce91f04aa5efeb79ef6911ac04eee4dd1f682d6baf96ec2bf3d0507574061090a97153eb1bd99583673abb29df8d70e9af1a44268b4d', 'student', '+201212959581', '+201271896633', 'Secondary', 'First Secondary', 32, 'grp_waled_sun2_wed2_sec1', 'wld_qr_a7989d724b2a925e586018139ea81363', true, '2026-12-31 23:59:59', '2026-11-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_320', 'محمد عبد الكريم صالح', 'student_320@alwaled.proacademy.edu', 'student_320', '5b2288e99bfa96e018c669106b5e590f:9f621087828e4dbcfcfee76f0e6b47c784e20316e230e17ec4388e3f0f37601369f940b273319b92848ac82b8e3ded482db0ad15015613df34925cc0a157e105', 'student', NULL, NULL, 'Preparatory', 'Third Prep', 320, 'grp_waled_sat3_tue3_prep3', 'wld_qr_8c4c5d37737bf6264492fd2449d34c28', true, '2026-12-31 23:59:59', '2026-08-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_321', 'اشرقت محمد', 'student_321@alwaled.proacademy.edu', 'student_321', 'c346d092687cf3c5541d8dbf5d5bb895:3d2ad95774a71090ca5a4c8abf10cda5426c3ba84979b8f81a9b4d20474654ef697f0b18d07e023ee3f273d3ec0b6c83d2dfca3ce17717adfe3a54debcb14983', 'student', NULL, NULL, 'Preparatory', 'Third Prep', 321, 'grp_waled_sat3_tue3_prep3', 'wld_qr_ae61d923ee9c9c8493fc7a5f24abafba', true, '2026-12-31 23:59:59', '2026-09-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_322', 'افنان السيد', 'student_322@alwaled.proacademy.edu', 'student_322', 'cd4f904daf860fbebdd4351aa71e9ed2:662bea6033884f60963f4e45b47bffaff62098db4b194ad73b5afee91ba13ca118ee3c0a6c18bd67f18de67ea461b12f60fdb5e36505b16b2e45f15aa983fd32', 'student', '+201044387895', NULL, 'Preparatory', 'Third Prep', 322, 'grp_waled_sat3_tue3_prep3', 'wld_qr_0a18c84fddd5def7a4839337fd2e060c', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_323', 'جنات مجدي', 'student_323@alwaled.proacademy.edu', 'student_323', '0b111dfe37848358d5430e7baf0356ed:21e96e167879d35ff7b1f0182120c6e527d40c12aa26a6de516aeba8ef3ed5c690bb34af3ccff69544c4a4f35bdb22c8dc0529f403054033069e6909149ac479', 'student', '+201225201411', NULL, 'Preparatory', 'Third Prep', 323, 'grp_waled_sat3_tue3_prep3', 'wld_qr_80352de131d070b70938277c34c42dad', true, '2026-12-31 23:59:59', '2026-11-10 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_324', 'حبيبة محمد عيسي', 'student_324@alwaled.proacademy.edu', 'student_324', '0016e14686872e3d183f3ed290cd7fba:490a92e30eadbf79ff3458b64d9bf96bcb79bff13c3ce00c59a52af852c1bee504262a62668061f685f4be2f0beca081e0ec306553c3bf04bfccf06416b0c716', 'student', '+201290043018', NULL, 'Secondary', 'First Secondary', 324, 'grp_waled_sun5_wed5_sec1', 'wld_qr_a919eee1226509997adc500458e5b487', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_325', 'زياد رجب سعيد', 'student_325@alwaled.proacademy.edu', 'student_325', 'a49d49a374977dfa6c3f1e91c8565640:c9991984f290712cb3388f1335a1abb61da2cde7147a049e7a37b8dd4390ba536f2c5580c83ecb8e7d90b0e08313c819586b985d37bf25d3c3160b18a7e886bd', 'student', '+201000635737', NULL, 'Preparatory', 'Third Prep', 325, 'grp_waled_sat3_tue3_prep3', 'wld_qr_c787c3e1e04137b2e2bf5b61bc4b11e9', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_326', 'اروي احمد صبري', 'student_326@alwaled.proacademy.edu', 'student_326', '27620ac3b835cd10778fd1047ae56b51:d3cc714e8dc806cf2d1405ddcb956febfd92282ca3c8efd05c38b37dc38827ac6e8f91c8f916f72f00d838b5ed13b45cd3e2950bc1127e3c0cad056f86b7b616', 'student', '+201015124860', NULL, 'Preparatory', 'First Prep', 326, 'grp_waled_sat5_tue5_prep1', 'wld_qr_db36f8f9144faf64b7e48e90f47dfec5', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_327', 'رودينا رضوان', 'student_327@alwaled.proacademy.edu', 'student_327', 'f26b341df8c19224f0be851e8b99d555:3369cba544e4527dc2454ba4e1fe02155728376cd6509b9b5eb07c0b2dc4e48224c5202f7d78d1aa3fef03424535c9ea2c933358e09b3ff89acfdbeca535566e', 'student', '+201007932985', NULL, 'Preparatory', 'First Prep', 327, 'grp_waled_sat5_tue5_prep1', 'wld_qr_9befae6c5e3a3a90a6af990d840d1ac8', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_328', 'اية خميس أنور', 'student_328@alwaled.proacademy.edu', 'student_328', '42ba8e3fadce22ed9d6f60411b867f98:82ab860e470dc5c7c8078d3aa8de8dadef6cc585c28a4c501be07bc62dcd214345df6cf75beda609a47ecca9e5da51d6338b66d806bc98040d47660f63f46b3e', 'student', '+201062626590', NULL, 'Preparatory', 'Second Prep', 328, 'grp_waled_sat6_tue6_prep2', 'wld_qr_9e99ec7911377d8325891f203e137a93', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_329', 'محمد عمرو عبد الشهيد', 'student_329@alwaled.proacademy.edu', 'student_329', '7f2ab8844792bfb54ec959c5aca15e72:f37212413ee0a8b8fbcb757f4eb5d10c342b565450f095d2233aaaf1a31823814afa93a52366d97d38e40ff21bceece726212f53c8ad7fa13983bc9d3a57ef05', 'student', '+201008525516', NULL, 'Preparatory', 'Third Prep', 329, 'grp_waled_sat12_tue12_prep3', 'wld_qr_35b27a9dd1b484be7e85d78031afeb78', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_33', 'احمد حازم', 'student_33@alwaled.proacademy.edu', 'student_33', 'fbb3023aa018b74a6e17750284f42177:58f3052bdea94ec87fee420108ea3d9af7114895c21d83d44f5a3213b698cc236c87c0ca1a2d502908f3055106cf883e71834421ec9bebd943f871f964eb1de0', 'student', '+201210152788', '+201271896633', 'Secondary', 'Third Secondary (Baccalaureate)', 33, 'grp_waled_sun12_wed12_sec3', 'wld_qr_2c0f62ca21b546ed85c659407f803d4c', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_330', 'احمد عطية رضا', 'student_330@alwaled.proacademy.edu', 'student_330', 'f5725591282e47084ef9d6185e622e48:2b80aa4ac75e09c269162e0abdaf86bc14f3c706fbcedd8ef84374dfbf55750d1f1434a413137bfd1fb12408bf49e563b260cb6a29d84593b2f056112e2d20b7', 'student', '+201508144815', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 330, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_be00a63f53d277c38c73fd336a86392b', true, '2026-12-31 23:59:59', '2026-09-06 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_331', 'عمار علي العوني', 'student_331@alwaled.proacademy.edu', 'student_331', '1dc2e46c772b476bd65689314258b3ca:ea4d281fba1fe29a994ce1c530b53a33161d71a3b11f2678e3de62ad37b9eafd00a9283d061d538190c7541c66db1041faeb4018c7f032e247b6a1c43f2b1d91', 'student', '+201093700349', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 331, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_78e5dde87c77aa4e45c4ffda508b77b1', true, '2026-12-31 23:59:59', '2026-11-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_332', 'حنين إبراهيم وافي', 'student_332@alwaled.proacademy.edu', 'student_332', 'c5706bc598cb70cd389574ff27723e74:723f935d8761b1a2b10e50170fa6b63f0ab2429bf0e459bbbe5b3b2d2d63a88b88632b6714ef38ec80509e79920ed9cbc6120b3064d9ede1666a97208c40f057', 'student', '+201112753663', '+201288498961', 'Secondary', 'First Secondary', 332, 'grp_waled_sun2_wed2_sec1', 'wld_qr_588aa9321f0eca796c8c635e2c1fa46d', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_333', 'زينب حسن مرعي', 'student_333@alwaled.proacademy.edu', 'student_333', '673db31ee5a6d440b7ba987843cf0bf6:4951f2fb94a7d7587925143859db9e59b63271779f97e302e6ba8755041b00909c9efebe3c1a62117a5290e9ad05b5368b9c596ac5f2061580d5d3b87323249d', 'student', '+201158101141', NULL, 'Secondary', 'First Secondary', 333, 'grp_waled_sun2_wed2_sec1', 'wld_qr_3514f45acbf551f5255fd935de51978f', true, '2026-12-31 23:59:59', '2026-11-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_334', 'محمد إبراهيم رمضان', 'student_334@alwaled.proacademy.edu', 'student_334', 'a9e2b3b9a76a8970af09d14901b44abc:1ef0454196606021290ff40c2bbb600cc00e54cda0a92158990ac554d7dd404733d78ec0140b80ef374af59076243acef83d65053ef6669a22d3d96da5a9a649', 'student', NULL, NULL, 'Secondary', 'First Secondary', 334, 'grp_waled_sun2_wed2_sec1', 'wld_qr_fbea705a4cea08edfbd902b79104b5c7', true, '2026-12-31 23:59:59', '2026-09-06 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_335', 'إبراهيم وليد الششتاوي', 'student_335@alwaled.proacademy.edu', 'student_335', '6db54a73f14e605b4cade6d04e5f1f29:32bce30110fe30c771670dfb33ddeab2857c571542b021b0bb1fc6eb8516676ed6a21edcc33942919c192d89b3cf8d6e3f91a0a8c26ac6dbcae1add24785d0e2', 'student', '+201559760663', '+201550324146', 'Secondary', 'First Secondary', 335, 'grp_waled_sun2_wed2_sec1', 'wld_qr_bac119b0e40aa3b7f67b789e59e7a71c', true, '2026-12-31 23:59:59', '2026-11-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_336', 'فاطمة محمد وحيد', 'student_336@alwaled.proacademy.edu', 'student_336', 'a796d67907a20c58950215ffc903e8bb:6a154a640a0220cc136a84ab830c8b9c17496a8dab9dc368496230532b4c08a01634ebd61538f21fdb566ed3040314a44a05758b1c91e7b1b9c6f7b527403a32', 'student', NULL, NULL, 'Secondary', 'First Secondary', 336, 'grp_waled_sun5_wed5_sec1', 'wld_qr_4685bfc5484a22887a0c0d3005ce9a47', true, '2026-12-31 23:59:59', '2026-08-05 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_337', 'حسناء عبد السلام عبد الغفار', 'student_337@alwaled.proacademy.edu', 'student_337', '08f61193ecbc85237d473e461a36e04e:668595f714b02e77013df51c9630d47f1e54d12b4380d58f27ca3a0d9c5ebfb2e7ee1edb5f27972acd184377d7e35fecb6c54babb819ef51c49cb21c6e6dfd4f', 'student', '+201099301894', '+201010294879', 'Secondary', 'First Secondary', 337, 'grp_waled_sun5_wed5_sec1', 'wld_qr_61fb08751fa354cfdb4ad8a54a081320', true, '2026-12-31 23:59:59', '2026-08-05 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_338', 'شيماء محمد خليفة', 'student_338@alwaled.proacademy.edu', 'student_338', '5773cf7cf9a3f6d1008d4b951ef11b79:94c5144748528094a275879d6df9781c2191b79ac54504e1a11be78668978d3f6bd99e3c03baeb968e95c2de80e893dadab226714cf2d404b4a83953ab3bb96e', 'student', '+201006234320', NULL, 'Secondary', 'First Secondary', 338, 'grp_waled_sun5_wed5_sec1', 'wld_qr_04035b04c094fe0bd89c1aa04f0c0b21', true, '2026-12-31 23:59:59', '2026-08-05 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_339', 'نور سامح كشك', 'student_339@alwaled.proacademy.edu', 'student_339', '761e05f10658062ea8d950da8597d8cc:bb5b05206bf086ebbf261537a9ecfcef21f7e8d6e7d247e76a7cc36eeb7caf4447851eea3eed2b27ce7dc92451c9e8856604e950a0c1f91d4f7c3fed11398111', 'student', '+201090830310', '+201007703407', 'Secondary', 'First Secondary', 339, 'grp_waled_sun5_wed5_sec1', 'wld_qr_442cfd19f4171d0a5079873f6fd1b441', true, '2026-12-31 23:59:59', '2026-08-05 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_34', 'سيف حازم احمد جاد', 'student_34@alwaled.proacademy.edu', 'student_34', '3df594f5c2f5fd4902bcac8e36bdf3ca:56de6733830c6aaf0b3ec872c3301d21c944aded7a64e5f599fe0f2d0f81b0b12a8cc7d0fa821c159354b54bc8db5058a3a5ca66d865b6698cd1d15eb99b4808', 'student', '+201275395419', '+201271896633', 'Preparatory', 'Second Prep', 34, 'grp_waled_sat2_tue2_prep2', 'wld_qr_d2ba20b327b193ec1d11eae2158c8161', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_340', 'محمد خالد محمد', 'student_340@alwaled.proacademy.edu', 'student_340', 'd2406521b37e64958845d658f62c38f4:662c59f3c3db0aebdc83ce9644b2a00a4389c356329904d7eaafff22921c511f6561d5378677493c5224b5f7afb2fd17c7b58258c3815cec5255c9b5c4631388', 'student', NULL, NULL, 'Secondary', 'First Secondary', 340, 'grp_waled_sun2_wed2_sec1', 'wld_qr_5a86e8cc6ecfd641806c91b5db3f5ce1', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_341', 'هيام الحصاوي', 'student_341@alwaled.proacademy.edu', 'student_341', '53624884f56ffdd4bc58af36e44e44b4:242817139075cffe8821602536231f4c63078ebe0250d92d44bbcf5cfbb6cd780c81f46ef05b3d4ba599fdeb5b5583dfc624960a4188a1a346bcf5905ecd1b81', 'student', '+201280042155', NULL, 'Secondary', 'First Secondary', 341, 'grp_waled_sun5_wed5_sec1', 'wld_qr_ea716fc746db492ec18b218642d34d6d', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_342', 'محمد حسني أبو غانم', 'student_342@alwaled.proacademy.edu', 'student_342', '3d0260582a4db3e4d7ad0ade3b505d07:0cabb407709016e1b6aaf8d41f41f7dd00c5556dc365d09eaf860786fc720bc1728c0657aab2f2f5e45fa583ce58698f1b3b7da80f2412097d1feeef68353a51', 'student', '+201021899451', '+201154593182', 'Secondary', 'First Secondary', 342, 'grp_waled_sun2_wed2_sec1', 'wld_qr_4006759a4868f59f9deffe5582c43502', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_343', 'عبد الحميد أسامة', 'student_343@alwaled.proacademy.edu', 'student_343', '02c8e3c269163fa51411738e80b07a2f:f0b6f6503f1869bc279545fd1fbd442bc792bfb62b17c7348ca79598561e45b0ed5831f19dad8df3afa6282cc2866188dc9600b2a1850c29df4d5e1bcb8b2e65', 'student', '+201018072215', NULL, 'Preparatory', 'Second Prep', 343, 'grp_waled_sat2_tue2_prep2', 'wld_qr_c8a5bde1310ad7ee4314048e94efc120', true, '2026-12-31 23:59:59', '2026-10-17 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_344', 'كريم وليد السيد', 'student_344@alwaled.proacademy.edu', 'student_344', '12b9b3a3feea2bc2dacbec0d5cd76f0a:8fd53115ae2494fed8dca8c70d0f2abeecbbc980026177e88099225012f7eb99f68622ac6c7dc82204c8b6fcfde7a4c8f20fdd89d47edb954af11697a876371b', 'student', '+201552503308', NULL, 'Preparatory', 'Third Prep', 344, 'grp_waled_sat3_tue3_prep3', 'wld_qr_32fe5ff52b0304578879829f42363118', true, '2026-12-31 23:59:59', '2026-11-14 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_345', 'سيف رمضان الجيزاوي', 'student_345@alwaled.proacademy.edu', 'student_345', '9313bde547176b31c3b4f8af66670471:08252908d4ff3b6e5424074c356ef169aaff3fc29c0b66e769fcdad0a0f3d652f1a0a7dc6e165cccd1d0d947a8b7d74f95d2927704f3cc759d5bc2df48d8104a', 'student', '+201205337583', NULL, 'Preparatory', 'Second Prep', 345, 'grp_waled_sat2_tue2_prep2', 'wld_qr_eaeda9d28ca629600984e6e714127be6', true, '2026-12-31 23:59:59', '2026-10-17 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_346', 'محمد إبراهيم عبادة', 'student_346@alwaled.proacademy.edu', 'student_346', '3395bdd0b9bddf1df0b613f48f410f5a:ae7ab18743c50065cea027db91bdda64a44dcd799d2204bda3ae8dbae0a96603e7a4ed0f1906cfbed8de4177cb44cac43dfa30e4e21588ae1bec44a4ef2c3c21', 'student', '+201009889670', NULL, 'Preparatory', 'Second Prep', 346, 'grp_waled_sat6_tue6_prep2', 'wld_qr_a8c85cddf6807ba57e4e295207a0db70', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_347', 'ملك مرزوق عبادة', 'student_347@alwaled.proacademy.edu', 'student_347', '9e7665f399b6b2f920b2357c7d4695f2:94a424a60cb9ee149476e707cccf6dbe4e646ce6c9536a42487e0723ee5fd93498d449585b4c8b8f3caf3b09131c4f0eff6cdef35e8cdc9011da01b7317a76e9', 'student', '+201000438405', NULL, 'Secondary', 'First Secondary', 347, 'grp_waled_sun2_wed2_sec1', 'wld_qr_33da5145e38891ff723cafca95021189', true, '2026-12-31 23:59:59', '2026-11-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_348', 'جنا إبراهيم محمد', 'student_348@alwaled.proacademy.edu', 'student_348', '06c4889b7dab8f27bf895f50f402cbcd:b8be197c04959932e1a69e58e2421b6405156cfc996816a34febeff5a5e8222d7c6daadd8ca9c966a3704bfbdf0ae21996b228d92c327dc99f24319d2c29f3ee', 'student', '+201090549552', NULL, 'Secondary', 'First Secondary', 348, 'grp_waled_sun2_wed2_sec1', 'wld_qr_d025dfbef3a64703a27c8f440cdfa80a', true, '2026-12-31 23:59:59', '2026-10-18 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_349', 'جنى محمود فرحات', 'student_349@alwaled.proacademy.edu', 'student_349', 'a671434a89e629f22ad98804f7cf0d39:079c138f218fc0644483211a469fe51b74004ef9be5e6e461f3d9a6904a920b71a6bd314216a316b5baa27b212879702d8ccbb58163bb78dc72d4771fdab0084', 'student', '+201067098110', NULL, 'Secondary', 'First Secondary', 349, 'grp_waled_sun5_wed5_sec1', 'wld_qr_d9fd0166b3f1af8c852ced1765687f70', true, '2026-12-31 23:59:59', '2026-10-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_35', 'عبد الرحمن احمد التلب', 'student_35@alwaled.proacademy.edu', 'student_35', '072259912bf592c8d0e0c0c7a85da560:744345a2f62cd5562d072e559118388d02356b65e0d4fdee27aceed9caea72d5b5895cb901e418cf5e54d9a9f70c462d18d83e0782ba0fd5f151eacf04f254e5', 'student', '+201277750926', '+201009576930', 'Secondary', 'First Secondary', 35, 'grp_waled_sun5_wed5_sec1', 'wld_qr_19ac22d6688996bcd1be3518e70ede68', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_350', 'سهام مصطفي سالم', 'student_350@alwaled.proacademy.edu', 'student_350', 'f0b393a40771416659b8e7cefcc1ba2f:caf5939aa4e5f8d96cbca2de67e053518869d077e9bf7a48141557126fc43e855e74c8443c44830257202dda1228a1a8d8ea258094a95669cc9d1bb68b44a1fc', 'student', NULL, '+201066201263', 'Secondary', 'First Secondary', 350, 'grp_waled_sun5_wed5_sec1', 'wld_qr_a2e150b3983854fee04fb5858846a95f', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_351', 'ملك هاني متولي', 'student_351@alwaled.proacademy.edu', 'student_351', 'aa408f3777f5c60a99ebab9d1abb83dd:a6d41d2cdb24552dbed22b6ca96c3008b74ef3573897f5bbaf43f96a9b4b79bd1439b904e07619caace6f78314822c8aaf75548ed7520e107e3a9b5d86886334', 'student', '+201032138839', '+201092411786', 'Secondary', 'Third Secondary (Baccalaureate)', 351, 'grp_waled_sun6_wed6_sec3', 'wld_qr_998cd88bfc8517ce03fadc49ba381cd1', true, '2026-12-31 23:59:59', '2026-10-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_352', 'حبيبة حافظ محمد', 'student_352@alwaled.proacademy.edu', 'student_352', '1ca3384c1c3db83aed6537a14da467f0:72a424d93a4181a1adbe3d494b9985d3cafd708970cb0db328cbca62bde18e3ab3b93d59395f66e3560c834b962a1867e58bffac06e227adfe971237b1543c4e', 'student', '+201143317145', '+201140738637', 'Secondary', 'Third Secondary (Baccalaureate)', 352, 'grp_waled_sun6_wed6_sec3', 'wld_qr_7cd79cb3766c938dd7d80d8e00abd579', true, '2026-12-31 23:59:59', '2026-10-14 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_353', 'بسمة اغا', 'student_353@alwaled.proacademy.edu', 'student_353', '386459b52081c986c201a5d6860e934d:ab167cf5e26b253cf299e527cea887037b8c6cebc88205394b9d945303d71ce73c4e79cb6de9fe1f8bf3c0a1c079acffe9d9cc5d9ac2d681b19d800e76b7d876', 'student', '+201287821842', '+201140783972', 'Secondary', 'Third Secondary (Baccalaureate)', 353, 'grp_waled_sun6_wed6_sec3', 'wld_qr_912d27920811148fb4d998f6eb71b8c1', true, '2026-12-31 23:59:59', '2026-08-09 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_354', 'السيد رضا', 'student_354@alwaled.proacademy.edu', 'student_354', '28e00b56b40565fbc4676439713df54f:9e6dabfff641ca8ff7bcf6270b7b856f2c90ce06ac485636f9e34ef2d8412d71b523d560d7735e8b31b20050faafd53bf56fd3d8a16eeebef9160532888e9e79', 'student', '+201024362479', NULL, 'Secondary', 'Third Secondary (Baccalaureate)', 354, 'grp_waled_sun6_wed6_sec3', 'wld_qr_58291942da747b5614456aab26e5c13d', true, '2026-12-31 23:59:59', '2026-09-09 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_355', 'احمد محمد فتحي', 'student_355@alwaled.proacademy.edu', 'student_355', '7f8d7d105064c21824157c944920be75:c492ac6520961304ff57d5bce5ddc919a62df820474e5ca1a6877f8d112db0a9e4c4204cbbb517d9d6cc156377fbe4184043ee6b87549a27c3fdb8c070bcaaa0', 'student', '+201066765411', '+201012330015', 'Preparatory', 'First Prep', 355, 'grp_waled_mon3_thu3_prep1', 'wld_qr_bcbfe41f6d4f04777067ad32f083e4a5', true, '2026-12-31 23:59:59', '2026-08-10 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_356', 'إبراهيم احمد عباس', 'student_356@alwaled.proacademy.edu', 'student_356', '19d402d131f66585d3c9b56c7e5e81d6:42ca12e1ab7619a0b5019e70ce9bb1943f4983d27b8934ae9a4ab11815d000a2500809a0dd898a5cae009eb1f5c467c8d85c10a1d6966fd7c5c1145f48c750a2', 'student', '+201276247682', NULL, 'Preparatory', 'First Prep', 356, 'grp_waled_sat5_tue5_prep1', 'wld_qr_265a34f3b278ab47fd8b60dd03669dbe', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_357', 'تقي عوض عبد الباسط', 'student_357@alwaled.proacademy.edu', 'student_357', '8ca424d9dd96d0451454f452de1eea45:39b020b7aa7e2597af25336b75dd7ff843aeea8f753513737e56ffe5f67460c5f9cd5ee8f7a8ce8bd0d353b84a9ef9e9df97c5530c4ac9600b95960efa3fcd29', 'student', '+201024194410', NULL, 'Secondary', 'First Secondary', 357, 'grp_waled_sun2_wed2_sec1', 'wld_qr_a9afe793caaa0e8b896293c6f1405ac4', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_358', 'مصطفي محمود محمد النجار', 'student_358@alwaled.proacademy.edu', 'student_358', '9e1dc9663ac4f4f9cd05628d2be2bc2e:2276146bc1293cb8b2acca64388d3c491744bb6e9978407594500f34aa72d2f531b46a5179c1b656f7119ea7b70fb7e9a70578c7e8ea6906f974dcb00710bde5', 'student', '+201008429584', NULL, 'Secondary', 'First Secondary', 358, 'grp_waled_sun2_wed2_sec1', 'wld_qr_fd91a9330ae46b1ac8103b5aeb7d6de2', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_359', 'فاطمة حسن', 'student_359@alwaled.proacademy.edu', 'student_359', 'f2c5b8a6de4cbe9e3cce5e3a7ff108e3:7f551a3a2fa2d6a3f13093a6c9fedcc5c6496c95f789933ecbf51c268b873630f74a9e838a3e488dde04525e073f80a9d063b5bd43167a37ad074f979d3814c6', 'student', '+201006486366', NULL, 'Secondary', 'First Secondary', 359, 'grp_waled_sun2_wed2_sec1', 'wld_qr_f59daa8d4b5b2365f1826776ec497589', true, '2026-12-31 23:59:59', '2026-10-14 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_36', 'رودينا محمد حسن', 'student_36@alwaled.proacademy.edu', 'student_36', 'afd4b7f24708c108a61193548977c7f5:58dc379e3d0ea7ecd3b721fa97d594dd50026f5fd3c5efb99416168b16b340844ff4532e8a64dab6c59d7bb547fb9ec71b813f9a757382f84881a81a71d08ee2', 'student', '+201019651180', '+201019651180', 'Preparatory', 'First Prep', 36, 'grp_waled_mon3_thu3_prep1', 'wld_qr_d9410867ffbf8a2ac92dc2e40719cc27', true, '2026-12-31 23:59:59', '2026-10-26 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_360', 'ملك إسماعيل عيسي', 'student_360@alwaled.proacademy.edu', 'student_360', '2ca694cd3e93778e3dea3f908390f8f6:dc14f0288891bfec68623c58dae5cdcabb49e334f4e13f696404fa3f7f2e2394c82f6e7183a20bbf99872642399b0498c934272a1a50fdf994b4e68e1d75838d', 'student', '+201027786300', NULL, 'Secondary', 'First Secondary', 360, 'grp_waled_sun5_wed5_sec1', 'wld_qr_6c8d72f6ad449d1400d9ffe8e50ca961', true, '2026-12-31 23:59:59', '2026-08-16 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_361', 'محمد عوض عبد الباسط', 'student_361@alwaled.proacademy.edu', 'student_361', '799ff060495aed02b9f88217beff72f9:92565930e425c0202804fa6a37e37a75a91828b1d598d4fa4ddf558ae4dcc4f2a3ca584eb9da5912d95be192f6d5738a7732f7335d2a86152ee9f6223ac4061b', 'student', '+201067109689', '+201096099305', 'Secondary', 'Second Secondary (Baccalaureate)', 361, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_b64e44d358e8f1a4e03e5759f5ea95f6', true, '2026-12-31 23:59:59', '2026-10-21 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_362', 'محمد حافظ', 'student_362@alwaled.proacademy.edu', 'student_362', 'c37b1696006801813fb9bfadf604403f:3f36029def62776d96fb3fccb9d26e3cd63c50940804c4fc6a6a90159921445c717b7a589013c98b55b1a6b1c60d31ba8d72291ba3c90a21fa0410c930ada505', 'student', '+201004351340', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 362, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_852c97a80d1b6c4fb635926f7d1630ed', true, '2026-12-31 23:59:59', '2026-08-17 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_363', 'احمد عبد الرحمن ايمن', 'student_363@alwaled.proacademy.edu', 'student_363', '7acfcea7c05fb4897f44e275a4ade4ab:6b393a54fcc0e2eb5d02977c9834d5254f11ef5595b58a547553f15ae806707c9ee5371b6607cee3fee8473742dc7c31da910cabd75f2c968e10e04ff8961c6f', 'student', NULL, NULL, 'Preparatory', 'First Prep', 363, 'grp_waled_mon3_thu3_prep1', 'wld_qr_592d84c37d6d8a3c463263e79f8d3bd8', true, '2026-12-31 23:59:59', '2026-08-17 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_364', 'مالك احمد فايز', 'student_364@alwaled.proacademy.edu', 'student_364', '5f9a998e5a2d1bc45ef13571898c0e8c:351343f33266425c4ea12ff8a6f06835e383f8049465f88f0236ec22a23e967638c1bb9ee9c117bf183f4f76f2dee991dd7681996b7dda004d29e9d7d962194f', 'student', NULL, NULL, 'Preparatory', 'First Prep', 364, 'grp_waled_mon3_thu3_prep1', 'wld_qr_d528e316369ffa153ce0e65abd773f95', true, '2026-12-31 23:59:59', '2026-08-17 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_365', 'زياد إبراهيم', 'student_365@alwaled.proacademy.edu', 'student_365', 'cf3008e9be09ed3324cd926b9215e393:6b31517afbe25e2502b900dfaca596b5e81670e9fd2b22a6bda5631011a647267b6991915222d1adf9bf33fb354b608b0f87c6ce9e00b5f23042244ac02d0624', 'student', '+201067456737', '+201090085116', 'Preparatory', 'Third Prep', 365, 'grp_waled_sat12_tue12_prep3', 'wld_qr_4ae27bad72110f83f4891deecf18bdbc', true, '2026-12-31 23:59:59', '2026-08-18 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_366', 'عمر القصاص', 'student_366@alwaled.proacademy.edu', 'student_366', '4c8735d64f418a9eef3549b6d794e2af:7c1f62d1c8de3bd5ee7a190f1118452247ea70c61ab4a359821ba51c50690db6b29b32b213eaaf0c999dff186cc7d0943ab12c79b6eefbff144680fe56a1c350', 'student', NULL, NULL, 'Preparatory', 'Second Prep', 366, 'grp_waled_sat2_tue2_prep2', 'wld_qr_11dfc867a2dd304d3e4764c9346cc1d4', true, '2026-12-31 23:59:59', '2026-10-20 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_367', 'ياسر عادل', 'student_367@alwaled.proacademy.edu', 'student_367', 'e6a27816c2c61138969bc0aa16e27981:4a001a8663d438472930ad3f633177382d433d993936d4c09d11e3b978f8dc2e0f634203d99306a2c00a845cd4f809e297bb80a9818321f0db18788608d3ecb8', 'student', '+201092711770', '+201091601347', 'Preparatory', 'Third Prep', 367, 'grp_waled_sat3_tue3_prep3', 'wld_qr_48903a6be2111d4923d4c0ebf49ee3f9', true, '2026-12-31 23:59:59', '2026-09-22 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_368', 'إيهاب سعيد', 'student_368@alwaled.proacademy.edu', 'student_368', '97980634a98a8de310389f299f78e26e:233999ae997a115011b67d345598c0f52e259525539affd0f37d8210cb09e238df84a0162b0a9b130e13b8c195e5763590dca6183df9ed47ea218d75d81faa77', 'student', '+201068583370', '+201026816130', 'Preparatory', 'Second Prep', 368, 'grp_waled_sat6_tue6_prep2', 'wld_qr_924087b8ba8577b58141ea5d7607bfd2', true, '2026-12-31 23:59:59', '2026-08-18 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_369', 'نجلاء عبد الهادي', 'student_369@alwaled.proacademy.edu', 'student_369', 'fea7ce1c914e9a3db477b92a659dceb2:655df777a4a7f52efbc3fe54ab591c2ebe2b69407017bfdd396149e2368251b59073f9e2e1541747cbe6e72f115505b3ca611eeacece76f4aca187c2d33a1b4b', 'student', '+201285550394', NULL, 'Secondary', 'First Secondary', 369, 'grp_waled_sun5_wed5_sec1', 'wld_qr_5e552e75f9567651c2542ddc104c69cf', true, '2026-12-31 23:59:59', '2026-10-21 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_37', 'ادم محمد حسن', 'student_37@alwaled.proacademy.edu', 'student_37', 'e27764c589dffd5e522b1081e61f75c2:93d9dc09eabf2b4276bc21e9efefd2d93caeb9d325b8e2134ee0f3c52d342e18dfb3be795d2fe32e241e365c4570480c90b13beea036d170da8cbc1741a2890f', 'student', '+201019651180', '+201019651180', 'Preparatory', 'Third Prep', 37, 'grp_waled_sat3_tue3_prep3', 'wld_qr_f25124a1d62cec2a8a03df264a37a32b', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_370', 'ياسين خالد حماد', 'student_370@alwaled.proacademy.edu', 'student_370', 'f48afcf4b4c8113564bde02d5e6a7706:3ad826f33aabc7671af246fa28683f0e0b7bbf298fed1b4a92301551db03b2b19d8a2dc001ce676dc2f27a5f2262daa2a5e2f82146a6902e8b11e6d0117dd57c', 'student', '+201022999629', NULL, 'Secondary', 'First Secondary', 370, 'grp_waled_sun5_wed5_sec1', 'wld_qr_73a3946a0acaa3b38a78139b8e506bbd', true, '2026-12-31 23:59:59', '2026-08-19 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_371', 'بجاد محمد', 'student_371@alwaled.proacademy.edu', 'student_371', '19a758f4aa5f5c260b988c2f3a9fd15d:43fb4af2f01edb3918c02caad4108b1d12d7e5d43a9620f1983b20379c97d9209f4b8c8dce4699b99e3f088617f3c38c21235670e6020ecc39d0e33e00a06b1b', 'student', '+201143654379', NULL, 'Secondary', 'First Secondary', 371, 'grp_waled_sun5_wed5_sec1', 'wld_qr_2d85cd8df868e35ee0a6cbaa79ce386a', true, '2026-12-31 23:59:59', '2026-10-21 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_372', 'احمد هاني ماهر', 'student_372@alwaled.proacademy.edu', 'student_372', '11fdee07bfb938c5460664c3e4d5e7e5:dbf61fa2f8d8fed25320f2b2a17d336fd50aca87a625b18af269b4111c64819d4ba46a807bfdd2ba7d21ce0b6107ed35f00029f167ef4a8c1f3872db9418e207', 'student', '+201002591767', NULL, 'Secondary', 'First Secondary', 372, 'grp_waled_sun5_wed5_sec1', 'wld_qr_f0ca96df7b7962c96a3d19b6906e5c2c', true, '2026-12-31 23:59:59', '2026-09-20 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_373', 'يوسف احمد حصان', 'student_373@alwaled.proacademy.edu', 'student_373', '4e764a9ce46aee9c64268b45f981056f:dd56b8d6bcba02868bad60fa46c14f3f1be3e96c16173bd0c85b1d040f289706794258fc1789529bd24ba10c07c06e794a0e5a91d3619727ca8254db4c6a35ed', 'student', '+201101188186', NULL, 'Preparatory', 'Second Prep', 373, 'grp_waled_sat6_tue6_prep2', 'wld_qr_b6ab6c16434443903e73b486408d66f9', true, '2026-12-31 23:59:59', '2026-08-20 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_374', 'مصطفي علي أبو المكارم', 'student_374@alwaled.proacademy.edu', 'student_374', '639a0d6f556009521f59ece49429b451:1e19d76f997852a68affc371cb6c84c5472c70a83acac88741b22366aa91d6a63e4a95ee8b176d2cb9c910ebb3f2a248e0b8dd2358bb6f1d5155b9ebf37de493', 'student', '+201117103113', NULL, 'Preparatory', 'Second Prep', 374, 'grp_waled_sat2_tue2_prep2', 'wld_qr_eb7b47afaf4df28f9d2b83e7bd1db49c', true, '2026-12-31 23:59:59', '2026-11-10 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_375', 'سعيد واءل عبد الحميد', 'student_375@alwaled.proacademy.edu', 'student_375', '16ecf9258fbbfed3290d270cf6d331ea:e38153b70c2b8cb43fb4f4e66f7c8aac3178c6dc14f3a3e7990fc6fbb02dd569847307cb56f0a281f6b3f9a34c712adc7dd969e2106ce84604396d5fa580cb94', 'student', NULL, NULL, 'Preparatory', 'Third Prep', 375, 'grp_waled_sat3_tue3_prep3', 'wld_qr_0eac43e15e392339239d4438aa0e88bf', true, '2026-12-31 23:59:59', '2026-08-22 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_376', 'نور محمد شعبان', 'student_376@alwaled.proacademy.edu', 'student_376', '7be5fe7bcfa413a74ae4545c8081707a:27a38c18e694d69fb76024da3472de55a2c7f8ed86aa0c1867744f799907bcd0e0632d983367ecfd81866e78592fb481b30abaaadcf00f6a28a53d84ed3f4592', 'student', '+201222736980', NULL, 'Preparatory', 'Third Prep', 376, 'grp_waled_sat3_tue3_prep3', 'wld_qr_5c1b9c4bcca2f518fcce82435afd73a9', true, '2026-12-31 23:59:59', '2026-10-20 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_377', 'هايدي دياب', 'student_377@alwaled.proacademy.edu', 'student_377', '98e59d73dbf60c1abf97e4292b05b03d:dae83be8709a07dac58c59557ac64f9ac79dfe1b5bb9e59b667e49582e051dc646d6a5be2546908f53b322dc7cd2ac052ac4656cf9728576f82b1841b8713e09', 'student', '+201559457372', '+201008197027', 'Secondary', 'Second Secondary (Baccalaureate)', 377, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_675cd00b0d349a39b21104dfc09431fa', true, '2026-12-31 23:59:59', '2026-08-26 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_378', 'نيرفانا محمد', 'student_378@alwaled.proacademy.edu', 'student_378', '37e3d376dc98e01750e691fb6f98d587:60d33edb3e01868410886bc64e02a455d4a303e2d8396f69ab8873105032ff7f6397a05655e879cc0ed88b74d3d6b7fda0ee9baed3391148dff324cc97a96556', 'student', '+201095446718', '+201200923572', 'Secondary', 'Second Secondary (Baccalaureate)', 378, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_eb5c73aa9898514abb66c53b76f0070a', true, '2026-12-31 23:59:59', '2026-08-26 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_379', 'معتز محمد عيد', 'student_379@alwaled.proacademy.edu', 'student_379', '0887b9a32f8795aa76c33907705f3eae:c9758b936f0826e93782d292ac4ecf486b72400f0382cd3eb26d2962b8ae00dd23f5f1b99f8f4a5d68d6247eea9ab70d33ef5b793e705556741041682f3c3027', 'student', '+201210849938', NULL, 'Secondary', 'First Secondary', 379, 'grp_waled_sun5_wed5_sec1', 'wld_qr_e764f2406483a5d6ec83c9cdbd63a686', true, '2026-12-31 23:59:59', '2026-09-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_38', 'فريدة إبراهيم', 'student_38@alwaled.proacademy.edu', 'student_38', 'dc64336f1afb357f82f3ddd8a670569b:a1e79aac145d5ad8f66dfbfbad12a6da82d5cc72a745cb6cafb9346e4210c8f99aef388822b351fd6173850f6b2f218fc509a409d1386f83c1eacdefaa9af401', 'student', '+201001803359', NULL, 'Preparatory', 'First Prep', 38, 'grp_waled_mon3_thu3_prep1', 'wld_qr_c04c0d3e4a3b64e99badca58a99e1663', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_381', 'سما عصام مفرح', 'student_381@alwaled.proacademy.edu', 'student_381', '0b52f1f4f1a16122df8426246a56b1f6:830bf88388fd7bfc9a1a6d7467746b8e318f543683ed267e231f886206a5fffa2941b973ec126819d06e9ed8991950edc6cbca1024cb6c58401aa66b1fa8cf47', 'student', '+201020519241', '+201201701284', 'Secondary', 'Second Secondary (Baccalaureate)', 381, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_a38d433c35e10e46b94f9a87c4b27ebb', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_382', 'عبد الرحمن اشرف', 'student_382@alwaled.proacademy.edu', 'student_382', '90b3a78fa5d9fa432c0902c95b4def80:417c2f7f9858c2ac0ce48594fda84e46c3ef79d0dbe325663a48ef95fd361e74d2a7753cad1da351940dd0a26d29bc1922602b9aaa8873d8d8483a9157449294', 'student', '+201278956774', '+201010212360', 'Secondary', 'Second Secondary (Baccalaureate)', 382, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_3ae06e8932b37c8da9c18dcb9491a099', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_383', 'احمد نبيل', 'student_383@alwaled.proacademy.edu', 'student_383', '633f85a3277eb3c55de7fe72005955db:81f84f2842539e269b14482dde010bf20c635821667d8697d036560e0dacd338151a7a7090d1c69d7d8f3fbbb55e5f3b8cf4e4981036f60aa31a389c018ce17e', 'student', NULL, NULL, 'Preparatory', 'Second Prep', 383, 'grp_waled_sat2_tue2_prep2', 'wld_qr_1743af4453808619215e6e4a3f494285', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_384', 'عبد الله هشام', 'student_384@alwaled.proacademy.edu', 'student_384', '75498bf562e82fcec403f870f521dfc5:b40c9a705d250efad19434341255ec4e20c0fd924e0465db2be674370d03e1f49566cace6ff1a2ce7d2b4e05477ddf477196da54b25734015e58d2f5de0775e6', 'student', '+201065634004', NULL, 'Secondary', 'First Secondary', 384, 'grp_waled_sun2_wed2_sec1', 'wld_qr_05ca17c68c93e9d3e0c17ff10820afac', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_385', 'محمد محمود مجدي', 'student_385@alwaled.proacademy.edu', 'student_385', 'dc955dd2a7957ba5ad7332e84c3e38a3:c176535e165cbcd016975602c99c459c825f2e31ba6dc90bf671c360669f0ebfef884ccbc66db1a87f3238c86471917db30b7aba2ddb6389b1a3e0d188b7c59b', 'student', '+201092297218', NULL, 'Secondary', 'First Secondary', 385, 'grp_waled_sun5_wed5_sec1', 'wld_qr_f9f32a1f17eea3944959c5ab98cadc33', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_386', 'رغد خميس', 'student_386@alwaled.proacademy.edu', 'student_386', '9be42ca46360d6d321636b86e755a2e5:2fada2b84e9c532e8e96878314fc35405d7f90c96c477fc62c2336e4faf110231432a1e771015d011dc6594afeb419570a3a7de72eacc99477362e9c9adacbf2', 'student', '+201042926808', NULL, 'Preparatory', 'Second Prep', 386, 'grp_waled_sat6_tue6_prep2', 'wld_qr_dbc47c2636c956b285324d4b4f688788', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_387', 'يوسف اشرف جمال', 'student_387@alwaled.proacademy.edu', 'student_387', 'd920d34c7962faa2d804100877b8398b:090dd51b7a10296f74ee835b05b8a212e486e8e7b7c7b27884a05d69e0e6e9167dc49e72700e5f7aa276560374ddfbe8038a9cd2d879e54a4c792e1ab70981d5', 'student', '+201288160800', '+201200583795', 'Secondary', 'First Secondary', 387, 'grp_waled_sun2_wed2_sec1', 'wld_qr_d6f9704f09d9aa709ab0da2d80dacf2f', true, '2026-12-31 23:59:59', '2026-09-06 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_388', 'زياد شريف رمضان', 'student_388@alwaled.proacademy.edu', 'student_388', 'd63e895697466061e287998f9811500c:882dd6840338282b410f809578081f6ac275d0a614fda5f603d3d16e1e98694ca84f633d427f45ed6aea2a7859bd7810b67470556cc49a5a9dc4a413f219b2ae', 'student', '+201015731556', '+201007782306', 'Secondary', 'First Secondary', 388, 'grp_waled_sun2_wed2_sec1', 'wld_qr_542f07b978446e502c8b71c7ee698dfb', true, '2026-12-31 23:59:59', '2026-09-06 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_389', 'ريحانة احمد', 'student_389@alwaled.proacademy.edu', 'student_389', '17de866b83816e547729a536fee6b1bd:982e752cc186c2061d438f38e881cacbfb2d87dda462743511f3d8b96a03992da1b0069babdf74e2065e10c6bf670b9edee51223e7ef91113316f7472506a31e', 'student', '+201271507896', NULL, 'Secondary', 'Third Secondary (Baccalaureate)', 389, 'grp_waled_sun6_wed6_sec3', 'wld_qr_2706dc9d4ba1bbca48337d427411874b', true, '2026-12-31 23:59:59', '2026-09-06 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_39', 'ياسين هاني عبد الفتاح', 'student_39@alwaled.proacademy.edu', 'student_39', '00b2cf46e9947bdb9b619f7022de8225:82fe31424c64c79f83b7f4fcd62c8d179f7bd21665e134dd93731129c56be62935d468ab3f7ed53cb82ead644ce1d5d4f6d95ee8c7a45d5c0dcb8b09d3851f6e', 'student', '+201220946955', '+201200507606', 'Preparatory', 'Third Prep', 39, 'grp_waled_sat3_tue3_prep3', 'wld_qr_4aaa6b058e705d43de568834b225ac2a', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_390', 'رزان محمد', 'student_390@alwaled.proacademy.edu', 'student_390', '20c1e1cfd60bb96009fae959798cfd33:f4414709f5f8b8182b76cc949e3a1ba288c1db52543fcd80de02c3b67555f6779baff3f337301528686e4f1347d91f4ca29ba3d50554497fbff14f785ca8f642', 'student', '+201099098112', NULL, 'Secondary', 'Third Secondary (Baccalaureate)', 390, 'grp_waled_sun12_wed12_sec3', 'wld_qr_863fc504f365e0b74fcec7fb86bbc777', true, '2026-12-31 23:59:59', '2026-10-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_391', 'هاجر جمال', 'student_391@alwaled.proacademy.edu', 'student_391', 'a496479010cee4af5dd0e4de6bfa04d5:ba6e2f13871039d5a26102a61c20d22cbbe474e017e00279cb4315eb77818278d02deffee2dba993fca6efc279bb7f5da26776fcc536d413c651a680d95bfa68', 'student', '+201227114478', NULL, 'Secondary', 'First Secondary', 391, 'grp_waled_sun2_wed2_sec1', 'wld_qr_0bdcf9a08cff13a92fd2bff5e612b834', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_392', 'يوسف احمد مصطفي', 'student_392@alwaled.proacademy.edu', 'student_392', 'd26de86c98e429112590eb858b7de96a:3d5b702172d56eb28bc7d089f69c2f69fdc0a5748a062ace67270d83fd1e3d4ab0f6c42e96ef76ce305cccf666573888a275713c056d7d1ae0efd045a57ba38c', 'student', '+201010225437', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 392, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_c2813f050e99d354085dcdfdc0d09d9b', true, '2026-12-31 23:59:59', '2026-10-20 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_393', 'اروي جمال', 'student_393@alwaled.proacademy.edu', 'student_393', '3b21f5767fe80aaca9224ecb6206221e:c83ae6e16b382e9ac8aebed9ad72e3ae84f534e84f270eceab84226bbcab26d25ad028d6b5e3848994dbcfcf8ff029c68d9f867253852249758ab147c51b6705', 'student', '+201225086522', NULL, 'Secondary', 'First Secondary', 393, 'grp_waled_sun2_wed2_sec1', 'wld_qr_a5c7eee548896a1c4c31111176e4d9af', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_395', 'سلمي أسامة رضوان', 'student_395@alwaled.proacademy.edu', 'student_395', 'ad1a472b617a6921938917d22876af91:17e6c12c10c72902dfa71fe4109f7573294dc1ea2ab389f696cb278c8ccf7560f2ac8ce9e75377482dc4746df482e88c1ff9e571682f66e9809fc74e839d51b4', 'student', '+201044350213', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 395, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_70a44cbdb21d16a3ab1a84983bbc56e7', true, '2026-12-31 23:59:59', '2026-10-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_396', 'دنيا باسم نور', 'student_396@alwaled.proacademy.edu', 'student_396', '4e30fc2669091f9435b15299d5de5cfc:5b402dd1e7b919b47a5c2661a632e3859b77c00a72265d095404c9763adeafa4f18500513856cbb6ccc421bc45ac3d9ecf719454e5d67456a3990473e9d94f85', 'student', '+201210297393', NULL, 'Secondary', 'Second Secondary (Baccalaureate)', 396, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_874ae11900832c97b8b2114621a4c155', true, '2026-12-31 23:59:59', '2026-10-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_397', 'ميرنا مصطفي', 'student_397@alwaled.proacademy.edu', 'student_397', 'ea7ed40c9fa7b7d025ce01a90c584dea:2cece9670e15839ef98bdbfa8b4e0a5daa4cdc011a0f3909d7926d8601f44bf2ddf8d5de364f73387c0fbfc6e89b472fe38168f704ab5b27f62352dbd0013d26', 'student', '+201090797076', NULL, 'Preparatory', 'First Prep', 397, 'grp_waled_mon3_thu3_prep1', 'wld_qr_27f2142f62af7be4937f64ac8731d290', true, '2026-12-31 23:59:59', '2026-10-12 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_398', 'اياد الخنيزي', 'student_398@alwaled.proacademy.edu', 'student_398', '4b504c77d29c3e5a42cd9a4390df5816:096267548e2cb05c3205857d6c570bcc47a8eaa1892fb1486baca61d9ac9687ad09064fe4168b0225eb1df2c59310898e2c5e24ab60269b679dd12017ea7ad36', 'student', '+201043869509', '+201554854982', 'Secondary', 'First Secondary', 398, 'grp_waled_sun2_wed2_sec1', 'wld_qr_47e7a98f62813345dae67f9250b8cb05', true, '2026-12-31 23:59:59', '2026-11-15 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_399', 'سندس كريم احمد', 'student_399@alwaled.proacademy.edu', 'student_399', 'efe8865d19112abd046c30fbffe2ff35:866c0cf3acb3d5d1de2d4b43b8eb86ca55111b288ee63582773e3b8baf860cb3ac910bf57a4bd0694014d1377427fde52141247d8f4c63c7706d6ed5453f95d2', 'student', '+201004799924', '+201091872439', 'Secondary', 'First Secondary', 399, 'grp_waled_sun5_wed5_sec1', 'wld_qr_dac3206a87fa6752a2ab7600bff69619', true, '2026-12-31 23:59:59', '2026-11-15 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_4', 'سارة إبراهيم محمود', 'student_4@alwaled.proacademy.edu', 'student_4', 'dc4d366d5d94d409ef4223c3d2234c15:26fc667a0ddb70a6eaeb84637f8e3cdbf4ea2b72a9e6bb364b1ba428dcfd32351c6828c2d5d82f3c02be84f31f9c40208d5d39f74fd6d503f4c3252796248acd', 'student', '+201001803359', '+201273712973', 'Preparatory', 'Third Prep', 4, 'grp_waled_sat3_tue3_prep3', 'wld_qr_a9582a2eefb13bc46d21e37642976b2a', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_40', 'يارا هاني عبد الفتاح', 'student_40@alwaled.proacademy.edu', 'student_40', 'ca275bb08c92fbc8f622fc1f527a63a2:8bdb46ccfe46761d89d1a43ee75cb11ff4e0d5df6e4ffbeb6f10a86defa72bf1217c9ef0a9a2397f9d4bc04ee9d8072af985d84d0fc3a5c927f53e47ad723917', 'student', '+201220946955', '+201200507606', 'Preparatory', 'Third Prep', 40, 'grp_waled_sat3_tue3_prep3', 'wld_qr_9810482c11a7eed88b989039ab6ea6f8', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_400', 'ريماس عزت ريحان', 'student_400@alwaled.proacademy.edu', 'student_400', 'e31687d7dca5e9376280911a5cf83875:49715b1d37e4fb2457ceaf3bf4be364c757dc7db8ff7fb9ea011325f84232ffb33ca38db82b00236c8453f5dc1b9a7ef2b54c5f59f02cc820d1ae12cfbfaafdf', 'student', '+201001161462', '+201064626382', 'Preparatory', 'Third Prep', 400, 'grp_waled_sat3_tue3_prep3', 'wld_qr_5df66cdaba8ecd3a4d24090265c28754', true, '2026-12-31 23:59:59', '2026-10-24 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_401', 'ليل علاء بكر', 'student_401@alwaled.proacademy.edu', 'student_401', '494af19ec958c1ce08800a404e5bb7b9:584493aecc0eb6fbf584a050afaf2d5780d7e0c1a3f9b35f9346a92a235f6248f91b03cea4323f2181a17dd0e7beb122910f7d4709167959940e7533af5d5cb7', 'student', '+201024766563', NULL, 'Secondary', 'Second Secondary', 401, 'grp_waled_sun3_wed3_sec2', 'wld_qr_9005eea92850123e39980e3c3bf50c4c', true, '2026-12-31 23:59:59', '2026-10-26 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_41', 'حسام حسن مرعي', 'student_41@alwaled.proacademy.edu', 'student_41', 'f22d9e09707a45210da50bb5de6066e3:0546bbdd7859d6e7659273aafe5179cb21e7972a4c2e95330786a080df68f58c1066c31449e9a3c58c2e1a456b5307285867e914ba6e9b1c4b633f24deaab40e', 'student', '+201118046926', '+201000711076', 'Preparatory', 'Second Prep', 41, 'grp_waled_sat2_tue2_prep2', 'wld_qr_fdd5f6a771ff505d8e7fec43f5400de9', true, '2026-12-31 23:59:59', '2026-11-10 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_42', 'سميرة احمد الجوهري', 'student_42@alwaled.proacademy.edu', 'student_42', '61fd755136c495351b1375a6bc8a48ff:b2c69a4d5dcf2db706abfdae44a892496b0bc27b5cef672f1bdd4f90ced79f9c5c4c94b3f22d7ad19892aa1b6dbf49538ead7912ed303221c6ab13d63e3237f1', 'student', '+201283801646', '+201015554366', 'Preparatory', 'First Prep', 42, 'grp_waled_mon3_thu3_prep1', 'wld_qr_29c0dcf0b4a95831169933e25cfa038b', true, '2026-12-31 23:59:59', '2026-10-26 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_43', 'محمد حسين عبد النعيم', 'student_43@alwaled.proacademy.edu', 'student_43', 'f94df0241780f9452603152f167eb992:813b7e8731601a26e570745326c7b04f5effd322335f66dcf5bda3c748b973dfe5b79d6bcd7ebe3991c587d140f1d06e6872d151af05af842cdae434b7bcabce', 'student', '+201003187496', '+201003187496', 'Preparatory', 'First Prep', 43, 'grp_waled_mon3_thu3_prep1', 'wld_qr_82db4e0b4ab9ceede2cd210b80cb42b5', true, '2026-12-31 23:59:59', '2026-11-02 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_44', 'البراء محمد محمود إبراهيم', 'student_44@alwaled.proacademy.edu', 'student_44', 'a8af5a54d435ee16cd3cb03005823ede:48b17f47905eda444f8a059d4dafdd53c404af981bd2ee21590d7afd321036d1e53fb4a9a102915f78e9b8fff60f0b17dd41ecb1c0a9bba589cb23b1a9e88c4a', 'student', '+201068423001', '+201020157890', 'Preparatory', 'Third Prep', 44, 'grp_waled_sat12_tue12_prep3', 'wld_qr_63211038e86a36b4ef57a19e91777609', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_45', 'ادم احمد انصاري', 'student_45@alwaled.proacademy.edu', 'student_45', '65a1ece5010ede6234606d7cca7ca7a6:b3499d80cf942e71101631c5db08a405749b9a62e45c5713b85f2972f2994195f456e0c4c69b42b75630e849aa726d21da402bfce4e90b93d1a9c06d508fe900', 'student', '+201099117285', '+201099117285', 'Preparatory', 'Third Prep', 45, 'grp_waled_sat12_tue12_prep3', 'wld_qr_91b23f613cd2bb3035eaf07f0fa7d691', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_46', 'مروان محمد الششتاوي', 'student_46@alwaled.proacademy.edu', 'student_46', '4e0a5ae22cca73eaa3dcf781ef69cfd8:65c5b25b58d70191273e3bd7e2aed4e8259267dfc53f269754c1e8894af2d088365203e387ce23d0a89988530f4600463bda79f333968d1347f0cda761ef9b69', 'student', '+201142443799', '+201554205116', 'Preparatory', 'First Prep', 46, 'grp_waled_mon3_thu3_prep1', 'wld_qr_97fc3bc2931cdd23084aa29052f639dc', true, '2026-12-31 23:59:59', '2026-11-02 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_47', 'دانا احمد الششتاوي', 'student_47@alwaled.proacademy.edu', 'student_47', 'c783e1835c929c3332902b442e4780e6:93a4aa1364f6313289a8a148c3fcc49f5ef002441e3091775145f2735ebc9e45ada0850788fae81deca9f0e7a5432f01beb0c9f0dbdd8a1579a6bfdd7d24eb39', 'student', '+201550683937', '+201550683937', 'Preparatory', 'First Prep', 47, 'grp_waled_mon3_thu3_prep1', 'wld_qr_d065dcedcf36f897a409528df33ccf94', true, '2026-12-31 23:59:59', '2026-10-12 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_48', 'ادهم احمد الششتاوي', 'student_48@alwaled.proacademy.edu', 'student_48', 'cbd59289149c774efa5bdb399b3110d0:c3d815ddeb3b53431036404cc5b26d44f47a111efcb9f3a7150b74d87bd3f70df0f91b75b7b5cf69667fbb3f95c8c257819011c62813d02df75c24f008cf1e0b', 'student', '+201550683937', '+201550683937', 'Preparatory', 'Third Prep', 48, 'grp_waled_sat3_tue3_prep3', 'wld_qr_0c624b479743d1f6b5255dd95dd9baee', true, '2026-12-31 23:59:59', '2026-10-24 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_49', 'احمد خليفة', 'student_49@alwaled.proacademy.edu', 'student_49', '305c5cd155fe247c76668c9a65e719ac:63a96cc5960751c3325e023fb2c11b7caea6c4210c3a6991e677cfc72b19384f68be6c42ed170c0b64c1525b4a9c31508460f6fc56890dbca3f8c37c2471f3fb', 'student', '+201556441824', '+201552223872', 'Secondary', 'Third Secondary (Baccalaureate)', 49, 'grp_waled_sun12_wed12_sec3', 'wld_qr_9432e80bbf65a245c01bf15a3a85ebfd', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_5', 'جودي وائل محمد عباس', 'student_5@alwaled.proacademy.edu', 'student_5', '81d2472686aa0a63a248c4ec3a6300c3:6fe4c22d5c0eead8624f3be1b5bf56e81bd102a042d7c1dddec085095dad45cf205837f164d31dc42bc7027de94f69b49f43f7430a1135de30b588bc724eaf39', 'student', '+201154819713', '+201044011138', 'Preparatory', 'Second Prep', 5, 'grp_waled_sat6_tue6_prep2', 'wld_qr_d4f13dbcb9c2386e5dbdfc7fdf6ead5b', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_50', 'محمد النعناعي', 'student_50@alwaled.proacademy.edu', 'student_50', 'c473bc01089f1ad0c128c98185ea70d9:5d2bb2b1a358cef439d7c07980e67aa51f6c9b2029696202d9a532147b6dbcdb54b692c2c0118e3fce2275c21d68605219113ba434341eadae51455474dbcbb9', 'student', '+201281781310', '+201004857344', 'Secondary', 'Third Secondary (Baccalaureate)', 50, 'grp_waled_sun12_wed12_sec3', 'wld_qr_ae5ce6bf6232fe31d92a995669011009', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_51', 'رضوي رضا مصباح', 'student_51@alwaled.proacademy.edu', 'student_51', 'eaddc0eba7e319fd9f4c51c70ac00e10:ecf3f9dc822a3f92cefc8fc1a8e0f0e1da7578ac53fc5cd536533d40ad88d6be8310b095ffb5bab7108305f7543a7b432d61b8f764c271c206e0cb5c64788edb', 'student', '+201096410711', '+201003223992', 'Secondary', 'Second Secondary (Baccalaureate)', 51, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_0876fee973a3998fba6ec37ad5c7793d', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_52', 'مريم إبراهيم متولي', 'student_52@alwaled.proacademy.edu', 'student_52', '383210613d5a8a0458726c91c2c879d8:dc0edb9817c9138b65cd3cef6e8d4431042495221e83aca5f85cde35e6624be7595f2075cea9d04ec5444053596cd3931621213b692274741c9ebf6cbba21989', 'student', '+201208898804', '+201013613687', 'Secondary', 'Second Secondary (Baccalaureate)', 52, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_977a374a31fe4bc24be30277bd85b808', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_53', 'يوسف إبراهيم متولي', 'student_53@alwaled.proacademy.edu', 'student_53', '8535f969788bed86264d97722c67202a:c3d04e04e46d7759590d6364c5767c592434c9890b5d413b6be11936f7b42def57754a9eab33a46bb10dabe1b882e4c7f7b64c596feca3ff347388f0f3de686e', 'student', '+201063459997', '+201013613687', 'Preparatory', 'Third Prep', 53, 'grp_waled_sat12_tue12_prep3', 'wld_qr_69d11dbfae8cc35a04d0a0e7d2ad8a91', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_54', 'حلا حبيب الرحمن أبو رواش', 'student_54@alwaled.proacademy.edu', 'student_54', '3e3467e8ae5c7c010d9d6663420a00db:49a44b42f18b82872f71dc2c2550684f478b848fc5a8ae11bb981d8e2e9e87de209a3a929b9ffd35a1f5df5a62051e66e84a1dd62c21510f91e42598b59b8968', 'student', '+201551095948', '+201006468384', 'Preparatory', 'First Prep', 54, 'grp_waled_mon3_thu3_prep1', 'wld_qr_22bddeb875d25b8b3b40969a03a6c268', true, '2026-12-31 23:59:59', '2026-11-11 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_55', 'إبراهيم الحصاوي', 'student_55@alwaled.proacademy.edu', 'student_55', 'a0dc66743f24378dbacfc91e507fd4e8:d9db6feca65ec5697c9d2aaab26af430fd756547fce1c279e40376dc694e7af0fdc84edfa5a07e322441c394bb3baa50ae98ca86e61aa86e78cb36486c72f5d2', 'student', '+201226493397', '+201067926307', 'Secondary', 'Third Secondary (Baccalaureate)', 55, 'grp_waled_sun12_wed12_sec3', 'wld_qr_d68d8ac9d55a79c4e52cae26b431850d', true, '2026-12-31 23:59:59', '2026-09-02 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_56', 'كريمة محمد السيد', 'student_56@alwaled.proacademy.edu', 'student_56', '4baa20745f1c4ee40cfc3c77439a0c2f:b54b1e1eecb79690d6f6f0e201f05939799c1647ea11444d151120d926caf3d9868c5451a0ea590a771a25b41b175dcdb37002212abdf1215f4e99fee0a184ac', 'student', NULL, NULL, 'Preparatory', 'First Prep', 56, 'grp_waled_sat5_tue5_prep1', 'wld_qr_51f48466dfe9087e8325e0cd6d91ac70', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_57', 'هناء حبيب الرحمن', 'student_57@alwaled.proacademy.edu', 'student_57', '660ad915683926b38bc726502808db48:f84adafbe1456055a425941977778b51b2c63696918f87f60cff2fa3f9814f63917159e29654d71ecbd38395258ab07b7a9a22572160562fe46d11b7182788cc', 'student', '+201551198355', '+201006468384', 'Secondary', 'Second Secondary (Baccalaureate)', 57, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_80ee5658080be3d3e7c003246702fcc1', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_58', 'جودي علام حمدي', 'student_58@alwaled.proacademy.edu', 'student_58', '4b989a22897ac7d404cea5dc22d3633a:218c0dae65f74516c52d1e583db1006e787852f1835c461e3febf7c55604b020de21cb5d0b6b2ebe8911a04e591e09e62233a68d9b085c88dc17e38d6054a737', 'student', '+201023292725', '+201090352218', 'Secondary', 'First Secondary', 58, 'grp_waled_sun2_wed2_sec1', 'wld_qr_710a257ffdbf466d197845e0a36228a5', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_59', 'ايتن جابر الخياط', 'student_59@alwaled.proacademy.edu', 'student_59', '42ab7385a3aab2747381a6cd67607412:ffa47336c85f3ababc789ba9a0a42ecadd69645637739ed345977d4f05b31ee9677c88675b995dfd08046f0dfeb2fd2224befcbca7085a8c39477729a0ea13f3', 'student', '+201028312539', '+201028312539', 'Preparatory', 'Third Prep', 59, 'grp_waled_sat12_tue12_prep3', 'wld_qr_87bed8f900e3bc3f3bc40c9ff487df65', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_6', 'يوسف احمد عبد البديع', 'student_6@alwaled.proacademy.edu', 'student_6', '1d3f6518afb1711ca77235fb57489870:a240439e1b47b96554310a67a85d055c0a40c55fece4fe31dd05fceff5e3691451773632cd059be0473f826af819eb5687f0469f83f5b3719fdbc9c2f20e0e6b', 'student', '+201067070463', '+201007759443', 'Preparatory', 'Second Prep', 6, 'grp_waled_sat2_tue2_prep2', 'wld_qr_e5937fb8eaf56f2d91fa368c92bf1b2c', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_60', 'عدي عبد الوهاب محمد', 'student_60@alwaled.proacademy.edu', 'student_60', '490d95d1ba2bf5dd1d36ec5236958eb9:babb7a37fff22469dd732a6fa54740d3c8587b3ea60497f2aa07a100294b38e2567700afe553d9ff76064da7489df9b9aa66edba857b0c962f907ae2513b58dc', 'student', '+201069813748', '+201022119827', 'Secondary', 'Third Secondary (Baccalaureate)', 60, 'grp_waled_sun12_wed12_sec3', 'wld_qr_bdc4a3eeece4138d8ef72c1940885764', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_61', 'عبد الله خالد سعيد', 'student_61@alwaled.proacademy.edu', 'student_61', '8a50bc6f24b272059c833efa8777c836:b5648214858d6acd8720ac3d82f5d622e4fe5b2fd6b2af63edfdd3973f5ae01efe858e41f2a1ac9b686a410df8b75b4f3660031409aae25a62df76e9d65303c6', 'student', '+201121516652', '+201507786166', 'Secondary', 'First Secondary', 61, 'grp_waled_sun2_wed2_sec1', 'wld_qr_fbb928bc058240497860bdc6683619c8', true, '2026-12-31 23:59:59', '2026-10-25 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_62', 'عمار محمد سند', 'student_62@alwaled.proacademy.edu', 'student_62', 'f2af2739d50de15ed114a94ba4a68cdd:a8868bae1ea420f817c8632289220f6392c8bcf54f11921ae4f2e1e51cece7437fa5e56b440e73e967b8f332b8e82ff4629aa3c43c28c37afb53313e20c0f2c8', 'student', '+201096988531', NULL, 'Secondary', 'First Secondary', 62, 'grp_waled_sun2_wed2_sec1', 'wld_qr_f2eb3cdaa9ee80f4713205c1f7460304', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_63', 'جنا محمد النوساني', 'student_63@alwaled.proacademy.edu', 'student_63', 'bf48938512921a2e62680b986e02c699:1b0d5f9944805009a11d5b1e17d49d969d0036679e6c7eb4320b13d4e204085174468f7a486071cd7879e5b442e0cfac9008e991ed4ce8c8437135f8164eccab', 'student', '+201122082071', '+201119476410', 'Secondary', 'First Secondary', 63, 'grp_waled_sun5_wed5_sec1', 'wld_qr_0f51837891f30cc99a38cebe3b08c7dd', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_64', 'جني محمد عبد المقصود', 'student_64@alwaled.proacademy.edu', 'student_64', '881e0db55c06e697ec7e5d66ad450cc4:0eba04204c99f426e7ff152c390811863a5bd26893c8c81ebfc4591aa07a241bdb503fb1eb19ca1e479998d2ee31c3ff0dc041e9f5347d9fa58b463f1b81f0fa', 'student', NULL, NULL, 'Secondary', 'First Secondary', 64, 'grp_waled_sun5_wed5_sec1', 'wld_qr_542e5c3a94c4cc93bca849f60adaf307', true, '2026-12-31 23:59:59', '2026-10-13 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_65', 'رمضان الدسوقي', 'student_65@alwaled.proacademy.edu', 'student_65', '8d4d8dd792132b0c8ead3cb3257db366:c04a5cc076b371d23b77ca06ad3ef6bfa1f714c4fc4a9c36cce4f781751cca87b3d2313123eceb9db3454765ece653d513366b76e6c91e7391ab4d44c0149047', 'student', '+201556396387', '+201288764124', 'Secondary', 'Second Secondary (Baccalaureate)', 65, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_a2583588e6f169e3aa3bc3d83cde1fd7', true, '2026-12-31 23:59:59', '2026-09-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_66', 'مريم احمد عرايس', 'student_66@alwaled.proacademy.edu', 'student_66', '5da4381bfa5286e2f24f03eb5a8fac53:9624cda9b7a43478f9f5ae2ee619f1e38c1dbcbf5a36a2132aa3b106a102e300928506020e4a27bd82fdeebefb223be78ac6b3ca145d8e3ad03d0f6e9a3614af', 'student', '+201281467433', '+201281470494', 'Preparatory', 'Second Prep', 66, 'grp_waled_sat6_tue6_prep2', 'wld_qr_6e7cc3ec21ad28ba6f2d5ed29b77a8f3', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_67', 'معاذ خميس مرسي', 'student_67@alwaled.proacademy.edu', 'student_67', '25f65b1d8146f8638f0aef2e43d553aa:d8d42900df06476f54d5005841176cdb6aea12ebae77c183253ae010c0968a203f30d7e2de3ee51836513f6573ae9eda1b45fce7a02659345336ec01ceb47790', 'student', '+201208381507', '+201025043134', 'Preparatory', 'Third Prep', 67, 'grp_waled_sat12_tue12_prep3', 'wld_qr_3506c9b18b30ad1e9fec12c72a19174b', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_68', 'حنين محمد صبحي', 'student_68@alwaled.proacademy.edu', 'student_68', 'a8781fd8b5a72f7be0e73b0ce7325b8c:79a95d86c52d5059cc92c699648c370d0a5a5193f12d6217ac41c0df430c48caa3b0d8ab9fad046ecf8d1e2d67622fd786b01de07612b3ec723b287d4f2c4130', 'student', '+201223957431', '+201223957431', 'Secondary', 'Second Secondary (Baccalaureate)', 68, 'grp_waled_sun1_wed1_sec2b', 'wld_qr_b930f21f0e978d69169bcfa1699fad97', true, '2026-12-31 23:59:59', '2026-11-10 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_69', 'ياسين طارق صالح', 'student_69@alwaled.proacademy.edu', 'student_69', 'a560bd15cf1cfe082653539b881c6bc5:0a7e108914345cdc247b39fc1030d0fb19c1698a103203b42c66dfa41f1b6392c0a070791d22416a8255d85d4df28efaf85143ae6970dab4903d79c2eba21c81', 'student', '+201003769751', '+201094227661', 'Secondary', 'First Secondary', 69, 'grp_waled_sun5_wed5_sec1', 'wld_qr_17cdd051ddb3bd3a3a7842c465577119', true, '2026-12-31 23:59:59', '2026-11-15 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_7', 'عبد الله مصطفي صلاح', 'student_7@alwaled.proacademy.edu', 'student_7', '6eaf3a81854243f7e1383959e2c1b9d0:0a08fdfb93e1ffb41fef2b0f13e72c8025019b902806dc7a7b0e700672ed5d8288ea71169933acf78c212ee35dab08fdfb965e44dc00f26814e3db3157f92727', 'student', '+201039517314', '+201061956589', 'Preparatory', 'First Prep', 7, 'grp_waled_mon3_thu3_prep1', 'wld_qr_ad7f1b7dd0a04a2da9eb614579ca2263', true, '2026-12-31 23:59:59', '2026-09-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_70', 'احمد إبراهيم احمد', 'student_70@alwaled.proacademy.edu', 'student_70', 'f735cb3c39af32a7d397e4b812fe0b3a:63c95e657b8271974fe2f157e616968e2d1009a60b67658179f11af2ef996d6527dfd08a9121faa08b238368a6a94f43fec57d3c6201b898e359aabd3c9b89c8', 'student', '+201039312455', '+201039312455', 'Preparatory', 'Third Prep', 70, 'grp_waled_sat3_tue3_prep3', 'wld_qr_9b95eeff00a8f96e3b084d1295413187', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_71', 'حسن محمد حسن', 'student_71@alwaled.proacademy.edu', 'student_71', '1baab95d20516bbf141639b796f957ad:f0bc577d846d469db03de64b6257ddb662da5f296c068bf0c12f4ebb50ad0baf4d37689b90e3dacee3514e147b61ff55ef8c9923519370a3cdb846e266bf1879', 'student', '+201094276259', '+201011531938', 'Secondary', 'First Secondary', 71, 'grp_waled_sun2_wed2_sec1', 'wld_qr_29f960de863000ac044ff5733b313a40', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_72', 'جني محمد حسن', 'student_72@alwaled.proacademy.edu', 'student_72', '53f1a7e5b2e2e4a3522c54e9ba62fb2f:f2e7176fea1e56dd06a1d10c03748e54de8cd0717abf7c22e35ad560c315156f2b7ffd17f9eaf385596958774fb3abe44ba32ba513b046c8e53aaacdd6a31ffb', 'student', '+201094276259', '+201011531938', 'Preparatory', 'First Prep', 72, 'grp_waled_mon3_thu3_prep1', 'wld_qr_a7498db9c13fdf4bdc7c0193edc76c09', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_73', 'الاء عبد الجواد الديب', 'student_73@alwaled.proacademy.edu', 'student_73', '0a4e6343b834833e032f75775b83a0e9:4764c477f817ee63cb4d7cee263ce981776fe54cb9484d7b19d15517725ae2a85c96d150a4fcd4588b1e7003cd3fffac1ba66e3170da1e032a6a9d7f9d72b820', 'student', '+201024532658', '+201024532658', 'Secondary', 'Third Secondary (Baccalaureate)', 73, 'grp_waled_sun12_wed12_sec3', 'wld_qr_0e6922539b84f71e97e169226e38911c', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_74', 'انس عبد الجواد الديب', 'student_74@alwaled.proacademy.edu', 'student_74', '8fed33b9da5f7e3bef0d30c8775c6dcf:8ef316e63580f4bc022926ce4d7dcca0a719d48d1f990c21be5da0a731ed6572e0b7540edb579260755d81eaeb0c272e4c10406868a167e49bd0177da32559e2', 'student', '+201024532658', '+201024532658', 'Secondary', 'First Secondary', 74, 'grp_waled_sun2_wed2_sec1', 'wld_qr_3d97de8e745b32d246c66de20f37ea60', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_75', 'محمد عبد الجواد الديب', 'student_75@alwaled.proacademy.edu', 'student_75', '450e6196aa586049656a89abe0876bd7:a134bb68b2d47757ae1647a8a07ca810036fe0e9e17f7760485929b53734e482d7a274f05375c5ae505c217613e0fb0780b87e1a616db53b58f0fbb9a2851805', 'student', '+201024532658', '+201024532658', 'Preparatory', 'Second Prep', 75, 'grp_waled_sat2_tue2_prep2', 'wld_qr_7b5c98018f4780549956c9d1ae62e300', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_76', 'عبد الرحمن سامي', 'student_76@alwaled.proacademy.edu', 'student_76', '4cd35dccb3b420b011888e8df642619c:22f69b058981d86178ff11e43fb05a75aaae9d160df63f49865cfe79252502267c4855775f0686140c38a8f19b3219281d9ba7ad3b408cea0b81f4c384919c44', 'student', NULL, NULL, 'Secondary', 'First Secondary', 76, 'grp_waled_sun2_wed2_sec1', 'wld_qr_fdc45789b970c06b87827df912601209', true, '2026-12-31 23:59:59', '2026-11-07 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_77', 'منة محمد البابا', 'student_77@alwaled.proacademy.edu', 'student_77', 'c1b777dbdcc42c523e280748c3cba613:1fa29f313a9d46e72d04b0eac7ae95e6639096d4a631c5139ef40ea522e4594d45ce6bd3476159556acf31a4008a0c9fd11073aea81f1801bc395e63fa0a1d13', 'student', '+201015041019', '+201003307368', 'Secondary', 'Third Secondary (Baccalaureate)', 77, 'grp_waled_sun12_wed12_sec3', 'wld_qr_417a10e8afa536029b09ff7eca529d2d', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_78', 'مريم محمد حامد', 'student_78@alwaled.proacademy.edu', 'student_78', '6ed5809c7ff01dc55e3e115af4b883ed:dba05a7bdcc4e1aafefa424a507f0d8dc6df0fd46663dc31fb8d7be7891c578919f761f98d0c19db65f443ee3cc19a6e5b775de75e914045031cfa3a487d97f0', 'student', '+201273064612', '+201091464225', 'Secondary', 'Third Secondary (Baccalaureate)', 78, 'grp_waled_sun12_wed12_sec3', 'wld_qr_82bb3fbeca34383f67f4f2819a33d113', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_79', 'مرام محمد حامد', 'student_79@alwaled.proacademy.edu', 'student_79', 'd20e120ad01e9ea4924935f907f685a6:02cde654be50b0c06bee6e03cb8ec3f4912e3dcb097e81163ec1da72c8f1d1c0db2819f0bc9ead8c7c808eb7a76520ba564c08436bc86b5d70e1cef937cbedf1', 'student', '+201273064612', '+201091464225', 'Secondary', 'Third Secondary (Baccalaureate)', 79, 'grp_waled_sun12_wed12_sec3', 'wld_qr_8292731bec0377939adc8dcc009b991c', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_8', 'كريم محمد البسيوني', 'student_8@alwaled.proacademy.edu', 'student_8', '1351ce403f61ef8c3324bee80f86a5d8:18753e46f24786edb86e144a524977a41d136606b6a2d295d5e7e6dff4e01492b39316e7b345501ea4d97a0198da2d09c1d05009742b03b603b7b7d88efc712e', 'student', '+201555083541', '+201271426553', 'Secondary', 'Third Secondary (Baccalaureate)', 8, 'grp_waled_sun12_wed12_sec3', 'wld_qr_11887c4bf3b34fd3b01a27f932a26cae', true, '2026-12-31 23:59:59', '2026-10-28 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_80', 'عبد الرحمن محمد الحصاوي', 'student_80@alwaled.proacademy.edu', 'student_80', '7d7327cf5638f7eb35a4038e22587955:d13278e89668fbbca0c11bab676f4f01a68f1f992a3eb7f6778c1424c978d19ad6f8d185f3b547308f626c80acf2c33c35237d33496e2aa58cd87f64afdd004c', 'student', '+201060626550', '+201060626550', 'Preparatory', 'Second Prep', 80, 'grp_waled_sat2_tue2_prep2', 'wld_qr_8907d5b27ea5928edc87fdaf6c5283ab', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_81', 'مي نصر عبد المنعم مصطفي', 'student_81@alwaled.proacademy.edu', 'student_81', '78bdc22486b0767a86439a6d4f2cae63:dbac2871a06a9f417d852c85d25d31098e97dd9a18add4309e94925eb29c36fdb1d61fc946dc7328598d6ea2c546f6cae22340da638a40eabeeb3052fa6c9811', 'student', '+201012066072', '+201007885339', 'Secondary', 'First Secondary', 81, 'grp_waled_sun2_wed2_sec1', 'wld_qr_be04b6fb7afa3a2dfc8258bc8d4862a2', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_82', 'سلمي رمضان احمد', 'student_82@alwaled.proacademy.edu', 'student_82', '1364c16c7ca8aed033c38c5779f302dd:fcc2406f28178a2852656c71844072f8828420428cb70b958e7e95ef4b957bf1b1fec86a7bddb74910f1e696fa257c2a1f5426dcdd940563b79d87c6033cb35d', 'student', '+201552287850', '+201063526101', 'Secondary', 'Second Secondary', 82, 'grp_waled_sun3_wed3_sec2', 'wld_qr_e6d1309c6da6fca2c7a13c617034cff6', true, '2026-12-31 23:59:59', '2026-11-04 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_83', 'سعيد احمد سعيد', 'student_83@alwaled.proacademy.edu', 'student_83', '633b90a8e7f343a72354f64ba67964a7:402b3706514f75d02752bc6b43da9471de2ea3d63c1a7b519d61dadba4b26325c63766392214d28faafd16961203007754afafd1f31901d5c2b19e4d188c0f44', 'student', NULL, '+201068979014', 'Preparatory', 'Second Prep', 83, 'grp_waled_sat2_tue2_prep2', 'wld_qr_fda35517e878b6f1a501bd58062d41b8', true, '2026-12-31 23:59:59', '2026-11-10 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_84', 'فاطمة احمد سعيد', 'student_84@alwaled.proacademy.edu', 'student_84', '9cb28d8dc10c86cec8759cf9edeae046:cc1bddd3427f1693e116eb207da383c714169b22062902e69d771370771f76d763b2912f74117f85f7ad1a966e6ecf65527d866a439d59b434c2d624ef0914ca', 'student', NULL, '+201068979014', 'Preparatory', 'First Prep', 84, 'grp_waled_mon3_thu3_prep1', 'wld_qr_732ec0fa1487c108835c8bef423d8ee1', true, '2026-12-31 23:59:59', '2026-10-08 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_85', 'مي حسن جابر', 'student_85@alwaled.proacademy.edu', 'student_85', 'b5707e2e95d3a2cdd9afaef76cf490b5:40948e8e52f45fd42cd9043271180d07f341fed9a70484e75d5fe3dc14702dd34370365b68a5db440c1b3e42fa89453ea348f7d0adea70e0b74d9e3ca9cbc7a8', 'student', '+201092842234', '+201092842234', 'Preparatory', 'Third Prep', 85, 'grp_waled_sat12_tue12_prep3', 'wld_qr_0d1893ae70308aa2a1160bbdf47e72fd', true, '2026-12-31 23:59:59', '2026-11-10 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_86', 'يارا حسن جابر', 'student_86@alwaled.proacademy.edu', 'student_86', '34fed9f27672fa0c9ed6c2c3623914a9:c34b1f33101705436823d3712f04207459440588dc823ef49bc315ee703f0915590111d1e0f884924b825605c483d86bab8c88a7d77de87caae8882ca798894f', 'student', '+201092842234', '+201092842234', 'Secondary', 'Third Secondary (Baccalaureate)', 86, 'grp_waled_sun12_wed12_sec3', 'wld_qr_9ec9d4a97cefd81de948c7252405672d', true, '2026-12-31 23:59:59', '2026-10-18 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_87', 'فرحة علي عطية', 'student_87@alwaled.proacademy.edu', 'student_87', '4357636bd7550faa53229148e9496fb1:ed041107e1ff9bb1ad81f831352b30c0c42f69da2f8c06f5ba409cb4e77066680997f875f731d6bf0ef5d94ee23b095c004e8c83e3383d4cace4be3fe52a08d2', 'student', '+201094132228', NULL, 'Secondary', 'First Secondary', 87, 'grp_waled_sun2_wed2_sec1', 'wld_qr_2bad98d525f48ab3a42c404d794f2116', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_88', 'محمد عبد الله سلام', 'student_88@alwaled.proacademy.edu', 'student_88', 'bad317007e851996b3623e9b645e143f:c0b54cdb605103383be32c0ded28289f5dfe3162c777e1058a02713ff9599d811b467e3f0fb928d03f4a46fd40f6bd8ae46c7e2a537df70e99cefebeded97f7a', 'student', '+201550520302', '+201119486779', 'Secondary', 'Third Secondary (Baccalaureate)', 88, 'grp_waled_sun12_wed12_sec3', 'wld_qr_b0a5ea1ca85eee990c4d0636c6c60106', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_89', 'يوسف محمد حسين', 'student_89@alwaled.proacademy.edu', 'student_89', '4443d7ddf4c68181e98214a8a846325b:b2bd780a3f955048b9fb0666f744f6e8b590bddbe868848fa69d335db48bd65c1a9b85ddf9bdb15735ff211abea10e9a7d146d8cf50a89d4c0b0cdc3cfcd9094', 'student', '+201003078984', NULL, 'Preparatory', 'Third Prep', 89, 'grp_waled_sat12_tue12_prep3', 'wld_qr_1e90e13cd386b000c3df0c00e50b76b9', true, '2026-12-31 23:59:59', '2026-10-27 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_9', 'محمد مصطفي صلاح', 'student_9@alwaled.proacademy.edu', 'student_9', '4c60558b8b04b41d6eb7b05840844ce2:5b1d3466a65178bc0d238e496350e9b9f65783113683f31df0f695f4bd11caab9ceeb3a98853f8d82ca0a37f32cc221b46f654fc4c25ce217106f4459a1e0e3e', 'student', '+201097797586', '+201061956589', 'Preparatory', 'Third Prep', 9, 'grp_waled_sat3_tue3_prep3', 'wld_qr_c269182e52287f3b34c8797c10536b7f', true, '2026-12-31 23:59:59', '2026-08-29 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_90', 'يوسف نادر محمد غنيم', 'student_90@alwaled.proacademy.edu', 'student_90', '0bac7634c43cb8919da2b68d556e41fc:732e0ed2865b2bc555f9697e73dcb80b5ff612ec0f6a788df8e7ee7f1046ae436776d0229255bc024b77f91d4b424270c955ad7b237c3fcdfca393388ebe102e', 'student', '+201014130062', '+201014130062', 'Preparatory', 'First Prep', 90, 'grp_waled_mon3_thu3_prep1', 'wld_qr_eea1273363ea647faae73ac2766a9183', true, '2026-12-31 23:59:59', '2026-11-03 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_91', 'جني محمد خليل', 'student_91@alwaled.proacademy.edu', 'student_91', '1e89b9f96d63825071c00fbe1692d347:07ebd7f80877aa35f1b056ff393d9c6a1b650b312895f3158d1351c8bea573ffb5ae22db0c162856301ab4043842441663ff9a085a9c6cc33162323609cabb82', 'student', '+201017735726', '+201017735726', 'Secondary', 'Second Secondary (Baccalaureate)', 91, 'grp_waled_mon12_thu12_sec2b', 'wld_qr_39d93f98752fd67121b0f8490a608480', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_92', 'هنا احمد علي جميل', 'student_92@alwaled.proacademy.edu', 'student_92', 'a174f5d14b8befe9eeef4137ea652c7a:8aabc0f101799642e6e2f4fe5f7ffa777a6a13b6847b7a30cbb913187aa60c1aa877d7d19e25d845a244acf7fd2f9a45d44c073be0c21aab3cb8f293029e235d', 'student', '+201505797658', '+201080156923', 'Secondary', 'First Secondary', 92, 'grp_waled_sun2_wed2_sec1', 'wld_qr_d99ff8306c5f9af00f50cc6d7ee96152', true, '2026-12-31 23:59:59', '2026-09-06 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_93', 'سيلين مصطفي القيعي', 'student_93@alwaled.proacademy.edu', 'student_93', 'bd49295b205335f33377e84fc6d0c72f:15b9bb68373f585235e679e06492d63817136b69aadb072421fe3e8a618f57693df9e83c002142745051c439cef2739a98d91abc50761c9fcdc203c27372f14e', 'student', '+201503296255', '+201221521685', 'Preparatory', 'Second Prep', 93, 'grp_waled_sat6_tue6_prep2', 'wld_qr_e46b57d15fe6a750fd0de7a36eead7de', true, '2026-12-31 23:59:59', '2026-09-14 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_94', 'مروة محمد فوزي', 'student_94@alwaled.proacademy.edu', 'student_94', '84997086ab558789aaebf31d27f72ff4:699f1a26f442d35611b4768c591207271d06dcd21828ff01ab87e95dd596e20c4f226df80a99b7b3f9103cea70ce32ae11e90958585d7d300d25aedcd03e8200', 'student', '+201110004619', '+201110005614', 'Secondary', 'First Secondary', 94, 'grp_waled_sun5_wed5_sec1', 'wld_qr_e95a2962633f34f17978b8757efd9eec', true, '2026-12-31 23:59:59', '2026-08-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_95', 'عبد الله محمد داوود', 'student_95@alwaled.proacademy.edu', 'student_95', '604d8410543552f26a93dfa9255a3ee8:8ab1e2fb66ee1a76a51b061cb039a91dfb4117e07557148cc308c8a7d55720726d1311ccce8c63f3efaefbb6a7f59ea65a372adfd63ccf444d99b3db3b1406af', 'student', '+201002123930', '+201070313498', 'Preparatory', 'First Prep', 95, 'grp_waled_sat5_tue5_prep1', 'wld_qr_db0d2415e6b5df9c96f3b10ca0c7b474', true, '2026-12-31 23:59:59', '2026-11-12 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_96', 'روضة و ليد عفيفي جاد', 'student_96@alwaled.proacademy.edu', 'student_96', '032116ef79e047a01c80dd0e42efdf2f:d0d6ab27aa2f395b06720571a60657c1a78091b8af6fb07ac7b21c4e71a2706e5fdc752736dada14ccbb2c752342e045cb798fde0c8be150920059df06d6428c', 'student', '+201067335121', '+201210878193', 'Secondary', 'Second Secondary', 96, 'grp_waled_sun3_wed3_sec2', 'wld_qr_b59dab631df01e103a262ada0c5201a1', true, '2026-12-31 23:59:59', '2026-10-14 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_97', 'حازم محمد فؤاد', 'student_97@alwaled.proacademy.edu', 'student_97', 'c18a6dde7fc65c552d5f986f91b82f5f:4de5e18865ca67d80a94ad2e4436f6a7ca03c4c9c513d4f1c7124b59beefa28db7f4f617e261479d191fa235c2026338b5d73cae224e61ffe66836d8d0a8177c', 'student', '+201289291047', '+201029445311', 'Secondary', 'Third Secondary (Baccalaureate)', 97, 'grp_waled_sun12_wed12_sec3', 'wld_qr_d96ff2f73c781539a71f9389d8f99a51', true, '2026-12-31 23:59:59', '2026-11-01 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_98', 'يحي حسين تهامي', 'student_98@alwaled.proacademy.edu', 'student_98', 'd8e2fa15fa49dd125e3707ce6a10dce6:e13162157e33f27fdb0b1906249f6e99065fa133dea91aa90cf25b9a47640f0b7fe345469ec9940b4e7c29b0f123dc4eb751fad130184d0b05bfbea0283d75f5', 'student', '+201552312166', '+201097788735', 'Secondary', 'Third Secondary (Baccalaureate)', 98, 'grp_waled_sun12_wed12_sec3', 'wld_qr_dcad428a080e916d73af973044b821ad', true, '2026-12-31 23:59:59', '2026-10-25 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;
INSERT INTO users (id, name, email, username, password, role, phone, parent_phone, stage, grade, student_code, group_id, qr_code, must_change_password, pin_expires_at, created_at)
VALUES ('usr_waled_99', 'وليد عباس محمد عباس', 'student_99@alwaled.proacademy.edu', 'student_99', 'ded8d15254d8defbc1bcdd6203e7b5fb:cc1ff3d231e05705b6d38c636b43edbefb0e14371b11a47950d88ebb335095ca85b522dd591dc94083e59cf3e39848229285d0d1dc5bf93c4756a50c18f04062', 'student', '+201098474393', '+201098474393', 'Preparatory', 'Second Prep', 99, 'grp_waled_sat2_tue2_prep2', 'wld_qr_22ebf1ede1fd9027940930317bce584d', true, '2026-12-31 23:59:59', '2026-10-31 00:00:00')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, parent_phone = EXCLUDED.parent_phone, group_id = EXCLUDED.group_id, qr_code = EXCLUDED.qr_code;

-- Step 4: Insert Parent User Accounts
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_1', 'ولي أمر مريم سعيد خميس', 'parent_1@alwaled.proacademy.edu', 'parent_201012488023', '45ff3de3a4fd7a3b838ac4e502f78000:3468058011273ff1dbc265d3ed98a323ef7af728b4290b4809a549235a7d73d901aa405253886657b0793059af0827201881f50ad7f4bbed7500ec7ea20566cc', 'parent', '+201012488023', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_2', 'ولي أمر لوجين السيد احمد', 'parent_2@alwaled.proacademy.edu', 'parent_201033702044', 'f60dbb398d6922296977b7b79f1f8a17:782c2daefef8c014c6479ef17682b4e2bacaa635a071fca7e4314330dabdbf027b53e531b5cbd3cb7db564077863c93587bf7cb8cfec4ffe7760eca7525f6bf8', 'parent', '+201033702044', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_3', 'ولي أمر جني شريف حسن', 'parent_3@alwaled.proacademy.edu', 'parent_201019013632', '816e5fa52f834aa5d806de42c77bd582:ba67fca688fdd62201df8583a850d3cb15fb98171ebbc7c33ea237f6dafdfba870e463dd47075d3a2c7ea4d8930f6654fd880c2689c29eb7a2eaaef5a5aab0d6', 'parent', '+201019013632', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_4', 'ولي أمر منة عطية', 'parent_4@alwaled.proacademy.edu', 'parent_201011373816', 'e95c2dd6bd8094b159dacc2653cd1a29:5549a1b96119b0e44e0ba12811bbbe66f6293e392e51c5f35889882df9f1b0c67998cc442dc97bf0d2bd522d0add97752a02655e4eb258b2f2ebb972d7bb6f38', 'parent', '+201011373816', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_5', 'ولي أمر مريم محمد فتيحة', 'parent_5@alwaled.proacademy.edu', 'parent_201006805840', '1d37002aa4c2b0ef0330b7eb66f52957:30b9dae0c6a83f9e8f09cf5e09300805ea1ce714295b43d386608e8b8c9aa45984eac266f9e6596c3ba12cbcb04e9b0093be21011e419afea62df0b0adcab913', 'parent', '+201006805840', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_6', 'ولي أمر مريم محمود', 'parent_6@alwaled.proacademy.edu', 'parent_201503148955', '71b02c351426acc68bb28bd1a91c2033:129423f07c6c80488d927d9c6dd39e59ef479f10b5d1a53130a692d236a366b8aae2a248acffa3313b7d5955f10fbaf7d46b57f311c953eda628e1403e46b474', 'parent', '+201503148955', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_7', 'ولي أمر سعيد محمد خضر', 'parent_7@alwaled.proacademy.edu', 'parent_201004940427', 'e27e9e0748e56b016a1dad99db46ca7e:8bfa5db0fdbb27a68bd74c818fe7bd73acec0f11119c79ea4e7a7d8692788e86b0c32c453499726fa36d6d2ef9e6e8ff3870cb0985fd4edc0d54529e73d87f5b', 'parent', '+201004940427', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_8', 'ولي أمر سلمي علي', 'parent_8@alwaled.proacademy.edu', 'parent_201143556761', '50947864e9148973cafd95afb009019b:4783ce315ac165fafb309ff2acdaa795890766a073a57be00a7c31b882ea3645b4ef0e71ad1f871479cfe65da7eb00093c893dc3f92d3bb87b632f496b151ba1', 'parent', '+201143556761', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_9', 'ولي أمر احمد ايمن نوفل', 'parent_9@alwaled.proacademy.edu', 'parent_201004323028', '2ca0f9bb3024f58190f138474f53a469:ea1b9f1acb0666d290bad4349b55354c566c582c3b40a8c9577b6f6749ddc94f63b51e56280669fa07eb5322299c2036e1e94bcf75bb0b0ccb8ba9fb57700cbd', 'parent', '+201004323028', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_10', 'ولي أمر ساندي محمد السيد', 'parent_10@alwaled.proacademy.edu', 'parent_201013303273', '3ec22c397d75f420122732618b4a9d87:e1e4fb2d15ddf839824db5724584148022687948e5b9b34b0a9a5fbbcfd65eacc3ade8071d5391bee340affd102e282a9468881e3a921c91fb42e87589f36795', 'parent', '+201013303273', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_11', 'ولي أمر فهد إبراهيم احمد', 'parent_11@alwaled.proacademy.edu', 'parent_201092390112', '3f53f72b833a540d4f0bd6f621070cfc:572d5b7ea07688ab7d9192e5a4ff413dc6ed71eda7dd6dc160a3cd4956c2e4cd48081865116a95ec8701fec0e26d45e08c3cb06ec2cb040e3f5c7ba57c5d87b8', 'parent', '+201092390112', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_12', 'ولي أمر ريماس محمود الجبالي', 'parent_12@alwaled.proacademy.edu', 'parent_201550892109', '4dc6646d37259670f9b73420a5d016bf:8eb6fe912ea6afdfca8a68aebc683a05fd1775ceaf5159c1a006e6d3f85792adf47aa0dba17e108fc657f818cbacf80d3ae8471a981431b2b19779954c207e87', 'parent', '+201550892109', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_13', 'ولي أمر كنزي محمود هاشم', 'parent_13@alwaled.proacademy.edu', 'parent_201001270305', '268b403d4fe1d0442eacb32c51f97aab:0b2ea9fe651452a05e6401bcb408a3130b258f92eb5a2b657e68329ae66f54ebfb46c1ec60162070c573ee3f3e2da32d2c1851a44acca8e367ec4455786be30a', 'parent', '+201001270305', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_14', 'ولي أمر ريناد إيهاب', 'parent_14@alwaled.proacademy.edu', 'parent_201062880210', 'c8c283bb1701d78f7f8b9fc48cf1c5fe:3dee0926ebd3fe8dbc0af682524eb62a33b20859f70abd1288ae6dc66871d29e3ac738b727362cea7e3d477a9910d9b82a68cf4dcd6911697341e64368b758cd', 'parent', '+201062880210', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_15', 'ولي أمر جومانا حمدي خالد', 'parent_15@alwaled.proacademy.edu', 'parent_201003789319', 'a47a69ada4efc8cfa9fcab9a2db366f2:a18ca0250db3bdf311ee08e0204d40cda91399c96dbd034c4026a1b4f64c5e146e094fdbb6263a7e90b23557be67c682c62a420ee315b65cb1ec496624c4a039', 'parent', '+201003789319', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_16', 'ولي أمر زياد فتحي', 'parent_16@alwaled.proacademy.edu', 'parent_201092855612', '1c282fc4bbe940b8a8fb8a1a9dc70a84:6b6397674df4243b3af79ba09200dccf4c9b287c65c4cd0185857a686d9d9d835c3cb4f9c0bcfa526159b591eff15a1dbdef1e2a59dcbc3f7c61d4c70abb2675', 'parent', '+201092855612', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_17', 'ولي أمر محمد محمود عبد العزيز', 'parent_17@alwaled.proacademy.edu', 'parent_201091373633', '5e588c9f7fbf565f0306b0e9d5af69bc:716653ad815c0a414406365edd3ce628e3893f4c9f9b29f0db58d1a343a72c1335f8a3adbad84314fd0116e1af1f25f7af19ce43811529ba49b768dbd0a4d488', 'parent', '+201091373633', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_18', 'ولي أمر خلود جلال طلعت', 'parent_18@alwaled.proacademy.edu', 'parent_201024713744', '6f3e4df091804fcd724ce69ce839a156:e66f9a64b60c506c1d29860eb1f06e93426ff97dd9de155466552934e5ebc6bb7ddb0b869d33a9efa9ca300503ffdaa91f5839411f0eab4c8c15b56129565b55', 'parent', '+201024713744', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_19', 'ولي أمر إبراهيم  سلامة طلبة', 'parent_19@alwaled.proacademy.edu', 'parent_201090879171', '12e0a60751dac7ddf72f9d89edb916e5:699e900aee0d59dddd4635e867a984cceceab9e09eea130b1df1e3afd066b591dfd4750204ae60d9b534801f84705605a27230e9bda1f63739d225d64f1751b3', 'parent', '+201090879171', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_20', 'ولي أمر ملك طه علي', 'parent_20@alwaled.proacademy.edu', 'parent_201123039932', '6eb25c101e78eb888f8f16b82fe09aa8:3544daba6f4ebf175050cb74b67978da0d3097457151b115b0735c7030412946a76848311c1c81b1ad108d570416dce4142b00a2e9ea835cc39c45c3a928418c', 'parent', '+201123039932', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_21', 'ولي أمر فاطمة إبراهيم سليمان', 'parent_21@alwaled.proacademy.edu', 'parent_201030177266', 'c8143e8bb986d77aa1e86ff9ca4c2d11:919af4e27521947373724ffdabc71f7ff0c5a28a6993672101ea6f0d9b9a9d97ad726d4c69d80d62c3828dfe12454d4995c313b6f48691c654961c836d9f2efa', 'parent', '+201030177266', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_22', 'ولي أمر سما السيد هتهوت', 'parent_22@alwaled.proacademy.edu', 'parent_201050446873', '33d0a8706a30e9f3098eb99cd9ab473b:001dd9f45854518154d8e9d2dfb8acd7c65d9eb45c6a256e721c8abd65b8f7da8373a36e2d272feed20e872d6a90830ec7804b49b485a50697d0f82e682c4c12', 'parent', '+201050446873', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_23', 'ولي أمر ياسمين عبد الفتاح', 'parent_23@alwaled.proacademy.edu', 'parent_201020689011', '3388dc59ce76ac4fbcd30278e962d6fd:c056fea51dba2b20ba665182521ff83ad4b30c30dcade7caa22a56b32b3e057871c7b0f0e2582eeff106d679bffc44a37c4100f439ea5d8330ccaec45685d009', 'parent', '+201020689011', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_24', 'ولي أمر سلمي ياسر علي', 'parent_24@alwaled.proacademy.edu', 'parent_201040688716', '05e3fa2bd9ed86ac69f247a7d5fb6c13:366a30b5b9ab5adbba1a42b566459243e41ad53ccaf03f0c2edf9b6aeecce0b767c15dff598cfc68f0beed286bc4b27b3df3e0bc6e548784d1cb8984c342cf26', 'parent', '+201040688716', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_25', 'ولي أمر اروي احمد سيد', 'parent_25@alwaled.proacademy.edu', 'parent_201033788620', '9fd8a8273927dd936b298f90a53e9b93:f625d5cc6eee473c6b5f22207bc72160b5a0f49d7a96f2bcfb714722f763f2614f702858dc9fee8305ebcce039394ba6602e93b670b472c7dc4d32696ab62dba', 'parent', '+201033788620', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_26', 'ولي أمر إسماعيل احمد محمود', 'parent_26@alwaled.proacademy.edu', 'parent_201038818578', '1206eb9d6bdcbfdcbe4b0ec8e24deabd:7225fe94e8d1e29375fb7b8ed03e720801f9eaa3811f65f62c0e26a484d33f3fd4e77d0d5ac582167a4fe667b34b89c1fed7642d81ac6409d7f36c03a1175d8d', 'parent', '+201038818578', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_27', 'ولي أمر محمد هاني الجرم', 'parent_27@alwaled.proacademy.edu', 'parent_201116655673', '5d5e70c5b17074387091bd511cb3967b:76188f191014ba5881c9b009bb73246db3b26368d6b137e01d65f45c18bc4844c0a5439cd9bed1004b80fdb32e8910dffd6245b56a715203dd733dec2d7c282d', 'parent', '+201116655673', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_28', 'ولي أمر روان عبد الخالق', 'parent_28@alwaled.proacademy.edu', 'parent_201002017278', '0f2742c2e50cfdf203b0a5df15919d7e:390d8593eb78c39eabb266ff77734b57bffc67c99ea588a420cdf0a113dd5e0322eda6529fb0f66a5177a86ed0a39f6d4ea0e04bd3a63145cf95b6e07ab8b48a', 'parent', '+201002017278', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_29', 'ولي أمر يارا  هاني فاروق', 'parent_29@alwaled.proacademy.edu', 'parent_201001030779', 'be2bf762593f7118fdc22a19c2ed090f:521bceaecf72d2df969024de36142734c857705c2f1a5d761d595d085e3f402f2f937df98d7b9f00846377b29234f516cf2829adb21264b038643bff84029d65', 'parent', '+201001030779', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_30', 'ولي أمر يوسف عبد الحميد', 'parent_30@alwaled.proacademy.edu', 'parent_201010735249', 'ec6c68a45e7468fc12149628cb2e8e50:1fab1f5c2de8db4612f44729178dc78d71b292c449a2f7f9e4d0b54cebac20a4d03f9d008015bfc489b9e6097dfb962dff8ab0f98fc2632eab64cef0f6722b91', 'parent', '+201010735249', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_31', 'ولي أمر إبراهيم علاء عراقي', 'parent_31@alwaled.proacademy.edu', 'parent_201014822555', '07f55bdde2360f3c9d601307d6fd6763:f894fe79214310aa2373fa6341767c27eb9908decbda603570b072600da0027f23142fd81c4edb09f163073c9b4d2aa031c39365fe315faf6e65042f1d816a39', 'parent', '+201014822555', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_32', 'ولي أمر احمد اشرف راشد عبد الرسول', 'parent_32@alwaled.proacademy.edu', 'parent_201068599538', '2e063428552e1e54c14a9d8c42963f02:fbfea49e1aee15a73c5666c89b5f4da3a6e38edb91716ef2eee757e0478a9834b15bafcef66f24d99ddef9e7ebd34bb604abf7be86353f2e55b260bd4532b4bc', 'parent', '+201068599538', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_33', 'ولي أمر احمد محمد جمال', 'parent_33@alwaled.proacademy.edu', 'parent_201019793665', '33ddfb8f790e0f35567809d9954c6ed7:b8f892e73be15d1e2e3c29898397a1e28e2e302d3e7d01ef71cbbc53bda06d9289b24abccef0e5e881baa917f8917ce7b4a6cae1d26524f7c899a92a2790867a', 'parent', '+201019793665', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_34', 'ولي أمر سعيد الشاذلي', 'parent_34@alwaled.proacademy.edu', 'parent_201002049870', '956dd65162844b38c88ca6ec121178ce:f7732a407178babd619b979280045475a5b74671822767a462f0fb83acc4ffc7d6abaa67d47c2912c10a38aa94a7028ed08de2a7d20c2d00c816365ed6343b60', 'parent', '+201002049870', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_35', 'ولي أمر ايه طه محمد طه', 'parent_35@alwaled.proacademy.edu', 'parent_201068158139', '3359b11b1a68c7761a598a0b577c3eac:fcb781758039044984517f1f91a1e59446ad96078270187702390472fe0f1cbe5ef920804cbae821b46abb93fec0fef5ff1a50ec8c713895ecf2ba2b1a7853d2', 'parent', '+201068158139', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_36', 'ولي أمر مريم إبراهيم كمال', 'parent_36@alwaled.proacademy.edu', 'parent_201003540106', 'de654535356edce5a3cf8d1e1a592c99:4acb878b6ea8ecb07396f5c4706c1a9cc3eb5da10271a6d004700ff03305730514aba37b24ba29a91d501107f006f81e65c54077e818d411908fe50ec34abea7', 'parent', '+201003540106', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_37', 'ولي أمر ملك سامح إبراهيم', 'parent_37@alwaled.proacademy.edu', 'parent_201203208030', 'ed2071128737a3355fa868c765dd6f34:262309b64274a2dac105cfcf08b6e06c45396c12d8d544431a0d4943d52409a43bab4efdd4bf4111dff27feba6924ca1e51b637387903d166a26261c1739f4a8', 'parent', '+201203208030', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_38', 'ولي أمر مصطفي رافت', 'parent_38@alwaled.proacademy.edu', 'parent_201025710400', 'bc24755f1a9256105c0defdec4f931e6:b840f5789e58b47878c15c3f63a958beca98ff0ebab5092d31eee060b6d18f48d62a4606653b9b67ac494798118ab85289c13b8d81a28902998abc3ba2c2dc08', 'parent', '+201025710400', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_39', 'ولي أمر خديجة احمد نصار', 'parent_39@alwaled.proacademy.edu', 'parent_201550595490', 'bf81db35a0e51ec76d2e4a5fa95a3ebb:a8539baf643f47db033d7d476dd1b5d128bd3338af65dc03201f26e4683b6f2f973eba31f13a309e856f63086eeeb3e6989ee47d7bf700ae092addcdc6df573f', 'parent', '+201550595490', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_40', 'ولي أمر فاروق خليل فاروق', 'parent_40@alwaled.proacademy.edu', 'parent_201028448231', '265125743bb5cf5f135b817069a04b6c:a7ea8221ff5622f145471a145824cac38c061f96683c841e46ad1ec2b09e250f28a36b8f7e8299d28a2133be8d8717653501fbcf8313ae88d917b2745388961d', 'parent', '+201028448231', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_41', 'ولي أمر ياسين إيهاب منصور', 'parent_41@alwaled.proacademy.edu', 'parent_201019701754', '68362fd99ae4355eb053763c7018e6db:308ba37e90989ab111b0a2c300ceb86100ed1a1db92cc9a564d5fc46aa8388f1e02d150abf91077a135ba13b08df5dc7faf5082542508dc144a62961a307b2fc', 'parent', '+201019701754', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_42', 'ولي أمر أسماء و ائل سعد محمد النجار', 'parent_42@alwaled.proacademy.edu', 'parent_201156914716', '3d2020596ac056608eb6c1bc4fd2d94f:f0f615294d121ae8b05b6838fbfca655c024131c9b71ffe5e99ba97f1c17ed9c7ecfdd08587c2b28d7ec98e12e2e14d89779166a1a215dd8031aa4136d4a277f', 'parent', '+201156914716', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_43', 'ولي أمر جني محمد سعيد', 'parent_43@alwaled.proacademy.edu', 'parent_201099531911', '1592d49d8c866f42fab9aa3e13d37b12:b3fbc0a9ec69eaa1428f48efc80e6de463d2a4b807caf26db76121583a8e814170e82020ed52f014c5cd9474ad3a8001a34554882076dd70019844104381dbfe', 'parent', '+201099531911', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_44', 'ولي أمر ملك محمد المصري', 'parent_44@alwaled.proacademy.edu', 'parent_201022322810', 'b27841f59d4d8142b063e802bf15cac9:8277e58537202d8ff4ce336fe6289193ead64f46931ef002a7fe3f83f69417e3b201c6e5b836d26028c4995b577eea401a7de3e7f0200ec889f45fbf88a158d5', 'parent', '+201022322810', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_45', 'ولي أمر يوسف وليد السيد', 'parent_45@alwaled.proacademy.edu', 'parent_201200807014', 'b6e6f0b604e528e7d67d4b538b7d97ed:53995f1400c60ae95bbcad2fbd4e947cc952f756b3166deeb65958aae07ae740eedc6069573a7a98b91aa7af62b73b9fdcbe7f9a3706b800211b7450ce344801', 'parent', '+201200807014', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_46', 'ولي أمر احمد محمد عز الدين', 'parent_46@alwaled.proacademy.edu', 'parent_201029554879', 'c3b6e73b25a9cfd92b5754f7fca14856:738255a68638c0ddb11d95f6e1d8d995ba802be5cefae9e1d928e9bd41ab0c3edcc01bf6e17b21f97194869e755c0a1f484b47e710dfb45d11b33bed3a48b992', 'parent', '+201029554879', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_47', 'ولي أمر زياد ايمن', 'parent_47@alwaled.proacademy.edu', 'parent_201014674881', '0a7f7f4b5935d8ed7c3bdd524d7fd4fa:452dc6007db6b27bea8ae1e1c859bfb7b71177ccc9f2f491a7b6ee7f436f5ef97ab5e5e4c7badb155318135f19e66b8fd36f7afd7a37c9366984f9984ac3084a', 'parent', '+201014674881', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_48', 'ولي أمر ايه حامد محمد', 'parent_48@alwaled.proacademy.edu', 'parent_201120107175', '4e5999a3420ba64807e0101684ff4eac:003e1d51ec0f15f3245128a2473679b456cac53ac5356f454c8e44a649e52b79cf5818b5473ca269e03c12fca737fcd47a36e39e6fe18b35b11ba57f6e8e56ea', 'parent', '+201120107175', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_49', 'ولي أمر طارق احمد توفيق', 'parent_49@alwaled.proacademy.edu', 'parent_201063533970', 'dd43a0482c55a45df52d195c6eaf546a:cde4f788bb2b42acd45a7b25c1ddb96961507337f2b82ed5acf5f35f40b141b6d1344c6bce5bfd55b9dbd53ecbcee4ee8356ade210953d05e17131396b47457b', 'parent', '+201063533970', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_50', 'ولي أمر عبد الرحمن محمد اغا', 'parent_50@alwaled.proacademy.edu', 'parent_201273466039', '8dadb873eee24d16951fb04f2bfa0b6c:cf06140651bd9e5cfefe36486c1de6c0b6782b278866afc3be616b09844009f1816c9b989600ca49ff737a3facfe44608de87c24f8ce27ff82d0d7e2ad33e809', 'parent', '+201273466039', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_51', 'ولي أمر يوسف احمد شرف', 'parent_51@alwaled.proacademy.edu', 'parent_201008701447', 'd8048404b4f5264418a4e4226680f56c:f21ebc94b73f7248dd58f521267122b0001a0077bb26c1694bb67411f7347210a9f9df014e92e54c82a26dd2d81a1fbf4f327de13bd45086e1295bb1284069d7', 'parent', '+201008701447', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_52', 'ولي أمر احمد محمد عمرو', 'parent_52@alwaled.proacademy.edu', 'parent_201090547570', 'f4b0cccb90e030a1e0145d35d3fc856d:c9390060e98006773f3093950d6b5664933e7d6c4854f9354153b4b4ebf6deb74153906fe6c5d5fcb0617521414a35c3b08d5a6f4d03221df1e6b75367f917a5', 'parent', '+201090547570', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_53', 'ولي أمر يوسف محسن صبري', 'parent_53@alwaled.proacademy.edu', 'parent_201007808079', '0390a60bc6134d92e6cbf935965147e2:0f2db12dba34b0fcce6491fed985c9c3e4bf9b08723e786ad26038b0a60e68c129a06b31ab6a69d753fcf9b04d986bc036245e72658b0b8a0a0490d809a09a77', 'parent', '+201007808079', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_54', 'ولي أمر جلال شفيق الشيخ', 'parent_54@alwaled.proacademy.edu', 'parent_201014431690', 'eb8196ec1d33d705853242908f85eaa8:1e1ffe4bb4ffd7c040cb1459266ad906211bec51cb150c567c8487c9c109b4946b24cc22bfc51b69deade6fe23378d4f4b609168f48875710fd5e29b01d49ad0', 'parent', '+201014431690', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_55', 'ولي أمر محمد الحداد', 'parent_55@alwaled.proacademy.edu', 'parent_200106802270', 'b7a3eebb4be6cb387a0176a4912bf9f2:f768547e3ba08bab82b454736e2ddfdc8273d69497650ebe2290313415541715cf08687d0037613be500a4126fa91f88a977d664c360687a8f9f9d70c452003d', 'parent', '+200106802270', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_56', 'ولي أمر محمود محمد محمد السيد', 'parent_56@alwaled.proacademy.edu', 'parent_201211628778', 'ec2d9430ab80c476a9647378d36eb197:69ae7f4309a965c56c2e64746c2bfa7c8ea42caf12cf09c17790a069d8939c5cb1c51d4f3b720383fcc15e354d97defd3e34cc5e210404cdf30619925c6cc38b', 'parent', '+201211628778', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_57', 'ولي أمر عبد الله محمد رمضان عيسي', 'parent_57@alwaled.proacademy.edu', 'parent_201552738745', '41ef71061f488e845520f0e1885ad209:0df305656dfdfcc2a5195404476a0be5e2d3e042312ed69b90b0410436d07e60407f3c7112d6b5efb5da89ae078b77285fe88fc80f513d98048ff81e1a47ca75', 'parent', '+201552738745', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_58', 'ولي أمر محمد محمود حسين مهران', 'parent_58@alwaled.proacademy.edu', 'parent_201094800657', 'e5baffe8c56bb28400f9e4f1d2729e44:a8e1653ce774f243959bfba1692258a9474c804cacd3029e295dbbe9e1fcc994924b45df1e152fc8897a4c90633543ced912746f764d7510f98addbfec4e14ad', 'parent', '+201094800657', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_59', 'ولي أمر روميساء محمد سعيد', 'parent_59@alwaled.proacademy.edu', 'parent_201060427355', '1d923c245a1b93a7e90dbdee11230e18:00943146d895462cd325a47a12dc424430eb705b2c6ace26e761e6006db2db2dbaab67ccd34d225f19ba8f5846a3370c8a1c3c259922b9eb3ead1a7091e4426a', 'parent', '+201060427355', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_60', 'ولي أمر سعيد رضوان بيومي', 'parent_60@alwaled.proacademy.edu', 'parent_201014545551', '3d3bc4599c9b8533bef7b1077b648033:c810ba7f9b3c989c6012b141064fcac7321385b06d2f55ca76ed11d3f3c0e1af6b3dd33ea3c7a785364cbb456c7d951c1c41ffd0905270e6bc1b2365fa92e89b', 'parent', '+201014545551', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_61', 'ولي أمر عبير احمد فؤاد', 'parent_61@alwaled.proacademy.edu', 'parent_201008825689', 'feecfd60f5da7aea477b60f2bc9b0e90:568fa3081f09889fd140d4303230f04ac4b0bbb686773c0a399edd46629689e1fc8606066e8cd7c5f94408f67f240343495c30660eaae50a32c11d67bb323c2d', 'parent', '+201008825689', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_62', 'ولي أمر عمر فادي الخولي', 'parent_62@alwaled.proacademy.edu', 'parent_201098356245', 'cc35023dc08657d6e5cc14a2f371e62f:da96de6699a43de58dc4539d979e3b5871b1077d6df8240c1e77997e4f4e18350537d88d8eaae4a5edb02e3b5594b03743334ee3cd3ef938b377fb68efe8d6b4', 'parent', '+201098356245', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_63', 'ولي أمر محمد السيد كمال', 'parent_63@alwaled.proacademy.edu', 'parent_201063880624', '69d1ac50a02e25d09104cc502829d295:75bd57847bad859120d2c65891d1ae878e91359eb7cc3a528070a64142a2a73af6fa5b928032a47d3f8f7f3363c5dd73220f3d99e9e4b3b1c22eaf6eb67ef434', 'parent', '+201063880624', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_64', 'ولي أمر مصطفي سامي صالح حماد', 'parent_64@alwaled.proacademy.edu', 'parent_201505541716', 'd26c39387096863a4efd87540761fffb:98bd864d74e639fb4f280734c40943b0dae116626cf4d78d0fdef80f5fc631af2e31356ab74ec61ee37aa021c8b6e4ef16760ab85a55809edd39677c39224a5d', 'parent', '+201505541716', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_65', 'ولي أمر رؤي محمد عبد الله', 'parent_65@alwaled.proacademy.edu', 'parent_201093122631', '30936204ef2bb715bde4b485a28357de:6eb4a8e7cddb78c01782c3443ea9ac3751b847fc6c1aca199c6d093c26be657b57594c00b7088238239b6d8ecd59832bdefe9c9f264e3825025598cd31abebe5', 'parent', '+201093122631', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_66', 'ولي أمر أسماء علي شرويد', 'parent_66@alwaled.proacademy.edu', 'parent_201278956782', '3501ad06750d075ffb3ccdbb3fe1ce31:54b94a8077945bd809e8ae3a9e54a722431db6628c4dc3b59af75ea5244cfdef4fe98bf636b894728a89065472b34bce6f7ca04b8bd8530555cfc9609996428a', 'parent', '+201278956782', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_67', 'ولي أمر نور رامي حسين', 'parent_67@alwaled.proacademy.edu', 'parent_201061922757', 'b7068e5d51abfbc34f60def885744c7f:ccfe9e3caf97d09312c882aa44a5782411e59d369c6943218093fc709f051efb6900b63ed0cfcd612178afee68b772a3ae732533e18649dd16033cbbbaf40cc9', 'parent', '+201061922757', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_68', 'ولي أمر ادم محمد', 'parent_68@alwaled.proacademy.edu', 'parent_201515933853', 'aba9440b8fe6dbf76757614d03f61bfc:ef5b143a2777a3acde46b4ac98f98cc980669b28d66b6011f9fffc2921e1c84a9bf858f320f14ef4ca710b32ae52a890131a0ba258b865269c943d41f823eafa', 'parent', '+201515933853', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_69', 'ولي أمر انس محمد يونس', 'parent_69@alwaled.proacademy.edu', 'parent_201010070166', 'b849510861a275952d8bcbe92a2083dc:2f472c8101abd3369bca6ac794101dd25b8d70cc5d4102a7df425899eacb34485585b392ef1b796c19dafbb0f0ff6c3c1077c28d747238950687725329f124df', 'parent', '+201010070166', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_70', 'ولي أمر ادم عمرو', 'parent_70@alwaled.proacademy.edu', 'parent_201069469658', 'b349d57ac577ff238bb51310b8c2b162:5ac2753ff1c751ac7b8fdd489f38ca5cfe254bda1920b2540cd2dd7ac4bd0e0fad326b4cd9d8da93a48da57db88dc23202b15db3c0fc26284a33ac6a4f187164', 'parent', '+201069469658', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_71', 'ولي أمر ناهد ياسر', 'parent_71@alwaled.proacademy.edu', 'parent_201008512100', '19d773783b4cde45931200d67b075aee:90790a4581878f2a292eae836e86beb080e14b8209ca96f60eaa8f33d64def7181092b8c3726cce42c25b233e5c3a45dd79a9c2f3fa00fe7db4b4e12e169ff58', 'parent', '+201008512100', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_72', 'ولي أمر ملك احمد مغاوري', 'parent_72@alwaled.proacademy.edu', 'parent_201094407076', '6ce3b03bbd19fedf6b82d68b98dd0820:00d9cd36484450e07e93372832891359004dcb9dcc5c036b213f545c5fe1e3908f792ccbaaa546bfd94efa8caeb8e65aee9cb5c45d387b4a6b42e08b8951433d', 'parent', '+201094407076', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_73', 'ولي أمر عمر إبراهيم انصاري', 'parent_73@alwaled.proacademy.edu', 'parent_201067974057', '3aab0b229822cf8efe8bbb3d73d7cd47:6fdc07e3ff1cafe11ab7cee29545339203a73576493dd84e3f1261e5367d6062519f31389ac2e1bc543e4dad581a15a509c5ced69a8133d63d680997be3f1786', 'parent', '+201067974057', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_74', 'ولي أمر ياسمين محمد العشري', 'parent_74@alwaled.proacademy.edu', 'parent_201023688706', 'c63a7abe4c93ad099d5c2cdade510c7a:3dbf039020a08c44de45b3e790189e0365f990274d0810a5e4c9ce313c190e08f52ea837443c6e94245f8601ca0d090bd4d6e29586637d3fe74396210739b9cb', 'parent', '+201023688706', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_75', 'ولي أمر محمد إبراهيم محمد', 'parent_75@alwaled.proacademy.edu', 'parent_201279822904', '75ba66e8989fc13bde066e186c8369ff:6d78992124204d98134bbf4398292e06df040717f28fe27ce9422d3a9bab28c518ddb081bf7d93893e6b5e9af61d3881a1ce93e047ea2657bd68e1c5165a29ba', 'parent', '+201279822904', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_76', 'ولي أمر الاء فتحي عبد النبي', 'parent_76@alwaled.proacademy.edu', 'parent_201272494881', '0701b10dc36721b97416656f0bf15251:0b2224803e3c099535a01f4d3c03db342386a2c8e457404cb37e219054b3e490a329c9237d5455535cab85ad21ea4568c52bf6bdea9572485670ab9d58f44078', 'parent', '+201272494881', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_77', 'ولي أمر عمر اشرف سليمان', 'parent_77@alwaled.proacademy.edu', 'parent_201010212360', 'e2ef24064fad1f8e2c22547da9bce436:20a55a3772e575e41101c6bf5d5a8240ea7dd8b9a852c6a82d848665dcd2e1149cb018dec82e0677d38688da9da034dac0ba33b4fadb025ba75829e20e547663', 'parent', '+201010212360', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_78', 'ولي أمر مونيكا عازر ايميل', 'parent_78@alwaled.proacademy.edu', 'parent_201233364674', '483197f08433eba4f955066dd05b7cae:58e2844ccbffb3fc549884c792376dbb65686c3364d6d9ce9ff83518ebf20caf20efb96db29e57f453d7712ffe4b05216f5ca3aa128a0cb2d3671eed58f59173', 'parent', '+201233364674', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_79', 'ولي أمر اسلام ايمن حمد حماد', 'parent_79@alwaled.proacademy.edu', 'parent_201112202946', '1f57d013018a58e46590d4008edcfd89:02904c746c05028c7a95e04830c54a9a9d7adbeda38be761dd7b857cc2288ddb3bdf60fe55cec6cd34af902e9e68b62817f3dbb33726f52c7db142f243501b69', 'parent', '+201112202946', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_80', 'ولي أمر علي حسن بركات', 'parent_80@alwaled.proacademy.edu', 'parent_201015831681', 'ef4bb0836eca71aeb5c902bb2dc75701:55bc53f72751bd0d0c6d6475103176e9d2c0f9710bdb30a0baa8c29b4ba8ade018853917e6292620165c75c6b7660fe926a775fba060a7535c94eea0cdee1c18', 'parent', '+201015831681', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_81', 'ولي أمر زياد شريف محفوظ', 'parent_81@alwaled.proacademy.edu', 'parent_201033882450', 'd052eb415d6f4baba531ea2339ece34b:7eb9cd451142c8daa7a52604477749848b0403bdc061ecb9d0e055c1b1257b0218c5d9f87918d4c159a1c469fb5b87c558190677d8faa38b19238980f3667284', 'parent', '+201033882450', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_82', 'ولي أمر هدي حمد محمود', 'parent_82@alwaled.proacademy.edu', 'parent_201018407797', '92f86506ae772169e1d7d30b9a6d8594:c2f8d9a5fc3779257c1d0f2fa3644006b45b07f3fd3327625abfc8d981e43c5ca4d261e1fce5281ebad086471188f9589c59236ee390310e65d56c02c2c05c84', 'parent', '+201018407797', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_83', 'ولي أمر اسيل السيد رجب', 'parent_83@alwaled.proacademy.edu', 'parent_201014091640', 'd1a9fa6417c99c14536482bb48b1e43a:b340a6365337556ea44d9fe62fd28e43e20d5e52e8cb0ab1ca91d0fa275daad96c5af371db481af234af8b517a79264125d3a5fa144017e657a96e89f1738185', 'parent', '+201014091640', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_84', 'ولي أمر أحلام عامر محمود الصاوي', 'parent_84@alwaled.proacademy.edu', 'parent_201207446150', 'ef5914206a1d0d505ccc60fc89d43335:cbb53428f741b70860cc7fd4ec2f643b197cb089891a885961c3f3efddc85aad3816241ed3c4f5c5db0998f378fc7f3345ee6108f7546179e2b233600ae2e2ff', 'parent', '+201207446150', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_85', 'ولي أمر عبد الرحمن ياسر فتحي', 'parent_85@alwaled.proacademy.edu', 'parent_201003493380', 'a328ea7b537b8121fc8dc7f96abe2296:8eebb78242880d2edc085523f9cb8ba51f09d6389010c18686bc345f54e5aff3abe3931a26f08984a9febe814b020a2a603d89a23a94c4eac18bd85b27a4f776', 'parent', '+201003493380', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_86', 'ولي أمر محمد سعيد عبد الباسط', 'parent_86@alwaled.proacademy.edu', 'parent_201012002173', '2ef8aa7e5f14a851de670854d5ce0578:ab36081ff97dcff4360fb6f4029c744209825715e075c4ad5919f1f455f3220381e96afad4fb316bb17794c560b0df452fa6b799abf00f016bb09942a3f081c6', 'parent', '+201012002173', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_87', 'ولي أمر سيمو محمود سعد', 'parent_87@alwaled.proacademy.edu', 'parent_201108067041', '8d04bf494f3f32e055f39257f529cbed:21c1c355eedc9cf51747930c6c991ff978a60c218c57e35b98a4e07bcbc5693062aa35f8f39abe9366c1129ff65ce03fda87551b48a58889a0da024120f1a60b', 'parent', '+201108067041', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_88', 'ولي أمر عبد الرحمن ياسر', 'parent_88@alwaled.proacademy.edu', 'parent_201100414805', '6b26143d5c42665fd8b7ce24e643c870:5581429f05ef74138ee2f372f837b9ea0396ee37d58c68873c95b2d8c4d4a3db14029b52d68f07df42ce43d4be34eb88c675a8485b23c41b8f8d5fe41399120e', 'parent', '+201100414805', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_89', 'ولي أمر حسام حسن', 'parent_89@alwaled.proacademy.edu', 'parent_201099294060', 'c5b0d4ecf5107644211d531735724cd3:e960ab79ed9925b0d21ac723a55d6e2b7f02b9a82dbafa263bd02d526c93924e99ce720f2c2fd9f275d876e18576f874c2127c4ca1263fa39e563444a5b21098', 'parent', '+201099294060', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_90', 'ولي أمر مروة ماضي', 'parent_90@alwaled.proacademy.edu', 'parent_201006070876', 'f813b6b6d6c96a4f7128e3e7d69b2c97:f54279275c3cdff82c4d1caec0d71d8e5549706f6b8e027ab219ffd51f4226477099387f021e6c0376bbe667604ee84f6dce75e68d9716a5f1b77a3bb5bca497', 'parent', '+201006070876', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_91', 'ولي أمر سلمي طارق سيد حسن', 'parent_91@alwaled.proacademy.edu', 'parent_201210394137', '0485ede09743037d653dd7b4e3691ead:9b881402a084df6c5da12597226767e4f4c556cc693f1227c63b65da8c0087238a835054d8c4e74e661a5b52fa5bd7c04af76a4046220f94dbab0e949bcf9342', 'parent', '+201210394137', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_92', 'ولي أمر رحمة رحاب', 'parent_92@alwaled.proacademy.edu', 'parent_201277952750', '592302b56914ae74f0b413ce8f16f2b5:6acf54f618664332616148e105a565479cdcf2ee28aafa33c40e8a87be192093095006f5bd2a862eac214a93073cad65b48a8c9858369e41e263034e094750a0', 'parent', '+201277952750', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_93', 'ولي أمر عبد الرحمن صبري القاضي', 'parent_93@alwaled.proacademy.edu', 'parent_201022366834', 'c0875122b022ec673475fbc5d8e1f07c:71699c2c4cdc1eac9119569051aadc26c802afd81936f67b8107ffdb1da3a2910bbfbc34df1cb04e2cd9c2072bf19dd99f1d576d0a2f4a93ad57440c15a97b76', 'parent', '+201022366834', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_94', 'ولي أمر شيماء محمد حمدي', 'parent_94@alwaled.proacademy.edu', 'parent_201286061599', '1c253f39ee2617727154f0f6359a62d8:6e3e983bfa378c78b8451c5391c47bf827cecedd48266c8074616bf6d1584015794fdeab94ae6f4b060326da656375acf0df328a8e654e4b01fa54e338258dbe', 'parent', '+201286061599', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_95', 'ولي أمر مي محمود حسن', 'parent_95@alwaled.proacademy.edu', 'parent_201002009462', '92c3c6b8ad6b37b99bebe7bce4367a8c:8babde98ac2970de14349367a07a9e3d84702a1dec413695d0188816a1c229e9464bcf29ad22186074d11a2d9d1097512d88e1a17b15396902846b08988eddd4', 'parent', '+201002009462', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_96', 'ولي أمر حمزة إبراهيم محمد رمضان', 'parent_96@alwaled.proacademy.edu', 'parent_201225638138', '32adec773932b4a6484c33fb14c6fc90:b86d6ae145ee3238619784465537615bdafd67bf04a3a880ffd693432584a27047d9624b65c8e33c917c890bfceee98959a62715f0708be5334a4b8ccfe810db', 'parent', '+201225638138', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_97', 'ولي أمر هاجر علي محمد فرج', 'parent_97@alwaled.proacademy.edu', 'parent_201103175959', 'a48a7dab9e494294fa02dfd7bb3070d2:5a8083ca725f96f1408e1699bbd3889b595db4e40985e1cec49b28f1b8af7f36d0b8e69c65755b12057e9bb82e51ee0c45868ef5335ce4ae45178b6e05e6e376', 'parent', '+201103175959', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_98', 'ولي أمر اسر وليد الششتاوى', 'parent_98@alwaled.proacademy.edu', 'parent_201550327146', '6847b8d094e357d5ff7e7983374d9cbd:013c360cee2ff061c7f994495008d57ca1d2a05803c86e7d72ce4203422070891a6a191514a63266e29b3b42b796df7870d4fc7685b6c1eb480dc3410cdbd5cc', 'parent', '+201550327146', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_99', 'ولي أمر يوسف فتحي إبراهيم', 'parent_99@alwaled.proacademy.edu', 'parent_201211339795', 'cd0b40df610c172b38229045c683a819:b816482faefa5e420d8a75075b53e81ccf4b855e5ce4646271dbe649e2fa900c38fe3ad7e690793ffbd31807653bad9e4848c0bf021e2b8dcaf00d0bdb1ea780', 'parent', '+201211339795', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_100', 'ولي أمر محمد عماد العشري', 'parent_100@alwaled.proacademy.edu', 'parent_201200626525', 'f0857f91594084ca544f2446f6466e92:6a45add4a6eccc536ab960059dd65c458168ff261e18dd43e8f946333633319437a5cfa66e4df7311b6ccf18aa525b44612d83184039db774594c60188532fe8', 'parent', '+201200626525', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_101', 'ولي أمر محمد احمد فرج', 'parent_101@alwaled.proacademy.edu', 'parent_201099116552', '857c5a0a6bf53abcd82a367728e5af27:f08a5b5819ba83fa8528187b9bf6b2127a03b8e34dd2721abd9c35e6333c85686a221b56e95eddbf45bd1a934cc91dd9cb67553cbf237043c19859a5c5b0f2ca', 'parent', '+201099116552', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_102', 'ولي أمر محمد محمود الشيخ', 'parent_102@alwaled.proacademy.edu', 'parent_201067163795', '4eeaabcc37ee4af086ea8d434c2528f6:e364c0181435ed049e30074b757c58f305d93002abd602afc315e1d8f5acd1524e61670ad502b18c6d4969a5342cbcfe78c2dc9dc698cc28474a2c7ec24be411', 'parent', '+201067163795', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_103', 'ولي أمر بسملة مصطفي رجب', 'parent_103@alwaled.proacademy.edu', 'parent_201273647554', '5cad2464ae56f49fb01c1d180f473d43:786f2cbab95c0b35c0f1bebeb6a6c14098894d832bafa3b6ace84fd8aeb3f9a4016ee6641da02e0fa931399ff055ca24e4971b5834e8855bc9c6a36a238b6277', 'parent', '+201273647554', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_104', 'ولي أمر حبيبة حمدي سعيد', 'parent_104@alwaled.proacademy.edu', 'parent_201016922486', 'f32974c3e123edfa853c844e7dcb9325:41302a692215181c5fbc729009b1eae3397f68aff1564d6e67ca6adddf1127e808c092820917939730917cd22159165bf4eabb98ad94fd9a5a72d8382b31d5d0', 'parent', '+201016922486', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_105', 'ولي أمر سعاد رضا محمد غرابة', 'parent_105@alwaled.proacademy.edu', 'parent_201067646632', '33b57b5f284dc10494d212b810fe498b:c20acf0736c6507bbca448bb8fc5d5474d0bea8c873e178766465498cd5450040e923216f6f28caf434d1892cee2329ffc8d1d5119dc3bcbb5a6a4d54119d6b0', 'parent', '+201067646632', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_106', 'ولي أمر سجدة احمد عبد الله', 'parent_106@alwaled.proacademy.edu', 'parent_201040668052', 'b88586601b23dd574cc24ade46565fc1:3fe1d940e327d9fa1c6bcd5315dc7f94fb99c4212972bcafe26825e5917f52f90afc89feb81a8437af14414f1a0b7fb685bd714f669f4221b03138966b0c19ce', 'parent', '+201040668052', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_107', 'ولي أمر محمود علاء شعبان', 'parent_107@alwaled.proacademy.edu', 'parent_201200054172', '9c44abc1d59bee1dc20b6bb5453e1974:d8037f4e4b1bee12ecda3e8fe4813aae96e88c274aab5c73ef5cbc63fc0941d1f72e88693af5df1183f5abdf5d3aa25a6de67db0077a152785d55fde2183322e', 'parent', '+201200054172', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_108', 'ولي أمر يوسف عماد', 'parent_108@alwaled.proacademy.edu', 'parent_201090132675', '111bb627fcd3f9dfa8f81cc1bb760623:86a991d3fd99893121c8a031f809af85d5da1530f7b8503747f4313ae057809a9d78890ee5f03c69f9e69ee6f9297b58fe76df1875d95ce874d4fc013e75bf95', 'parent', '+201090132675', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_109', 'ولي أمر يوسف سعيد عبد الفتاح', 'parent_109@alwaled.proacademy.edu', 'parent_201120814694', 'b111346d5922083830b75daf72550eff:c30b89d21fc7ca7879c5bfb05e70e28c2df1a6f33eaa3f23df9712a37d3be895229c8163dd61320403734778eb16ee46e0f4da7039cf4be7bb96875216b861e8', 'parent', '+201120814694', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_110', 'ولي أمر سارة صلاح فايد', 'parent_110@alwaled.proacademy.edu', 'parent_201091831912', '0983a855480932a8d5e7149d0d386fc7:f79ca6cbdb7a445db124f266f153d403094fbcb69a0d262ee857e9c6ce7f23de08c3e632865ccc87c7e9706137bee5311fa496e9c9576f7d75694709c1c5273d', 'parent', '+201091831912', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_111', 'ولي أمر عمر إبراهيم حسن عجمي', 'parent_111@alwaled.proacademy.edu', 'parent_201094965128', '0581087ba05178039ec556a58eaa84fe:644ee65eeea81432d5eb01174fd2bc75c7f4041fe804172a5b6a2aa5a725770804e671c9064490e02cf9073b5a503804e03ed62d50a035855eedc5293feea412', 'parent', '+201094965128', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_112', 'ولي أمر نجاة ياسر', 'parent_112@alwaled.proacademy.edu', 'parent_201284670793', '4d0c6198ca5e03754df004373bf578ad:5e85d3bb3d6e60b78ddf07db237684128e41f17e96a474682cbf06ea61bfd8be694853a5576fff716cc78658123862c6ea6c6d968dec6ec52fb2bb4209d7f40d', 'parent', '+201284670793', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_113', 'ولي أمر ادم محمد فؤاد', 'parent_113@alwaled.proacademy.edu', 'parent_201270829320', '06b902b5aa07c1cf7e95f3464c4c1eb6:9870393cfa06e96cccbe43cceb9db9e991eab6d9d676f31bf342cbd06865ae0d256393cdac2bf0d521b0aaa1f026bb7501826a742d31b8b5685c2d923bf3b1bd', 'parent', '+201270829320', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_114', 'ولي أمر غادة حازم', 'parent_114@alwaled.proacademy.edu', 'parent_201271896633', 'e39d7eca0862d14271dc77e929973570:f3fcd758b82b0ed289b9096c48dd2bfa760eba404864352c61768a34fafe85bea572266996f65f023abc9367c68297b421df478155009a6a9c9788af31d0adf0', 'parent', '+201271896633', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_115', 'ولي أمر حنين إبراهيم وافي', 'parent_115@alwaled.proacademy.edu', 'parent_201288498961', '01a49f91c1cca7f324859c56311ae61e:0a5b81593b5803029cffa6b3b172abb3bc0e0d924b324e40da230c83e2382a02cbd14dbdc70a168fb75d5c9d6b3aa97e0aa695c65c73f0e818a0d2b7d7d8967c', 'parent', '+201288498961', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_116', 'ولي أمر إبراهيم وليد الششتاوي', 'parent_116@alwaled.proacademy.edu', 'parent_201550324146', '28c04c52f1bfe209a3d37918f4bb26ef:d35da1443dd49a2a0865513982d8287caad54280d4640115e2f6a0331b80a8068d1efd52a9fcf5245a5d50f9190cae30561763dd6d661277de7bbf5c3fd43b5e', 'parent', '+201550324146', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_117', 'ولي أمر حسناء عبد السلام عبد الغفار', 'parent_117@alwaled.proacademy.edu', 'parent_201010294879', '8172117b346384aee4d6f27cf710822a:1273fdab539740b0175becc75b8fccfc022360eb8b26957ad225cc8869ad4e14dab514cfc54720214a5a158a23a15f5fd781a120faac694c443bd46920f13296', 'parent', '+201010294879', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_118', 'ولي أمر نور سامح كشك', 'parent_118@alwaled.proacademy.edu', 'parent_201007703407', '51a2734b1f6e8f66e64d68c443fadad5:58d70f590a5741f48d13ea5bc5aabdc650547e9a8047208a9ead2576f9faff887f1c0f23c02b2fbc0925a1202a61b7c855819978430cc2dd271673b36636fecb', 'parent', '+201007703407', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_119', 'ولي أمر محمد حسني أبو غانم', 'parent_119@alwaled.proacademy.edu', 'parent_201154593182', '47a337b9a357e36f5812cda4bf9fc924:55b6466b68a392457a14bdfef6c1f07ff5080b01b751e6be90513aaddee9d9ee8689e38485faf4e3649eec62465390b44888098eaeb9384abee8ed99fa994137', 'parent', '+201154593182', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_120', 'ولي أمر عبد الرحمن احمد التلب', 'parent_120@alwaled.proacademy.edu', 'parent_201009576930', 'afb1194121d378afc59cd8ea5895ab5a:3a37e7162a5e25fd5b21bc4afa253a4bfe9454e74947366273c7f808dd4a0f4a2eca27a06727667ee03af6dbf11ffad017d9eb18f53c6c41d72fc7d7ad2c6012', 'parent', '+201009576930', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_121', 'ولي أمر سهام مصطفي سالم', 'parent_121@alwaled.proacademy.edu', 'parent_201066201263', 'ca6bb69ac10a8de4e2d87243596bb34a:09f20b410d4283f4372afa8ba159f04de24594f8536deec7318efbfc398e9e099fbf8526927d9605639811b9062db3f3469faba6004cfc92ace4abcf3640b744', 'parent', '+201066201263', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_122', 'ولي أمر ملك هاني متولي', 'parent_122@alwaled.proacademy.edu', 'parent_201092411786', '8bc0b47aeb60eefcb79e123a2c122594:4c7c90f25f25028dfb56734382104269055d33cdccda233e8c38d1f3931668ffab7f5e4aca374d12c9a4629698dfd6154ff9873b5bd69e0d05b8cfa482e1e084', 'parent', '+201092411786', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_123', 'ولي أمر حبيبة حافظ محمد', 'parent_123@alwaled.proacademy.edu', 'parent_201140738637', '38b627d9b6f0fddaa256c184804d6654:5a054b525c85312afde595544aa96e71ef8ceb28c6ba851e2e8c4235fa5405d0f2ebead437b352a0a8f37f03d3cebd12275260b1c21bd3cc42cc275ccfc44404', 'parent', '+201140738637', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_124', 'ولي أمر بسمة اغا', 'parent_124@alwaled.proacademy.edu', 'parent_201140783972', 'fac4dbf01d07d86a03196abdfd7ac271:1dcc246b40722660170270e92a9773a93e2686174f4b1792c16bff220eb91aed9ca25516d4208da0691fc85bc9466a757c6e6e185e9c63c6e4063db249666b89', 'parent', '+201140783972', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_125', 'ولي أمر احمد محمد فتحي', 'parent_125@alwaled.proacademy.edu', 'parent_201012330015', '02875065594b65188db33105d210f6ec:3501069e1680b1b8b4619e1085af524720d43861ec37bb2d8e5023e97009f5306bf12fa227e16e2c2b408b9ca5864b27b2e301f9770850a3e460502e5797cd7d', 'parent', '+201012330015', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_126', 'ولي أمر رودينا محمد حسن', 'parent_126@alwaled.proacademy.edu', 'parent_201019651180', '56754ee209d79d46c4527143dbdfd1b1:6c3694235181fe14ae336f14cd4e85a596c06dba6fa3f81b3555a58f3ea1e009e591ede2471e386a872d1dccd2e8836094ec3bda2b534ebb6cf7c2e4063bcc8b', 'parent', '+201019651180', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_127', 'ولي أمر محمد عوض عبد الباسط', 'parent_127@alwaled.proacademy.edu', 'parent_201096099305', '4c6cf22f9bb4643ae64a7a94cda35a58:1ccfb0875b56025ae755b51d1fc0b552937bd13b817541cab4a426ce515354854968336ef5ef32af7b065e91dae8eb1696e9edba06e80cd9a2306ebe9d8faa96', 'parent', '+201096099305', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_128', 'ولي أمر زياد إبراهيم', 'parent_128@alwaled.proacademy.edu', 'parent_201090085116', '8f05e98b25a624382d32d707aeb3e3dc:9dca25baae7e223cfe78eefef8a8c50147844f62ea878f07a4f852046a95ec146f0f8692608ee9377233b035e9631fb8b82ef5ef8e33f5ed29a7a017a04fe05b', 'parent', '+201090085116', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_129', 'ولي أمر ياسر عادل', 'parent_129@alwaled.proacademy.edu', 'parent_201091601347', '287a14f98daaee3f2c9d2af147e6b4aa:3978310d9e2b3e23f332c8a73e68c07acb228f6fcaf125733b2c3ea45aacd5b29639c45eb0a25352ca826f53b80fb41ad738d31832de88ebd8b453ebfb11c54d', 'parent', '+201091601347', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_130', 'ولي أمر إيهاب سعيد', 'parent_130@alwaled.proacademy.edu', 'parent_201026816130', '02416667878be046411d3ee47f0d1c29:6a40de49a3600b0306da7722be72c8f3664ea977346846a4a4fa7efe50b6e5fbf0712bd2a7c8f3d27d2d18aba93b62385571763f62dbf4f53e217dba191b9a93', 'parent', '+201026816130', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_131', 'ولي أمر هايدي دياب', 'parent_131@alwaled.proacademy.edu', 'parent_201008197027', '8f2f85987550a374ff821c883d0b0348:cb12856508f8d10ae56509af2d0cfc86fdb50307fd38d872d1dc2cad78a14e1f76959480af0f79dd33f910f351cf7b050468e62434bb3034360b877d832c4c54', 'parent', '+201008197027', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_132', 'ولي أمر نيرفانا محمد', 'parent_132@alwaled.proacademy.edu', 'parent_201200923572', '2500a1284741a0ced0e211a250f257fe:bf5fef913b28e41abbbdee394632883e17d04c9e5f7b31653539aca2d40618db5ecfedda1ea353f464e3ebdbb3b5e5e3ce2b365aa68d3f27761057ec08436290', 'parent', '+201200923572', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_133', 'ولي أمر سما عصام مفرح', 'parent_133@alwaled.proacademy.edu', 'parent_201201701284', '02bd9526b1ba9977e1abd6d02e1d760a:6706dceda659b0ae336b4b969a6dc4f76fb0f8e64412cb23cc8426f50d94969fbf11db23fd091e219df47b1dcc2f64debead1bdd6f4f5a12a27fff33608f4c70', 'parent', '+201201701284', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_134', 'ولي أمر يوسف اشرف جمال', 'parent_134@alwaled.proacademy.edu', 'parent_201200583795', '6bdbcb3e556f91de6dc6b5f0ede0fc26:5a9d656b9a8363169ea6f88df983702d7002b53c3f9eaf4f2ff351560e2fd63751b0fedf785c005e9d7cf098d4d8d64dc76a93fdf5f30a8252f0e2bcca7c9cdd', 'parent', '+201200583795', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_135', 'ولي أمر زياد شريف رمضان', 'parent_135@alwaled.proacademy.edu', 'parent_201007782306', '45b7c82bebf5d5fed74e3151d872e210:eb0f7d031140e63230563947b06907b3a150e9283fbc5610a6df5465f4b6042f93929eaa497f61e52fa299d4bf75fdb2c72abe18d03b1a47d51662c24e35d19b', 'parent', '+201007782306', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_136', 'ولي أمر ياسين هاني عبد الفتاح', 'parent_136@alwaled.proacademy.edu', 'parent_201200507606', '7b7e47089f84e37a7575e645a55d8808:bfa40df1a4648edcc0d47f699181f60bc4d0c70f10ed77f0f51f913f9b68d06ab82ef982a4145b4480ea813486716c2e61d9465b018b4e2b9a6f1c5edabc5894', 'parent', '+201200507606', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_137', 'ولي أمر اياد الخنيزي', 'parent_137@alwaled.proacademy.edu', 'parent_201554854982', 'ecb371d22f272c1e08d564de28d8d01b:7330f4b225077d511febc0624549cd55e8f29385cff45c9e5bda1201562154d55b08080c79a85a1121942f12d86a387ed1357a32804cba792edd2fa6ca771b83', 'parent', '+201554854982', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_138', 'ولي أمر سندس كريم احمد', 'parent_138@alwaled.proacademy.edu', 'parent_201091872439', 'a2df3a0a99d7f1ca772d2c4638aa401a:822b4e77764a65a5d03a34a94ce2a868e37e486a0fa530ddd8396b5d0e0d403d8032eb8bc4b3fbc0328af512032b9621c3c6eb5dd2c0783ccb7b8cf7687485e8', 'parent', '+201091872439', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_139', 'ولي أمر سارة إبراهيم محمود', 'parent_139@alwaled.proacademy.edu', 'parent_201273712973', 'ed88f08690f96e87201bf838856e89c0:52a22cacf1f03f52cf4c60d85b2ee17606cff8445b2e101172d792615c3a49735b39c80ff54b08520957120b07e8720aa7e20d6567a05c6325a7bb4afd322f42', 'parent', '+201273712973', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_140', 'ولي أمر ريماس عزت ريحان', 'parent_140@alwaled.proacademy.edu', 'parent_201064626382', '386be121062679b444d314cf109f9b08:3b77c21d6746e58881eb8c1a89114401130b50383d9d7b11a6c56d4dbb9168242c06fe7a525da2e06a1235a44857cbf4eed554334364383bbd691e519259941f', 'parent', '+201064626382', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_141', 'ولي أمر حسام حسن مرعي', 'parent_141@alwaled.proacademy.edu', 'parent_201000711076', '3b9b500b0b965f7cd5c4ec34fd2803b3:60df30c363d25de0ef1471d5bc3a0d1f552b1d6eb195ab0450ac5dae96cdbf8fb84a4809f61f89f4930247a9f64f3de8ddfd49d610f376d58658009e52fd2b5b', 'parent', '+201000711076', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_142', 'ولي أمر سميرة احمد الجوهري', 'parent_142@alwaled.proacademy.edu', 'parent_201015554366', 'dee3745d84acb08bdcfa71727e6806de:8d297ad2fed4a4369a477fc77e1aa370702177631b4f861ee9c3e8bfb2fd2639517f2f0109e425be60b808b418b3a07e55ce5848b3476ba0fc6de19035fe7776', 'parent', '+201015554366', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_143', 'ولي أمر محمد حسين عبد النعيم', 'parent_143@alwaled.proacademy.edu', 'parent_201003187496', 'e45fe1a3f072f65a78b1b7b4b7df86c1:06caca24a5f687d1a858102bd2d8438a956f99ece44508cf508eb445071a4205e7332b7c30b44f9c2ad672dbb09832283a359dcb46ee99a6327bf8e8b237877a', 'parent', '+201003187496', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_144', 'ولي أمر البراء محمد محمود إبراهيم', 'parent_144@alwaled.proacademy.edu', 'parent_201020157890', '1b70c1e86eb7d17c64e3e03b1d5a2170:0b35aaa7d80c763147b7d1e9d2a2c2e92a4d7e94fc7cfb62f16a08944fc144d80cff980372fbda453fc71f56f873fda7af37cf76d07f6f7831c7eacf2e2340d4', 'parent', '+201020157890', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_145', 'ولي أمر ادم احمد انصاري', 'parent_145@alwaled.proacademy.edu', 'parent_201099117285', 'd9c5914c18b47850202deda64e05e773:03517b408167e3f913af1352b1cb1497be531e8408a9ebcf5d120a72f5b58e821a2dfcfd05f59adab34ca1facb9f38a87856c0a4592f9b8baab5c09b1bcd75df', 'parent', '+201099117285', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_146', 'ولي أمر مروان محمد الششتاوي', 'parent_146@alwaled.proacademy.edu', 'parent_201554205116', 'ca5e8cfad6ec1b024192cd456372b390:899ac8542e4e272e14c9c36b7d679fa6d55e7d46e844066c66c66c70f1906b36645bf93fe6b2fa73f206e3bc554ca9514a3692e429d6caba2ec8764d10430927', 'parent', '+201554205116', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_147', 'ولي أمر دانا احمد الششتاوي', 'parent_147@alwaled.proacademy.edu', 'parent_201550683937', 'bce8a56f42da93f61180adb8ecdbefe7:3c25144ac16561ab258a94361b17ee8d2369a79a3e90e48688464c35fc0fc613e37321eb3adf69a967167e8dff217167877b08000db769f23abd0e2247cdddc6', 'parent', '+201550683937', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_148', 'ولي أمر احمد خليفة', 'parent_148@alwaled.proacademy.edu', 'parent_201552223872', '348b4e0eab4e8dc593d30ac22e4c05a4:53cbf603a87afebdb21cadf00b7f4fa75fac0aab8bd63f76ca55117c22ea87fcd083d6a8087a750cc844db72e5f5aa140f3e24cdbc184ef6361a029cd20178e4', 'parent', '+201552223872', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_149', 'ولي أمر جودي وائل محمد عباس', 'parent_149@alwaled.proacademy.edu', 'parent_201044011138', '8239f9f2885f9e1d795cd734d1be5cc4:77fdf553abaf894210cd7f8b1d237e7788e6f35679a2d6190c19be6c81361d22c81c526fffd3dd8e858c74330ca827f7d95530b388f5585318ffe4e7114db419', 'parent', '+201044011138', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_150', 'ولي أمر محمد النعناعي', 'parent_150@alwaled.proacademy.edu', 'parent_201004857344', '0da6ba0468f8ffe9956a3a427e789b7a:65c84577cc440a83582a4572ec086ef0b3b0ded186d3ceb869ea4b6344e0761590f9a9a50e59d3e4f2205029ca1fd8acb59bd86f7d990b1cc2af270346c6e953', 'parent', '+201004857344', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_151', 'ولي أمر رضوي رضا مصباح', 'parent_151@alwaled.proacademy.edu', 'parent_201003223992', 'a372a3524852102a5ae18902e9a9cd1a:b0a1c682cd92a3a652fce6fe772156dc8710d04eb6c1b164b8669081deafa2d25855a39ffb43638c88ad2e58089c21eb0a692325de1c6763f2af3eef4bbd858a', 'parent', '+201003223992', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_152', 'ولي أمر مريم إبراهيم متولي', 'parent_152@alwaled.proacademy.edu', 'parent_201013613687', '71cfc243c79aeebedfcf4e3ca23fa064:6f8ee4fb18f9748af30bfab940fb9359b9638cd6998d401def1282b2931d6b78de1567a9e60aaaf1ca071dbe590e312b4847c66a92e6e67a31d875028499d3b2', 'parent', '+201013613687', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_153', 'ولي أمر حلا حبيب الرحمن أبو رواش', 'parent_153@alwaled.proacademy.edu', 'parent_201006468384', '5455634d0ba552f6ff9faedbeb54d9d9:454cbabab1ec164da4c6b983b3c63c3479f15026c833a24376c3fb0609d824c3353f7acf3c2aebc7153f03316b4cc8268fa8190cc8f2bb178995b626d071e8f2', 'parent', '+201006468384', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_154', 'ولي أمر إبراهيم الحصاوي', 'parent_154@alwaled.proacademy.edu', 'parent_201067926307', '6c67fc2128478a2e4389a4716c808761:5d5d182e3164b4f62f6afe9a0591af151096dcf438384b61c3805d92ed6dcb91c92a0616dedf0e7d58c877d4efc6559fe7ebe93f551013ce06dac6c2384e38af', 'parent', '+201067926307', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_155', 'ولي أمر جودي علام حمدي', 'parent_155@alwaled.proacademy.edu', 'parent_201090352218', '54b2173b8b06a3877ea873e63af1693c:c61480a3b61d6f405e037e732f53391a3ccb336e981484aba8cd572e0dc5967bd2f2d869c9e5b378e94b633a6d9e8b053b590cbe8a1fbbc96ecc87aad0083b38', 'parent', '+201090352218', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_156', 'ولي أمر ايتن جابر الخياط', 'parent_156@alwaled.proacademy.edu', 'parent_201028312539', 'edfab015dad56938c4131b06bee046ca:fe45c19bede7a7cb7715904d17409a8fd0bfdad40b3a61b01603f2b1c83f2a84fa60eabb09d5388bd08477de4fe6500a43afb8dcaf758ea376e7ef02501cf0bd', 'parent', '+201028312539', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_157', 'ولي أمر يوسف احمد عبد البديع', 'parent_157@alwaled.proacademy.edu', 'parent_201007759443', '05d9a47c7c3f1231a2572df2d7491aab:ea986825aa3189b030d0291cdede9b318ab609e2c230d103b82de4e841fd14b7085a49437f61b48fd8389e5a0d40d2977ad37192d11a2c7c748db1af1c0633c7', 'parent', '+201007759443', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_158', 'ولي أمر عدي عبد الوهاب محمد', 'parent_158@alwaled.proacademy.edu', 'parent_201022119827', 'b9b3c00f6f062d085d0743b7f6d4c2b1:d4fc27c31e0285f4086541e40ada9598cfcca85c8a8c18d66db23839c2662349e5b5d234db5bde75a7d042eec69294b6d33b30c7eb75ea9b20b0d37b418a4169', 'parent', '+201022119827', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_159', 'ولي أمر عبد الله خالد سعيد', 'parent_159@alwaled.proacademy.edu', 'parent_201507786166', '2a6a0091946b7f225b77d4fee8c9211c:bee102018a761ef48db550b930779038a711b343d5de59a6216f03f4ff72ebfc61be32124814b90eb5e9c2a30968e510b59de963ae9b2500e2eb8624a71ec72e', 'parent', '+201507786166', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_160', 'ولي أمر جنا محمد النوساني', 'parent_160@alwaled.proacademy.edu', 'parent_201119476410', '9ffa9bb5b7c63daf219533efe3e07cfe:b3a552e5d76d4094ca812fe2cbd402e98247c3519777db1c81c49c3274c893c285fe2db24a6315d73ef3a91d4a8e7c5862d7d6c2fd6f3333282721ece8cb4d3e', 'parent', '+201119476410', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_161', 'ولي أمر رمضان الدسوقي', 'parent_161@alwaled.proacademy.edu', 'parent_201288764124', '062ff537f57667e57ab021e5f363f74a:7a7c7a89020d0639c197dae5dd17164d22505d95748620d6f774b04a322157d8be880b547a7f9d5708687243e74ecef6df62624546b53f6ca82a9f86c149d467', 'parent', '+201288764124', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_162', 'ولي أمر مريم احمد عرايس', 'parent_162@alwaled.proacademy.edu', 'parent_201281470494', '8a1c03af6cb6d67772ab1a2509f75a3c:52245a91d1d5070de3939533016ecaf42c14756561a0a6d76694211bf9ab268484559cf39fb198fd75a885ec49a6ce86f489cc6a0fff7f7cf4e45a9505a50164', 'parent', '+201281470494', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_163', 'ولي أمر معاذ خميس مرسي', 'parent_163@alwaled.proacademy.edu', 'parent_201025043134', '39568f7c06f0f61f8a14dbc268394f1c:ce45563d3c3dd2c7fadd54563f7c6a6352c5b291e463a98748cab08e1268306f5e581925da967d79549ffd06ce96f369bf417daada0ed296ea67bc51d64e35e3', 'parent', '+201025043134', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_164', 'ولي أمر حنين محمد صبحي', 'parent_164@alwaled.proacademy.edu', 'parent_201223957431', '256e05f418f76cc043a9bb14110e0852:6ce8892b5ea6dce4924ab06a7285d70169d1bf1b54a4484c593d1d4c964c0c92e27d5d6dcc3dfeef5dbabd7a2cd57e0000c36e939f6025d66a8d828e4a72fc8f', 'parent', '+201223957431', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_165', 'ولي أمر ياسين طارق صالح', 'parent_165@alwaled.proacademy.edu', 'parent_201094227661', '7118730d933ce2cde76fa7603178eac8:18e2d29e748510aa415dd4b018f902aa661b7e57843554bdb74ca9382e36b593a6b4e12804ef4a3575eeb33c18a2726a19a20bc4a9f68977997cd52a2349f8e6', 'parent', '+201094227661', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_166', 'ولي أمر عبد الله مصطفي صلاح', 'parent_166@alwaled.proacademy.edu', 'parent_201061956589', '8cd262edf854297d6a6f34ab675f5f22:98e515eb72e0cc5fff74e3a41547172fd6c77128c45a30bb392fe376011aa724753aa5af480ec9f08da9067fedf33a0eae92bda35aecdb2f3b00273140471f7e', 'parent', '+201061956589', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_167', 'ولي أمر احمد إبراهيم احمد', 'parent_167@alwaled.proacademy.edu', 'parent_201039312455', 'fa144510e24deb8ed57bea1ceb5536a8:0698dcffeb7dd576724406e908b4cc2514deea30322ea66c330e53b1ad5463d5cf0b5acb2f51c10fa3144fd351eb4c244def485641b3e88cfced397eafeb3e0d', 'parent', '+201039312455', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_168', 'ولي أمر حسن محمد حسن', 'parent_168@alwaled.proacademy.edu', 'parent_201011531938', '89d347aef4918108305ff8359905dd59:4a4705780e387b862efd8d4002c6b039c12f8f9e2e159e907bbc57bc366ae8dc073a7412d7b17d03b4cf42e6f3ab03e1528a28cd1059859a897bb7b80938b7cc', 'parent', '+201011531938', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_169', 'ولي أمر الاء عبد الجواد الديب', 'parent_169@alwaled.proacademy.edu', 'parent_201024532658', '0ffd2e20653a7cfbaedc8fcce4c6e88e:3152bd1c62354ed919d8bb0f2f2300c20fbe0ceaed81756b603890618e7a777663151ef3389f2f7a1b10c5fd3c10057f057bfb6a4715398825b1c738d038c669', 'parent', '+201024532658', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_170', 'ولي أمر منة محمد البابا', 'parent_170@alwaled.proacademy.edu', 'parent_201003307368', 'e3c41379711d1d09317f88ce312427af:44886b7839acdb316e6842ba4a957600fc18a4b7ca22a7c08b75cc7522169a07d3bf0446992a6ea43ab430661772947c8fe6e596a96c07dac99cb266c98319cb', 'parent', '+201003307368', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_171', 'ولي أمر مريم محمد حامد', 'parent_171@alwaled.proacademy.edu', 'parent_201091464225', '9a4403f4022a3ba1ba55fbbf99b3ab6b:edc02a6ef32113c432b44890b748d123520676d366f0a517bb90fe0bb473e6632b7d9e787fb02602264f45381fd5d097b50fe3faa5d96a717fea39cc82ad8ee5', 'parent', '+201091464225', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_172', 'ولي أمر كريم محمد البسيوني', 'parent_172@alwaled.proacademy.edu', 'parent_201271426553', '5738709709bfaeb480af0630f65d8a11:035749941daa5e1d7ca0819a93d6c71ecdcb0d364d894c9ec319aa3b6327e6f9069a3044e6e5cc80f5020d5276380846970d05081eba329845365fe40185c7f6', 'parent', '+201271426553', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_173', 'ولي أمر عبد الرحمن محمد الحصاوي', 'parent_173@alwaled.proacademy.edu', 'parent_201060626550', 'e6b8fe8c511c3d0787ab5da403f81660:e956fb6455de89cb484649cb3f00dd9db2bfe64e84210b95660e33a8bb183a957b8c30198dedf9082d309b3bb518fda79e9c8518f86c7dbc0ccb04b46eac9887', 'parent', '+201060626550', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_174', 'ولي أمر مي نصر عبد المنعم مصطفي', 'parent_174@alwaled.proacademy.edu', 'parent_201007885339', 'f4e04d55ff3a99f74af680e434b90a62:78511c447c25df007d6f6f5050a395d3a4833642e7a5e11299bac626a34cd4ddc5b0df3a94b33b5426b54be9766e2fe30625056ff00553654067de1d0eddadec', 'parent', '+201007885339', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_175', 'ولي أمر سلمي رمضان احمد', 'parent_175@alwaled.proacademy.edu', 'parent_201063526101', 'a9e7b4a37ffb1e785d0addf0ac0e2729:f1d56c112cc0e84c388417f68941bfe2bda9ec92c2018c2669cb9098b6f4908cddcf02dcf4336a43f3308ee9cf5c9428d856618b15de12692e3a9634f7227d07', 'parent', '+201063526101', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_176', 'ولي أمر سعيد احمد سعيد', 'parent_176@alwaled.proacademy.edu', 'parent_201068979014', '8d82b221e0e3d8c36f3ba4e947be59ba:9395069b41cf45df1cfc55f397d98a58bb1f8253f8e739957ee2fda07de34c105ef83bbb4c838537bc2c8424f7653a2cd5c7844be89a0277f1930de10d69434c', 'parent', '+201068979014', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_177', 'ولي أمر مي حسن جابر', 'parent_177@alwaled.proacademy.edu', 'parent_201092842234', '40b2a7a591beefd98960cc3d3ee5cc11:de43b6e04467f5cfd74cebb41a72dab7ebeec96ebdda99b444279eb359dee865429fe00edd19e37fbc6d849b48e2df1bd376e087107612b793b2436f47f55a1a', 'parent', '+201092842234', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_178', 'ولي أمر محمد عبد الله سلام', 'parent_178@alwaled.proacademy.edu', 'parent_201119486779', 'e97e11fd98511ca9df5f9cea9859a30e:a32e5584ee3ff8d03e25f3b066ff4ff9229b08a3604184ace7333604c1b7685446a30ce2975012fb0fbfe48905eb1d150f27ffd11ed8662c341be6436d5f9a24', 'parent', '+201119486779', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_179', 'ولي أمر يوسف نادر محمد غنيم', 'parent_179@alwaled.proacademy.edu', 'parent_201014130062', 'c7779e6166f6aa4fc3e3e86f4be0c2ea:1002dd52465e4348a13d590dc0f9c7f94c86d8641cec243d3502c1926f07ce82e5b04ec6dec5c53c8bc3484b1bbd00b3131765b2167a1839875d140e239f8601', 'parent', '+201014130062', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_180', 'ولي أمر جني محمد خليل', 'parent_180@alwaled.proacademy.edu', 'parent_201017735726', 'a3d9d725c368fbf91896c31eab8d0476:9c9119399efff7d0da854f6ee40fcb16b06a284987c8363ef19f594a42cf6db76e40f8fcfbba203486a9e575de5f25e945170f76e2c4e3db950562961f5a5d12', 'parent', '+201017735726', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_181', 'ولي أمر هنا احمد علي جميل', 'parent_181@alwaled.proacademy.edu', 'parent_201080156923', 'b183b9f92a01750f73cab1aeb822954b:9c2ba6ed8b1109b6d53cf77fa89ae178d3b4d9a547c83b340ee9d670dd6f4fee6c31e93a88ecddb0e69cc136d712ef3ced4a7f081fe5474dc827cfd248b17085', 'parent', '+201080156923', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_182', 'ولي أمر سيلين مصطفي القيعي', 'parent_182@alwaled.proacademy.edu', 'parent_201221521685', 'e9119ba36284092bdaa4082f48f584eb:62f3ff91c104d6d38e04a86539de6cfc95d4d88b3b5c241407a258e3dfcc3bf9a880fdd3c6ca3002f58dfce6c6959d492c4cb33f4cd1e1b164d0b505f7f98cc3', 'parent', '+201221521685', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_183', 'ولي أمر مروة محمد فوزي', 'parent_183@alwaled.proacademy.edu', 'parent_201110005614', '468b3431fe35f07437be024d504eaffc:5e232e1a770add09018632f8f6e511c45ff6c6670420eb742ab647be3a3e42634aa47289e3876ecd1eadc59f0ad9aa6a7a65b3534231eea1cba57a675a5ad4e3', 'parent', '+201110005614', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_184', 'ولي أمر عبد الله محمد داوود', 'parent_184@alwaled.proacademy.edu', 'parent_201070313498', '039bdf0f9fe04ac5636fb7e7de849b6e:e50ff1562c7cbe4862c2f4347cddbf904af63f984aa7f66edfbb94094a3224a81b01d9c81b855c3285cb188535ae7d19e1eccf5068a1ffbee7658753bfce1de6', 'parent', '+201070313498', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_185', 'ولي أمر روضة و ليد عفيفي جاد', 'parent_185@alwaled.proacademy.edu', 'parent_201210878193', '95b46a5e9b75ec145e2161950bf9eac4:b0847a071dd9a52093fd75389d33f2c644f01a3a533e64431d1f51924409c48f953723d9538326c81094d1e43f4a86a498e3804e601994431379d2a5d8ebbaae', 'parent', '+201210878193', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_186', 'ولي أمر حازم محمد فؤاد', 'parent_186@alwaled.proacademy.edu', 'parent_201029445311', '239c344ab136f017a789560e0fed7c31:5bcc199089c43fefeeaa3c85855a9c62dc0dc3800ea96e10762f20d1714bbd5d0ee0e05514808986441a23ccf949ceb03220905b1e67512520332de3ed4407ec', 'parent', '+201029445311', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_187', 'ولي أمر يحي حسين تهامي', 'parent_187@alwaled.proacademy.edu', 'parent_201097788735', 'eba40259c8888a4211e017333ac00ecb:85bebf647e9a56d0d23b203656ff6d0111af5b8c298c5fa7f9be7adc5caeb01687b2a54f42a3c88c6ca1d38ff1393b75ef77c1bef02cc436a7ea0454cdf1ea8b', 'parent', '+201097788735', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO users (id, name, email, username, password, role, phone, must_change_password, pin_expires_at)
VALUES ('usr_parent_waled_188', 'ولي أمر وليد عباس محمد عباس', 'parent_188@alwaled.proacademy.edu', 'parent_201098474393', '31d30930ea2e08c1aa74167ec7dd82d3:61f1c3f42353131d58be2d8c2629dac79e0f67ef5ca1ebebe59b943cfc9ee7fbd418ade9e34743f090a562defab108db2da244dc1aa0c23c3c886a89d1efa740', 'parent', '+201098474393', true, '2026-12-31 23:59:59')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;

-- Step 5: Insert Parent Links
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_1_usr_waled_1', 'usr_parent_waled_1', 'usr_waled_1', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_2_usr_waled_10', 'usr_parent_waled_2', 'usr_waled_10', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_3_usr_waled_101', 'usr_parent_waled_3', 'usr_waled_101', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_3_usr_waled_102', 'usr_parent_waled_3', 'usr_waled_102', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_4_usr_waled_103', 'usr_parent_waled_4', 'usr_waled_103', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_5_usr_waled_104', 'usr_parent_waled_5', 'usr_waled_104', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_6_usr_waled_105', 'usr_parent_waled_6', 'usr_waled_105', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_7_usr_waled_106', 'usr_parent_waled_7', 'usr_waled_106', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_8_usr_waled_107', 'usr_parent_waled_8', 'usr_waled_107', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_9_usr_waled_108', 'usr_parent_waled_9', 'usr_waled_108', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_10_usr_waled_11', 'usr_parent_waled_10', 'usr_waled_11', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_11_usr_waled_111', 'usr_parent_waled_11', 'usr_waled_111', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_12_usr_waled_112', 'usr_parent_waled_12', 'usr_waled_112', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_13_usr_waled_115', 'usr_parent_waled_13', 'usr_waled_115', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_14_usr_waled_116', 'usr_parent_waled_14', 'usr_waled_116', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_15_usr_waled_117', 'usr_parent_waled_15', 'usr_waled_117', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_16_usr_waled_118', 'usr_parent_waled_16', 'usr_waled_118', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_17_usr_waled_119', 'usr_parent_waled_17', 'usr_waled_119', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_18_usr_waled_12', 'usr_parent_waled_18', 'usr_waled_12', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_19_usr_waled_120', 'usr_parent_waled_19', 'usr_waled_120', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_20_usr_waled_121', 'usr_parent_waled_20', 'usr_waled_121', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_21_usr_waled_122', 'usr_parent_waled_21', 'usr_waled_122', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_22_usr_waled_123', 'usr_parent_waled_22', 'usr_waled_123', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_23_usr_waled_125', 'usr_parent_waled_23', 'usr_waled_125', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_24_usr_waled_126', 'usr_parent_waled_24', 'usr_waled_126', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_25_usr_waled_127', 'usr_parent_waled_25', 'usr_waled_127', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_26_usr_waled_128', 'usr_parent_waled_26', 'usr_waled_128', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_27_usr_waled_130', 'usr_parent_waled_27', 'usr_waled_130', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_28_usr_waled_136', 'usr_parent_waled_28', 'usr_waled_136', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_29_usr_waled_137', 'usr_parent_waled_29', 'usr_waled_137', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_30_usr_waled_142', 'usr_parent_waled_30', 'usr_waled_142', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_31_usr_waled_148', 'usr_parent_waled_31', 'usr_waled_148', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_32_usr_waled_149', 'usr_parent_waled_32', 'usr_waled_149', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_33_usr_waled_150', 'usr_parent_waled_33', 'usr_waled_150', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_34_usr_waled_152', 'usr_parent_waled_34', 'usr_waled_152', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_35_usr_waled_153', 'usr_parent_waled_35', 'usr_waled_153', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_36_usr_waled_155', 'usr_parent_waled_36', 'usr_waled_155', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_37_usr_waled_156', 'usr_parent_waled_37', 'usr_waled_156', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_38_usr_waled_158', 'usr_parent_waled_38', 'usr_waled_158', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_39_usr_waled_16', 'usr_parent_waled_39', 'usr_waled_16', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_40_usr_waled_160', 'usr_parent_waled_40', 'usr_waled_160', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_41_usr_waled_162', 'usr_parent_waled_41', 'usr_waled_162', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_42_usr_waled_163', 'usr_parent_waled_42', 'usr_waled_163', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_43_usr_waled_164', 'usr_parent_waled_43', 'usr_waled_164', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_44_usr_waled_165', 'usr_parent_waled_44', 'usr_waled_165', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_45_usr_waled_166', 'usr_parent_waled_45', 'usr_waled_166', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_45_usr_waled_167', 'usr_parent_waled_45', 'usr_waled_167', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_46_usr_waled_169', 'usr_parent_waled_46', 'usr_waled_169', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_39_usr_waled_17', 'usr_parent_waled_39', 'usr_waled_17', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_47_usr_waled_170', 'usr_parent_waled_47', 'usr_waled_170', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_48_usr_waled_174', 'usr_parent_waled_48', 'usr_waled_174', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_49_usr_waled_176', 'usr_parent_waled_49', 'usr_waled_176', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_50_usr_waled_177', 'usr_parent_waled_50', 'usr_waled_177', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_51_usr_waled_18', 'usr_parent_waled_51', 'usr_waled_18', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_52_usr_waled_180', 'usr_parent_waled_52', 'usr_waled_180', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_53_usr_waled_182', 'usr_parent_waled_53', 'usr_waled_182', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_54_usr_waled_184', 'usr_parent_waled_54', 'usr_waled_184', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_55_usr_waled_185', 'usr_parent_waled_55', 'usr_waled_185', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_56_usr_waled_19', 'usr_parent_waled_56', 'usr_waled_19', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_57_usr_waled_191', 'usr_parent_waled_57', 'usr_waled_191', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_58_usr_waled_195', 'usr_parent_waled_58', 'usr_waled_195', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_59_usr_waled_197', 'usr_parent_waled_59', 'usr_waled_197', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_59_usr_waled_198', 'usr_parent_waled_59', 'usr_waled_198', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_60_usr_waled_2', 'usr_parent_waled_60', 'usr_waled_2', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_61_usr_waled_20', 'usr_parent_waled_61', 'usr_waled_20', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_62_usr_waled_200', 'usr_parent_waled_62', 'usr_waled_200', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_63_usr_waled_201', 'usr_parent_waled_63', 'usr_waled_201', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_64_usr_waled_202', 'usr_parent_waled_64', 'usr_waled_202', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_65_usr_waled_205', 'usr_parent_waled_65', 'usr_waled_205', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_65_usr_waled_206', 'usr_parent_waled_65', 'usr_waled_206', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_66_usr_waled_207', 'usr_parent_waled_66', 'usr_waled_207', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_61_usr_waled_21', 'usr_parent_waled_61', 'usr_waled_21', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_67_usr_waled_211', 'usr_parent_waled_67', 'usr_waled_211', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_68_usr_waled_213', 'usr_parent_waled_68', 'usr_waled_213', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_69_usr_waled_214', 'usr_parent_waled_69', 'usr_waled_214', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_70_usr_waled_219', 'usr_parent_waled_70', 'usr_waled_219', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_71_usr_waled_220', 'usr_parent_waled_71', 'usr_waled_220', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_72_usr_waled_224', 'usr_parent_waled_72', 'usr_waled_224', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_73_usr_waled_225', 'usr_parent_waled_73', 'usr_waled_225', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_74_usr_waled_226', 'usr_parent_waled_74', 'usr_waled_226', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_75_usr_waled_227', 'usr_parent_waled_75', 'usr_waled_227', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_76_usr_waled_228', 'usr_parent_waled_76', 'usr_waled_228', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_77_usr_waled_229', 'usr_parent_waled_77', 'usr_waled_229', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_78_usr_waled_23', 'usr_parent_waled_78', 'usr_waled_23', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_79_usr_waled_231', 'usr_parent_waled_79', 'usr_waled_231', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_80_usr_waled_236', 'usr_parent_waled_80', 'usr_waled_236', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_81_usr_waled_237', 'usr_parent_waled_81', 'usr_waled_237', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_82_usr_waled_238', 'usr_parent_waled_82', 'usr_waled_238', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_83_usr_waled_243', 'usr_parent_waled_83', 'usr_waled_243', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_84_usr_waled_246', 'usr_parent_waled_84', 'usr_waled_246', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_85_usr_waled_247', 'usr_parent_waled_85', 'usr_waled_247', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_86_usr_waled_252', 'usr_parent_waled_86', 'usr_waled_252', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_87_usr_waled_256', 'usr_parent_waled_87', 'usr_waled_256', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_88_usr_waled_257', 'usr_parent_waled_88', 'usr_waled_257', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_89_usr_waled_258', 'usr_parent_waled_89', 'usr_waled_258', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_90_usr_waled_259', 'usr_parent_waled_90', 'usr_waled_259', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_91_usr_waled_26', 'usr_parent_waled_91', 'usr_waled_26', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_92_usr_waled_260', 'usr_parent_waled_92', 'usr_waled_260', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_93_usr_waled_27', 'usr_parent_waled_93', 'usr_waled_27', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_94_usr_waled_271', 'usr_parent_waled_94', 'usr_waled_271', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_95_usr_waled_272', 'usr_parent_waled_95', 'usr_waled_272', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_96_usr_waled_274', 'usr_parent_waled_96', 'usr_waled_274', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_97_usr_waled_28', 'usr_parent_waled_97', 'usr_waled_28', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_98_usr_waled_280', 'usr_parent_waled_98', 'usr_waled_280', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_99_usr_waled_283', 'usr_parent_waled_99', 'usr_waled_283', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_100_usr_waled_287', 'usr_parent_waled_100', 'usr_waled_287', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_101_usr_waled_29', 'usr_parent_waled_101', 'usr_waled_29', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_102_usr_waled_291', 'usr_parent_waled_102', 'usr_waled_291', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_103_usr_waled_296', 'usr_parent_waled_103', 'usr_waled_296', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_104_usr_waled_298', 'usr_parent_waled_104', 'usr_waled_298', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_105_usr_waled_3', 'usr_parent_waled_105', 'usr_waled_3', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_106_usr_waled_30', 'usr_parent_waled_106', 'usr_waled_30', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_107_usr_waled_306', 'usr_parent_waled_107', 'usr_waled_306', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_108_usr_waled_307', 'usr_parent_waled_108', 'usr_waled_307', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_109_usr_waled_308', 'usr_parent_waled_109', 'usr_waled_308', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_110_usr_waled_31', 'usr_parent_waled_110', 'usr_waled_31', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_111_usr_waled_310', 'usr_parent_waled_111', 'usr_waled_310', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_112_usr_waled_316', 'usr_parent_waled_112', 'usr_waled_316', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_113_usr_waled_317', 'usr_parent_waled_113', 'usr_waled_317', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_114_usr_waled_32', 'usr_parent_waled_114', 'usr_waled_32', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_114_usr_waled_33', 'usr_parent_waled_114', 'usr_waled_33', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_115_usr_waled_332', 'usr_parent_waled_115', 'usr_waled_332', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_116_usr_waled_335', 'usr_parent_waled_116', 'usr_waled_335', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_117_usr_waled_337', 'usr_parent_waled_117', 'usr_waled_337', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_118_usr_waled_339', 'usr_parent_waled_118', 'usr_waled_339', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_114_usr_waled_34', 'usr_parent_waled_114', 'usr_waled_34', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_119_usr_waled_342', 'usr_parent_waled_119', 'usr_waled_342', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_120_usr_waled_35', 'usr_parent_waled_120', 'usr_waled_35', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_121_usr_waled_350', 'usr_parent_waled_121', 'usr_waled_350', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_122_usr_waled_351', 'usr_parent_waled_122', 'usr_waled_351', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_123_usr_waled_352', 'usr_parent_waled_123', 'usr_waled_352', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_124_usr_waled_353', 'usr_parent_waled_124', 'usr_waled_353', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_125_usr_waled_355', 'usr_parent_waled_125', 'usr_waled_355', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_126_usr_waled_36', 'usr_parent_waled_126', 'usr_waled_36', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_127_usr_waled_361', 'usr_parent_waled_127', 'usr_waled_361', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_128_usr_waled_365', 'usr_parent_waled_128', 'usr_waled_365', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_129_usr_waled_367', 'usr_parent_waled_129', 'usr_waled_367', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_130_usr_waled_368', 'usr_parent_waled_130', 'usr_waled_368', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_126_usr_waled_37', 'usr_parent_waled_126', 'usr_waled_37', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_131_usr_waled_377', 'usr_parent_waled_131', 'usr_waled_377', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_132_usr_waled_378', 'usr_parent_waled_132', 'usr_waled_378', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_133_usr_waled_381', 'usr_parent_waled_133', 'usr_waled_381', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_77_usr_waled_382', 'usr_parent_waled_77', 'usr_waled_382', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_134_usr_waled_387', 'usr_parent_waled_134', 'usr_waled_387', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_135_usr_waled_388', 'usr_parent_waled_135', 'usr_waled_388', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_136_usr_waled_39', 'usr_parent_waled_136', 'usr_waled_39', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_137_usr_waled_398', 'usr_parent_waled_137', 'usr_waled_398', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_138_usr_waled_399', 'usr_parent_waled_138', 'usr_waled_399', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_139_usr_waled_4', 'usr_parent_waled_139', 'usr_waled_4', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_136_usr_waled_40', 'usr_parent_waled_136', 'usr_waled_40', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_140_usr_waled_400', 'usr_parent_waled_140', 'usr_waled_400', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_141_usr_waled_41', 'usr_parent_waled_141', 'usr_waled_41', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_142_usr_waled_42', 'usr_parent_waled_142', 'usr_waled_42', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_143_usr_waled_43', 'usr_parent_waled_143', 'usr_waled_43', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_144_usr_waled_44', 'usr_parent_waled_144', 'usr_waled_44', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_145_usr_waled_45', 'usr_parent_waled_145', 'usr_waled_45', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_146_usr_waled_46', 'usr_parent_waled_146', 'usr_waled_46', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_147_usr_waled_47', 'usr_parent_waled_147', 'usr_waled_47', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_147_usr_waled_48', 'usr_parent_waled_147', 'usr_waled_48', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_148_usr_waled_49', 'usr_parent_waled_148', 'usr_waled_49', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_149_usr_waled_5', 'usr_parent_waled_149', 'usr_waled_5', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_150_usr_waled_50', 'usr_parent_waled_150', 'usr_waled_50', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_151_usr_waled_51', 'usr_parent_waled_151', 'usr_waled_51', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_152_usr_waled_52', 'usr_parent_waled_152', 'usr_waled_52', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_152_usr_waled_53', 'usr_parent_waled_152', 'usr_waled_53', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_153_usr_waled_54', 'usr_parent_waled_153', 'usr_waled_54', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_154_usr_waled_55', 'usr_parent_waled_154', 'usr_waled_55', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_153_usr_waled_57', 'usr_parent_waled_153', 'usr_waled_57', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_155_usr_waled_58', 'usr_parent_waled_155', 'usr_waled_58', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_156_usr_waled_59', 'usr_parent_waled_156', 'usr_waled_59', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_157_usr_waled_6', 'usr_parent_waled_157', 'usr_waled_6', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_158_usr_waled_60', 'usr_parent_waled_158', 'usr_waled_60', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_159_usr_waled_61', 'usr_parent_waled_159', 'usr_waled_61', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_160_usr_waled_63', 'usr_parent_waled_160', 'usr_waled_63', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_161_usr_waled_65', 'usr_parent_waled_161', 'usr_waled_65', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_162_usr_waled_66', 'usr_parent_waled_162', 'usr_waled_66', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_163_usr_waled_67', 'usr_parent_waled_163', 'usr_waled_67', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_164_usr_waled_68', 'usr_parent_waled_164', 'usr_waled_68', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_165_usr_waled_69', 'usr_parent_waled_165', 'usr_waled_69', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_166_usr_waled_7', 'usr_parent_waled_166', 'usr_waled_7', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_167_usr_waled_70', 'usr_parent_waled_167', 'usr_waled_70', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_168_usr_waled_71', 'usr_parent_waled_168', 'usr_waled_71', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_168_usr_waled_72', 'usr_parent_waled_168', 'usr_waled_72', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_169_usr_waled_73', 'usr_parent_waled_169', 'usr_waled_73', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_169_usr_waled_74', 'usr_parent_waled_169', 'usr_waled_74', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_169_usr_waled_75', 'usr_parent_waled_169', 'usr_waled_75', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_170_usr_waled_77', 'usr_parent_waled_170', 'usr_waled_77', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_171_usr_waled_78', 'usr_parent_waled_171', 'usr_waled_78', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_171_usr_waled_79', 'usr_parent_waled_171', 'usr_waled_79', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_172_usr_waled_8', 'usr_parent_waled_172', 'usr_waled_8', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_173_usr_waled_80', 'usr_parent_waled_173', 'usr_waled_80', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_174_usr_waled_81', 'usr_parent_waled_174', 'usr_waled_81', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_175_usr_waled_82', 'usr_parent_waled_175', 'usr_waled_82', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_176_usr_waled_83', 'usr_parent_waled_176', 'usr_waled_83', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_176_usr_waled_84', 'usr_parent_waled_176', 'usr_waled_84', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_177_usr_waled_85', 'usr_parent_waled_177', 'usr_waled_85', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_177_usr_waled_86', 'usr_parent_waled_177', 'usr_waled_86', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_178_usr_waled_88', 'usr_parent_waled_178', 'usr_waled_88', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_166_usr_waled_9', 'usr_parent_waled_166', 'usr_waled_9', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_179_usr_waled_90', 'usr_parent_waled_179', 'usr_waled_90', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_180_usr_waled_91', 'usr_parent_waled_180', 'usr_waled_91', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_181_usr_waled_92', 'usr_parent_waled_181', 'usr_waled_92', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_182_usr_waled_93', 'usr_parent_waled_182', 'usr_waled_93', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_183_usr_waled_94', 'usr_parent_waled_183', 'usr_waled_94', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_184_usr_waled_95', 'usr_parent_waled_184', 'usr_waled_95', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_185_usr_waled_96', 'usr_parent_waled_185', 'usr_waled_96', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_186_usr_waled_97', 'usr_parent_waled_186', 'usr_waled_97', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_187_usr_waled_98', 'usr_parent_waled_187', 'usr_waled_98', 'Guardian')
ON CONFLICT (id) DO NOTHING;
INSERT INTO parent_links (id, parent_id, student_id, relationship)
VALUES ('plink_usr_parent_waled_188_usr_waled_99', 'usr_parent_waled_188', 'usr_waled_99', 'Guardian')
ON CONFLICT (id) DO NOTHING;

-- Step 6: Insert Historical Attendance Records
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_1', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-06-12', 'present', 'All', 'gate_scanner', '2026-06-12 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_2', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-06-12', 'present', 'All', 'gate_scanner', '2026-06-12 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_3', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-05', 'present', 'All', 'gate_scanner', '2026-07-05 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_4', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-05', 'present', 'All', 'gate_scanner', '2026-07-05 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_5', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-05', 'present', 'All', 'gate_scanner', '2026-07-05 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_6', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-05', 'present', 'All', 'gate_scanner', '2026-07-05 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_7', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-06', 'present', 'All', 'gate_scanner', '2026-07-06 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_8', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-06', 'present', 'All', 'gate_scanner', '2026-07-06 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_9', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-06', 'present', 'All', 'gate_scanner', '2026-07-06 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_10', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-07', 'present', 'All', 'gate_scanner', '2026-07-07 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_11', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-08', 'present', 'All', 'gate_scanner', '2026-07-08 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_12', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-09', 'present', 'All', 'gate_scanner', '2026-07-09 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_13', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-11', 'present', 'All', 'gate_scanner', '2026-07-11 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_14', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-12', 'present', 'All', 'gate_scanner', '2026-07-12 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_15', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-13', 'present', 'All', 'gate_scanner', '2026-07-13 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_16', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-14', 'present', 'All', 'gate_scanner', '2026-07-14 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_17', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-14', 'present', 'All', 'gate_scanner', '2026-07-14 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_18', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-15', 'present', 'All', 'gate_scanner', '2026-07-15 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_19', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-15', 'present', 'All', 'gate_scanner', '2026-07-15 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_20', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-16', 'present', 'All', 'gate_scanner', '2026-07-16 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_21', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-16', 'present', 'All', 'gate_scanner', '2026-07-16 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_22', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-18', 'present', 'All', 'gate_scanner', '2026-07-18 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_23', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-19', 'present', 'All', 'gate_scanner', '2026-07-19 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_24', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-19', 'present', 'All', 'gate_scanner', '2026-07-19 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_25', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-20', 'present', 'All', 'gate_scanner', '2026-07-20 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_26', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-21', 'present', 'All', 'gate_scanner', '2026-07-21 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_27', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-22', 'present', 'All', 'gate_scanner', '2026-07-22 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_28', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-23', 'present', 'All', 'gate_scanner', '2026-07-23 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_29', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-25', 'present', 'All', 'gate_scanner', '2026-07-25 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_30', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-25', 'present', 'All', 'gate_scanner', '2026-07-25 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_31', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-26', 'present', 'All', 'gate_scanner', '2026-07-26 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_32', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-26', 'present', 'All', 'gate_scanner', '2026-07-26 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_33', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-26', 'present', 'All', 'gate_scanner', '2026-07-26 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_34', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-26', 'present', 'All', 'gate_scanner', '2026-07-26 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_35', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-26', 'present', 'All', 'gate_scanner', '2026-07-26 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_36', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-27', 'present', 'All', 'gate_scanner', '2026-07-27 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_37', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-27', 'present', 'All', 'gate_scanner', '2026-07-27 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_38', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-28', 'present', 'All', 'gate_scanner', '2026-07-28 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_39', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-28', 'present', 'All', 'gate_scanner', '2026-07-28 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_40', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-29', 'present', 'All', 'gate_scanner', '2026-07-29 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_41', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-30', 'present', 'All', 'gate_scanner', '2026-07-30 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_42', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-07-31', 'present', 'All', 'gate_scanner', '2026-07-31 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_43', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-01', 'present', 'All', 'gate_scanner', '2026-08-01 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_44', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-02', 'present', 'All', 'gate_scanner', '2026-08-02 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_45', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-02', 'present', 'All', 'gate_scanner', '2026-08-02 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_46', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-03', 'present', 'All', 'gate_scanner', '2026-08-03 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_47', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-04', 'present', 'All', 'gate_scanner', '2026-08-04 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_48', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-04', 'present', 'All', 'gate_scanner', '2026-08-04 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_49', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-05', 'present', 'All', 'gate_scanner', '2026-08-05 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_50', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-06', 'present', 'All', 'gate_scanner', '2026-08-06 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_51', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-08', 'present', 'All', 'gate_scanner', '2026-08-08 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_52', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-09', 'present', 'All', 'gate_scanner', '2026-08-09 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_53', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-09', 'present', 'All', 'gate_scanner', '2026-08-09 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_54', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-10', 'present', 'All', 'gate_scanner', '2026-08-10 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_55', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-11', 'present', 'All', 'gate_scanner', '2026-08-11 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_56', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-12', 'present', 'All', 'gate_scanner', '2026-08-12 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_57', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-12', 'present', 'All', 'gate_scanner', '2026-08-12 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_58', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-13', 'present', 'All', 'gate_scanner', '2026-08-13 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_59', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-13', 'present', 'All', 'gate_scanner', '2026-08-13 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_60', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-15', 'present', 'All', 'gate_scanner', '2026-08-15 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_61', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-15', 'present', 'All', 'gate_scanner', '2026-08-15 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_62', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-15', 'present', 'All', 'gate_scanner', '2026-08-15 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_63', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-15', 'present', 'All', 'gate_scanner', '2026-08-15 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_64', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-16', 'present', 'All', 'gate_scanner', '2026-08-16 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_65', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-16', 'present', 'All', 'gate_scanner', '2026-08-16 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_66', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-17', 'present', 'All', 'gate_scanner', '2026-08-17 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_67', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-18', 'present', 'All', 'gate_scanner', '2026-08-18 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_68', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-18', 'present', 'All', 'gate_scanner', '2026-08-18 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_69', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-18', 'present', 'All', 'gate_scanner', '2026-08-18 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_70', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-19', 'present', 'All', 'gate_scanner', '2026-08-19 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_71', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-20', 'present', 'All', 'gate_scanner', '2026-08-20 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_72', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-20', 'present', 'All', 'gate_scanner', '2026-08-20 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_73', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-22', 'present', 'All', 'gate_scanner', '2026-08-22 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_74', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-23', 'present', 'All', 'gate_scanner', '2026-08-23 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_75', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-24', 'present', 'All', 'gate_scanner', '2026-08-24 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_76', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-25', 'present', 'All', 'gate_scanner', '2026-08-25 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_77', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-26', 'present', 'All', 'gate_scanner', '2026-08-26 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_78', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-26', 'present', 'All', 'gate_scanner', '2026-08-26 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_79', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-29', 'present', 'All', 'gate_scanner', '2026-08-29 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_80', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-29', 'present', 'All', 'gate_scanner', '2026-08-29 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_81', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-30', 'present', 'All', 'gate_scanner', '2026-08-30 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_82', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-31', 'present', 'All', 'gate_scanner', '2026-08-31 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_83', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-08-31', 'present', 'All', 'gate_scanner', '2026-08-31 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_84', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-01', 'present', 'All', 'gate_scanner', '2026-09-01 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_85', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-02', 'present', 'All', 'gate_scanner', '2026-09-02 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_86', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-02', 'present', 'All', 'gate_scanner', '2026-09-02 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_87', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-03', 'present', 'All', 'gate_scanner', '2026-09-03 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_88', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-04', 'present', 'All', 'gate_scanner', '2026-09-04 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_89', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-05', 'present', 'All', 'gate_scanner', '2026-09-05 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_90', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-06', 'present', 'All', 'gate_scanner', '2026-09-06 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_91', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-07', 'present', 'All', 'gate_scanner', '2026-09-07 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_92', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-08', 'present', 'All', 'gate_scanner', '2026-09-08 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_93', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-09', 'present', 'All', 'gate_scanner', '2026-09-09 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_94', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-09', 'present', 'All', 'gate_scanner', '2026-09-09 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_95', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-10', 'present', 'All', 'gate_scanner', '2026-09-10 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_96', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-10', 'present', 'All', 'gate_scanner', '2026-09-10 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_97', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-10', 'present', 'All', 'gate_scanner', '2026-09-10 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_98', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-11', 'present', 'All', 'gate_scanner', '2026-09-11 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_99', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-12', 'present', 'All', 'gate_scanner', '2026-09-12 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_100', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-12', 'present', 'All', 'gate_scanner', '2026-09-12 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_101', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-13', 'present', 'All', 'gate_scanner', '2026-09-13 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_102', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-14', 'present', 'All', 'gate_scanner', '2026-09-14 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_103', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-15', 'present', 'All', 'gate_scanner', '2026-09-15 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_104', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-16', 'present', 'All', 'gate_scanner', '2026-09-16 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_105', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-17', 'present', 'All', 'gate_scanner', '2026-09-17 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_106', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-17', 'present', 'All', 'gate_scanner', '2026-09-17 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_107', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-18', 'present', 'All', 'gate_scanner', '2026-09-18 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_108', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-19', 'present', 'All', 'gate_scanner', '2026-09-19 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_109', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-19', 'present', 'All', 'gate_scanner', '2026-09-19 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_110', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-20', 'present', 'All', 'gate_scanner', '2026-09-20 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_111', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-21', 'present', 'All', 'gate_scanner', '2026-09-21 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_112', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-22', 'present', 'All', 'gate_scanner', '2026-09-22 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_113', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-22', 'present', 'All', 'gate_scanner', '2026-09-22 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_114', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-24', 'present', 'All', 'gate_scanner', '2026-09-24 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_115', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-24', 'present', 'All', 'gate_scanner', '2026-09-24 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_116', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-25', 'present', 'All', 'gate_scanner', '2026-09-25 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_117', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-26', 'present', 'All', 'gate_scanner', '2026-09-26 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_118', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-26', 'present', 'All', 'gate_scanner', '2026-09-26 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_119', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-27', 'present', 'All', 'gate_scanner', '2026-09-27 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_120', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-27', 'present', 'All', 'gate_scanner', '2026-09-27 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_121', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-27', 'present', 'All', 'gate_scanner', '2026-09-27 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_122', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-28', 'present', 'All', 'gate_scanner', '2026-09-28 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_123', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-28', 'present', 'All', 'gate_scanner', '2026-09-28 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_124', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-29', 'present', 'All', 'gate_scanner', '2026-09-29 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_125', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-30', 'present', 'All', 'gate_scanner', '2026-09-30 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_126', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-09-30', 'present', 'All', 'gate_scanner', '2026-09-30 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_127', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-01', 'present', 'All', 'gate_scanner', '2026-10-01 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_128', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-02', 'present', 'All', 'gate_scanner', '2026-10-02 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_129', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-03', 'present', 'All', 'gate_scanner', '2026-10-03 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_130', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-04', 'present', 'All', 'gate_scanner', '2026-10-04 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_131', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-05', 'present', 'All', 'gate_scanner', '2026-10-05 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_132', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-06', 'present', 'All', 'gate_scanner', '2026-10-06 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_133', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-07', 'present', 'All', 'gate_scanner', '2026-10-07 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_134', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-07', 'present', 'All', 'gate_scanner', '2026-10-07 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_135', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-08', 'present', 'All', 'gate_scanner', '2026-10-08 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_136', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-09', 'present', 'All', 'gate_scanner', '2026-10-09 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_137', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-09', 'present', 'All', 'gate_scanner', '2026-10-09 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_138', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-09', 'present', 'All', 'gate_scanner', '2026-10-09 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_139', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-10', 'present', 'All', 'gate_scanner', '2026-10-10 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_140', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-11', 'present', 'All', 'gate_scanner', '2026-10-11 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_141', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-11', 'present', 'All', 'gate_scanner', '2026-10-11 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_142', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-12', 'present', 'All', 'gate_scanner', '2026-10-12 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_143', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-13', 'present', 'All', 'gate_scanner', '2026-10-13 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_144', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-13', 'present', 'All', 'gate_scanner', '2026-10-13 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_145', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-13', 'present', 'All', 'gate_scanner', '2026-10-13 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_146', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-14', 'present', 'All', 'gate_scanner', '2026-10-14 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_147', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-15', 'present', 'All', 'gate_scanner', '2026-10-15 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_148', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-17', 'present', 'All', 'gate_scanner', '2026-10-17 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_149', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-18', 'present', 'All', 'gate_scanner', '2026-10-18 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_150', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-19', 'present', 'All', 'gate_scanner', '2026-10-19 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_151', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-20', 'present', 'All', 'gate_scanner', '2026-10-20 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_152', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-20', 'present', 'All', 'gate_scanner', '2026-10-20 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_153', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-21', 'present', 'All', 'gate_scanner', '2026-10-21 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_154', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-22', 'present', 'All', 'gate_scanner', '2026-10-22 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_155', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-24', 'present', 'All', 'gate_scanner', '2026-10-24 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_156', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-25', 'present', 'All', 'gate_scanner', '2026-10-25 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_157', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-26', 'present', 'All', 'gate_scanner', '2026-10-26 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_158', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-27', 'present', 'All', 'gate_scanner', '2026-10-27 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_159', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-28', 'present', 'All', 'gate_scanner', '2026-10-28 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_160', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-29', 'present', 'All', 'gate_scanner', '2026-10-29 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_161', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-30', 'present', 'All', 'gate_scanner', '2026-10-30 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_162', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-10-31', 'present', 'All', 'gate_scanner', '2026-10-31 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_163', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-01', 'present', 'All', 'gate_scanner', '2026-11-01 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_164', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-02', 'present', 'All', 'gate_scanner', '2026-11-02 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_165', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-03', 'present', 'All', 'gate_scanner', '2026-11-03 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_166', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-04', 'present', 'All', 'gate_scanner', '2026-11-04 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_167', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-04', 'present', 'All', 'gate_scanner', '2026-11-04 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_168', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-05', 'present', 'All', 'gate_scanner', '2026-11-05 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_169', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-07', 'present', 'All', 'gate_scanner', '2026-11-07 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_170', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-08', 'present', 'All', 'gate_scanner', '2026-11-08 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_171', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-09', 'present', 'All', 'gate_scanner', '2026-11-09 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_172', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-10', 'present', 'All', 'gate_scanner', '2026-11-10 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_173', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-11', 'present', 'All', 'gate_scanner', '2026-11-11 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_174', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-12', 'present', 'All', 'gate_scanner', '2026-11-12 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_175', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-14', 'present', 'All', 'gate_scanner', '2026-11-14 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_in_176', 'usr_waled_1', 'طالب سنتر الوليد', 'حضور سنتر الوليد — بوابات الدخول', '2026-11-15', 'present', 'All', 'gate_scanner', '2026-11-15 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_1', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-08-05', 'absent', 'All', 'teacher', '2026-08-05 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_2', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-08-09', 'absent', 'All', 'teacher', '2026-08-09 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_3', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-08-12', 'absent', 'All', 'teacher', '2026-08-12 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_4', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-08-16', 'absent', 'All', 'teacher', '2026-08-16 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_5', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-08-19', 'absent', 'All', 'teacher', '2026-08-19 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_6', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-08-23', 'absent', 'All', 'teacher', '2026-08-23 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_7', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-08-26', 'absent', 'All', 'teacher', '2026-08-26 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_8', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-08-30', 'absent', 'All', 'teacher', '2026-08-30 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_9', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-09-02', 'absent', 'All', 'teacher', '2026-09-02 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_10', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-09-06', 'absent', 'All', 'teacher', '2026-09-06 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_11', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-09-09', 'absent', 'All', 'teacher', '2026-09-09 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_12', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-09-13', 'absent', 'All', 'teacher', '2026-09-13 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_13', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-09-16', 'absent', 'All', 'teacher', '2026-09-16 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_14', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-09-20', 'absent', 'All', 'teacher', '2026-09-20 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_15', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-09-27', 'absent', 'All', 'teacher', '2026-09-27 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_16', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-09-30', 'absent', 'All', 'teacher', '2026-09-30 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_17', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-10-04', 'absent', 'All', 'teacher', '2026-10-04 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_18', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-10-07', 'absent', 'All', 'teacher', '2026-10-07 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_19', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-10-11', 'absent', 'All', 'teacher', '2026-10-11 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_20', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-10-14', 'absent', 'All', 'teacher', '2026-10-14 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_21', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-10-18', 'absent', 'All', 'teacher', '2026-10-18 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_22', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-10-21', 'absent', 'All', 'teacher', '2026-10-21 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_23', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-10-25', 'absent', 'All', 'teacher', '2026-10-25 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_24', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-10-28', 'absent', 'All', 'teacher', '2026-10-28 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_25', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-11-01', 'absent', 'All', 'teacher', '2026-11-01 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_26', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-11-04', 'absent', 'All', 'teacher', '2026-11-04 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_27', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-11-08', 'absent', 'All', 'teacher', '2026-11-08 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_28', 'usr_waled_222', 'ملك حسن بدران', 'غياب سنتر الوليد', '2026-11-11', 'absent', 'All', 'teacher', '2026-11-11 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_29', 'usr_waled_222', 'Student', 'غياب سنتر الوليد', '2026-11-02', 'absent', 'All', 'teacher', '2026-11-02 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_30', 'usr_waled_222', 'Student', 'غياب سنتر الوليد', '2026-11-03', 'absent', 'All', 'teacher', '2026-11-03 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_31', 'usr_waled_222', 'Student', 'غياب سنتر الوليد', '2026-11-05', 'absent', 'All', 'teacher', '2026-11-05 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_32', 'usr_waled_222', 'Student', 'غياب سنتر الوليد', '2026-11-06', 'absent', 'All', 'teacher', '2026-11-06 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_33', 'usr_waled_222', 'Student', 'غياب سنتر الوليد', '2026-11-07', 'absent', 'All', 'teacher', '2026-11-07 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_34', 'usr_waled_222', 'Student', 'غياب سنتر الوليد', '2026-11-09', 'absent', 'All', 'teacher', '2026-11-09 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_35', 'usr_waled_222', 'Student', 'غياب سنتر الوليد', '2026-11-10', 'absent', 'All', 'teacher', '2026-11-10 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_36', 'usr_waled_222', 'Student', 'غياب سنتر الوليد', '2026-11-12', 'absent', 'All', 'teacher', '2026-11-12 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_37', 'usr_waled_222', 'Student', 'غياب سنتر الوليد', '2026-11-13', 'absent', 'All', 'teacher', '2026-11-13 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_38', 'usr_waled_222', 'Student', 'غياب سنتر الوليد', '2026-11-14', 'absent', 'All', 'teacher', '2026-11-14 00:00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by, created_at)
VALUES ('att_hist_abs_39', 'usr_waled_222', 'Student', 'غياب سنتر الوليد', '2026-11-15', 'absent', 'All', 'teacher', '2026-11-15 00:00:00')
ON CONFLICT (id) DO NOTHING;

COMMIT;
