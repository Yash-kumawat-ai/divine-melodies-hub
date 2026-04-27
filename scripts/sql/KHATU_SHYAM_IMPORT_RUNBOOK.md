# Khatu Shyam 12-Bhajan Import Runbook

## Scope
This runbook imports/reconciles exactly these 12 titles under deity_id=9 (Khatu Shyam):
1. Shyam Charno Mein
2. Adhi Raat Ko Shyam Dhani
3. Mujhe Khatu Bulalo
4. Khatu Wale Teri Mehfil
5. Khatu Wale Das Banale
6. Baba Shyam Hi Shyam
7. Teri Khatu Nagri Mein Zindagi Bitaunga
8. Tera Jadu Khatu Wale
9. Shyam Leele Ghode Wala
10. Shyam Ke Jaisa Koi Lakhdatar
11. Khatu Wala Mere Sath Hai
12. Shyam Khatu Wale

## Files
- scripts/sql/khatu_shyam_execute_all.sql
- scripts/sql/khatu_shyam_rollback.sql
- supabase/migrations/011_seed_khatu_shyam_bhajans.sql
- supabase/migrations/012_reconcile_khatu_shyam_curated_set.sql
- SQL_VERIFICATION_QUERIES.md (Part 7)

## Recommended Execution
1. Run migration 011 in Supabase SQL Editor.
2. Run migration 012 in Supabase SQL Editor.
3. Run Part 7 queries from SQL_VERIFICATION_QUERIES.md.

## Optional Single Script
Run scripts/sql/khatu_shyam_execute_all.sql.
Note: this script performs reconciliation and quick verification. If missing_count > 0, run migration 011 first.

## Expected Results
- All 12 titles present for deity_id=9.
- No duplicates for normalized title within deity_id=9.
- No rows for these 12 titles under deity_id=1.
- Curated singer values applied where provided.

## Rollback
Use scripts/sql/khatu_shyam_rollback.sql.
- Default behavior: metadata rollback only.
- Optional hard-delete section is commented out and must be manually enabled.
