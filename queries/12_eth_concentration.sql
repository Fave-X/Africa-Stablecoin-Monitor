-- 12_eth_concentration.sql
-- Share of window volume sent by the 10 largest sending addresses, per token and window.
-- Save result as data/raw/eth_concentration.csv
-- Columns: chain, token, window, top10_share, senders

DECLARE base_start TIMESTAMP DEFAULT TIMESTAMP('2026-10-05');
DECLARE post_start TIMESTAMP DEFAULT TIMESTAMP('2026-11-05');
DECLARE end_ts     TIMESTAMP DEFAULT TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY);

WITH t AS (
  SELECT
    IF(token_address = '0xdac17f958d2ee523a2206206994597c13d831ec7', 'USDT', 'USDC') AS token,
    IF(block_timestamp < post_start, 'baseline', 'post') AS win,
    from_address,
    SAFE_CAST(value AS BIGNUMERIC) / 1e6 AS amt
  FROM `bigquery-public-data.crypto_ethereum.token_transfers`
  WHERE block_timestamp >= base_start AND block_timestamp < end_ts
    AND token_address IN ('0xdac17f958d2ee523a2206206994597c13d831ec7',
                          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    AND from_address != '0x0000000000000000000000000000000000000000'
    AND to_address   != '0x0000000000000000000000000000000000000000'
),
by_sender AS (
  SELECT token, win, from_address, SUM(amt) AS vol
  FROM t GROUP BY token, win, from_address
),
ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY token, win ORDER BY vol DESC) AS rk
  FROM by_sender
)
SELECT
  'ethereum' AS chain, token, win AS `window`,
  CAST(SUM(IF(rk <= 10, vol, 0)) / SUM(vol) AS FLOAT64) AS top10_share,
  COUNT(*) AS senders
FROM ranked
GROUP BY token, win
ORDER BY token, win;
