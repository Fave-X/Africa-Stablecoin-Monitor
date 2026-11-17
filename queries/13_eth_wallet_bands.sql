-- 13_eth_wallet_bands.sql
-- "Ordinary wallets only": the same daily size bands as query 10, but keeping only transfers
-- where BOTH sides look like ordinary people or small businesses:
--   1. neither address is a smart contract (DEX pools, routers, bridges, multisigs, bots), and
--   2. neither address is a heavy hitter: 1,000+ USDT/USDC transfers in the whole window
--      (exchange hot wallets, market makers, payment processors' omnibus wallets).
-- What's left is the closest public proxy for wallet-to-wallet payments.
-- Save result as data/raw/eth_wallet_bands.csv
-- Columns: day, token, band, transfers, volume_usd
-- Expected scan: check the estimate (top right) before running; it should be well under 100 GB.

DECLARE start_ts TIMESTAMP DEFAULT TIMESTAMP('2026-10-05');
DECLARE end_ts   TIMESTAMP DEFAULT TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY);  -- excludes today's partial day
DECLARE heavy_min INT64 DEFAULT 1000;

WITH t AS (
  SELECT block_timestamp, token_address, from_address, to_address,
         SAFE_CAST(value AS BIGNUMERIC) / 1e6 AS amt
  FROM `bigquery-public-data.crypto_ethereum.token_transfers`
  WHERE block_timestamp >= start_ts AND block_timestamp < end_ts
    AND token_address IN ('0xdac17f958d2ee523a2206206994597c13d831ec7',
                          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    AND from_address != '0x0000000000000000000000000000000000000000'
    AND to_address   != '0x0000000000000000000000000000000000000000'
),
heavy AS (
  SELECT addr FROM (
    SELECT from_address AS addr FROM t
    UNION ALL
    SELECT to_address FROM t
  )
  GROUP BY addr
  HAVING COUNT(*) >= heavy_min
),
excluded AS (
  SELECT addr FROM heavy
  UNION DISTINCT
  SELECT address FROM `bigquery-public-data.crypto_ethereum.contracts`
),
wallet_tx AS (
  SELECT t.*
  FROM t
  LEFT JOIN excluded ef ON ef.addr = t.from_address
  LEFT JOIN excluded et ON et.addr = t.to_address
  WHERE ef.addr IS NULL AND et.addr IS NULL AND t.amt > 0
)
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
FROM wallet_tx
GROUP BY day, token, band
ORDER BY day, token, band;
