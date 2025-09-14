-- migrate_v29.sql
-- Zet credits van honden over naar klanten (user_id)

INSERT INTO credit_ledger (user_id, delta, reason)
SELECT user_id, SUM(credits), 'migration_v29'
FROM dogs
GROUP BY user_id;

UPDATE dogs SET credits = 0;
