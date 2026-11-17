-- 00_checks.sql — run these BEFORE anything else.
-- Each one is cheap. For D, only read the dry-run estimate; don't press Run.

-- A. Is the community Ethereum table current? (expect a timestamp within the last day)
SELECT MAX(block_timestamp) AS latest
FROM `bigquery-public-data.crypto_ethereum.token_transfers`
WHERE block_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 DAY);

-- B. Is Google's managed Ethereum dataset current?
--    If it says 'Not found', swap goog_blockchain_ethereum_mainnet_us for blockchain_analytics_ethereum_mainnet_us
SELECT MAX(block_timestamp) AS latest
FROM `bigquery-public-data.goog_blockchain_ethereum_mainnet_us.logs`
WHERE block_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 DAY);

-- C1. Tron logs table: size and row count (metadata only, cheap)
SELECT table_id, ROUND(size_bytes / 1e12, 2) AS size_tb, row_count
FROM `bigquery-public-data.goog_blockchain_tron_mainnet_us.__TABLES__`
WHERE table_id = 'logs';

-- C2. Tron logs table: is it partitioned / clustered? Look for PARTITION BY and CLUSTER BY in the ddl column.
SELECT ddl
FROM `bigquery-public-data.goog_blockchain_tron_mainnet_us.INFORMATION_SCHEMA.TABLES`
WHERE table_name = 'logs';

-- D. Tron dry run — paste, read "This query will process X", DO NOT RUN if X is in TB.
SELECT COUNT(*) AS n
FROM `bigquery-public-data.goog_blockchain_tron_mainnet_us.logs`
WHERE address = '0xa614f803b6fd780986a42c78ec9c7f77e6ded13c'
  AND DATE(block_timestamp) = '2026-11-10';
