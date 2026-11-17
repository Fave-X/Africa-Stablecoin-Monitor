-- 20_tron_size_bands.sql — ONLY if check D showed an affordable scan (well under your free 1 TB).
-- The Tron logs table is not partitioned, so date filters may not cut the bytes scanned.
-- ALWAYS read the dry-run estimate before pressing Run.
-- Save result as data/raw/tron_size_bands.csv  (then set TRON_MODE=bigquery in .env)
-- Columns: day, token, band, transfers, volume_usd

WITH t AS (
  SELECT
    DATE(block_timestamp) AS day,
    SAFE_CAST(data AS INT64) / 1e6 AS amt,   -- same cast as Google's own Tron USDT example
    topics[SAFE_OFFSET(1)] AS from_topic,
    topics[SAFE_OFFSET(2)] AS to_topic
  FROM `bigquery-public-data.goog_blockchain_tron_mainnet_us.logs`
  WHERE address = '0xa614f803b6fd780986a42c78ec9c7f77e6ded13c'
    AND ARRAY_LENGTH(topics) = 3
    AND topics[OFFSET(0)] = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    AND block_timestamp >= TIMESTAMP('2026-10-05')
    AND block_timestamp <  TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY)
)
SELECT
  day, 'USDT' AS token,
  CASE
    WHEN amt < 1000   THEN '<1k'
    WHEN amt < 10000  THEN '1k-10k'
    WHEN amt < 100000 THEN '10k-100k'
    ELSE '100k+'
  END AS band,
  COUNT(*) AS transfers,
  ROUND(SUM(amt), 2) AS volume_usd
FROM t
WHERE amt > 0
  -- exclude mints/burns (zero address in topic)
  AND from_topic != '0x0000000000000000000000000000000000000000000000000000000000000000'
  AND to_topic   != '0x0000000000000000000000000000000000000000000000000000000000000000'
GROUP BY day, token, band
ORDER BY day, band;

-- NOTE: SAFE_CAST returns NULL instead of failing. After running, check that few rows were dropped:
--   if COUNT of NULL amounts is large, inspect `SELECT data ... LIMIT 5` and adjust the cast.
