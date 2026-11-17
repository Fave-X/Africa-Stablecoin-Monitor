-- 15_eth_concentration_daily.sql — replaces 12. Top-10 sender share per DAY, so before/after
-- can be compared like for like (same weekdays, flagged days excluded) in the pipeline.
-- Save result as data/raw/eth_concentration_daily.csv
-- Columns: day, chain, token, top10_share, senders

DECLARE start_ts TIMESTAMP DEFAULT TIMESTAMP('2026-10-05');
DECLARE end_ts   TIMESTAMP DEFAULT TIMESTAMP('2026-11-16');   -- same last day as the size bands (15 Nov)

WITH t AS (
  SELECT DATE(block_timestamp) AS day,
         IF(token_address = '0xdac17f958d2ee523a2206206994597c13d831ec7', 'USDT', 'USDC') AS token,
         from_address, SAFE_CAST(value AS BIGNUMERIC) / 1e6 AS amt
  FROM `bigquery-public-data.crypto_ethereum.token_transfers`
  WHERE block_timestamp >= start_ts AND block_timestamp < end_ts
    AND token_address IN ('0xdac17f958d2ee523a2206206994597c13d831ec7',
                          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    AND from_address != '0x0000000000000000000000000000000000000000'
    AND to_address   != '0x0000000000000000000000000000000000000000'
),
by_sender AS (SELECT day, token, from_address, SUM(amt) AS vol FROM t GROUP BY 1, 2, 3),
ranked AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY day, token ORDER BY vol DESC) AS rk FROM by_sender)
SELECT day, 'ethereum' AS chain, token,
       CAST(SUM(IF(rk <= 10, vol, 0)) / SUM(vol) AS FLOAT64) AS top10_share,
       COUNT(*) AS senders
FROM ranked
GROUP BY day, token
ORDER BY day, token;
