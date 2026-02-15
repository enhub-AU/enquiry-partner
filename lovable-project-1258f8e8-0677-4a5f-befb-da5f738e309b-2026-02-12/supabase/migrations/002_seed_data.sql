-- ============================================================
-- 002_seed_data.sql
-- Test data. Replace YOUR_USER_UUID_HERE with your auth user UUID.
-- ============================================================

do $$
declare
  v_user uuid := 'YOUR_USER_UUID_HERE';  -- <-- REPLACE THIS
  v_c1 uuid; v_c2 uuid; v_c3 uuid;
  v_e1 uuid; v_e2 uuid; v_e3 uuid;
begin

  -- Contacts
  insert into contacts (profile_id, name, email, phone, source) values
    (v_user, 'Sarah Mitchell', 'sarah.m@gmail.com', '0412 345 678', 'REA')
    returning id into v_c1;
  insert into contacts (profile_id, name, email, phone, source) values
    (v_user, 'James Chen', 'james.chen@outlook.com', '0423 987 654', 'Domain')
    returning id into v_c2;
  insert into contacts (profile_id, name, email, phone, source) values
    (v_user, 'Lisa Patel', 'lisa.p@gmail.com', '0434 567 890', 'Email')
    returning id into v_c3;

  -- Enquiries
  insert into enquiries (profile_id, contact_id, subject, status, category, property_address, property_price_guide, is_read, last_activity_at)
  values (v_user, v_c1, 'Inspection request — 42 Harbour View Drive', 'hot', 'inspection',
    '42 Harbour View Drive, Mosman', '$4,200,000 – $4,600,000', false, now() - interval '25 minutes')
  returning id into v_e1;

  insert into enquiries (profile_id, contact_id, subject, status, category, property_address, property_price_guide, is_read, last_activity_at)
  values (v_user, v_c2, 'Price guide for Elm St', 'auto_handled', 'price_only',
    '18 Elm Street, Surry Hills', '$1,850,000 – $2,050,000', true, now() - interval '3 hours')
  returning id into v_e2;

  insert into enquiries (profile_id, contact_id, subject, status, category, property_address, property_price_guide, is_read, last_activity_at)
  values (v_user, v_c3, 'Questions about Harbour View Drive', 'needs_attention', 'multi_question',
    '42 Harbour View Drive, Mosman', '$4,200,000 – $4,600,000', false, now() - interval '45 minutes')
  returning id into v_e3;

  -- Messages
  insert into messages (enquiry_id, sender, content, channel, status, created_at) values
  (v_e1, 'client', 'Hi, I''d love to arrange a private inspection for 42 Harbour View Drive this weekend. Is the price guide still current?', 'email', 'sent', now() - interval '25 minutes'),
  (v_e1, 'ai', 'Hi Sarah, the current price guide is $4,200,000 – $4,600,000. I''d be happy to arrange a private inspection — would Saturday or Sunday work better?', 'email', 'pending_approval', now() - interval '20 minutes'),

  (v_e2, 'client', 'What''s the price guide on the Elm St place?', 'email', 'sent', now() - interval '3 hours'),
  (v_e2, 'ai', 'Hi James, the price guide for 18 Elm Street is $1,850,000 – $2,050,000. Would you like to arrange a viewing?', 'email', 'sent', now() - interval '2 hours 50 minutes'),

  (v_e3, 'client', 'Hi, when is the next open inspection for Harbour View Drive? Also, is there parking for two cars?', 'email', 'sent', now() - interval '45 minutes'),
  (v_e3, 'ai', 'Hi Lisa, the next open inspection is Saturday 11:00am. The property has a double garage. Would you like me to register you?', 'email', 'pending_approval', now() - interval '44 minutes');

end;
$$;
