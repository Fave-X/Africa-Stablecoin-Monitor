-- 10_eth_size_bands.sql
-- Daily USDT/USDC transfers on Ethereum by size band. Mints/burns excluded.
-- Save result as data/raw/eth_size_bands.csv
-- Columns: day, token, band, transfers, volume_usd

DECLARE start_ts TIMESTAMP DEFAULT TIMESTAMP('2026-10-05');
DECLARE end_ts   TIMESTAMP DEFAULT TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY);  -- excludes today's partial day

SELECT
  DATE(block_timestamp) AS day,
  IF(token_address = '0xdac17f958d2ee523a2206206994597c13d831ec7', 'USDT', 'USDC') AS token,
  CASE
    WHEN amt < 1000   THEN '<1k'
    WHEN amt < 10000  THEN '1k-10k'
    WHEN amt < 100000 THEN '10k-100k'
    ELSE '100k+'
  END AS band,
  COUNT(*) AS transfers,
  ROUND(SUM(amt), 2) AS volume_usd
FROM (
  SELECT block_timestamp, token_address,
         SAFE_CAST(value AS BIGNUMERIC) / 1e6 AS amt
  FROM `bigquery-public-data.crypto_ethereum.token_transfers`
  WHERE block_timestamp >= start_ts AND block_timestamp < end_ts
    AND token_address IN ('0xdac17f958d2ee523a2206206994597c13d831ec7',
                          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    AND from_address != '0x0000000000000000000000000000000000000000'
    AND to_address   != '0x0000000000000000000000000000000000000000'
)
WHERE amt > 0
GROUP BY day, token, band
ORDER BY day, token, band;
