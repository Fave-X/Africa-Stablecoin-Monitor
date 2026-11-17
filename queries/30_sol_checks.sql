-- 30_sol_checks.sql — Solana checks. Run ONE block at a time (select it, then Run).
-- Mints: USDC EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v · USDT Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB

-- S1 · What tables and columns exist? (metadata only, free)
SELECT table_name, column_name, data_type, is_partitioning_column
FROM `bigquery-public-data.crypto_solana_mainnet_us.INFORMATION_SCHEMA.COLUMNS`
WHERE LOWER(table_name) LIKE '%transfer%' OR LOWER(table_name) LIKE '%transaction%'
ORDER BY table_name, ordinal_position;
