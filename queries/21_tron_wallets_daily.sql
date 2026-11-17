-- 21_tron_wallets_daily.sql — Tron USDT, two things in one scan (~60–70 GB; check the estimate first):
--   kind = 'wallet_band' : size bands for ordinary wallets only (neither side made 1,000+ USDT
--                          transfers in the window: removes exchange hot wallets, market makers,
--                          payment processors and bots). The Tron dataset has no contract list,
--                          so this filter is activity-based only.
--   kind = 'top10'       : share of each day's volume sent by the 10 largest senders.
-- Save result as data/raw/tron_wallets_daily.csv
-- Columns: kind, day, band, transfers, volume_usd, top10_share, senders

DECLARE start_ts TIMESTAMP DEFAULT TIMESTAMP('2026-10-05');
DECLARE end_ts   TIMESTAMP DEFAULT TIMESTAMP('2026-11-16');
DECLARE heavy_min INT64 DEFAULT 1000;
DECLARE zero STRING DEFAULT '0x0000000000000000000000000000000000000000000000000000000000000000';

WITH t AS (
  SELECT DATE(block_timestamp) AS day,
         topics[SAFE_OFFSET(1)] AS from_topic,
         topics[SAFE_OFFSET(2)] AS to_topic,
         SAFE_CAST(data AS INT64) / 1e6 AS amt
  FROM `bigquery-public-data.goog_blockchain_tron_mainnet_us.logs`
  WHERE address = '0xa614f803b6fd780986a42c78ec9c7f77e6ded13c'
    AND ARRAY_LENGTH(topics) = 3
    AND topics[OFFSET(0)] = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    AND block_timestamp >= start_ts AND block_timestamp < end_ts
),
clean AS (
  SELECT * FROM t WHERE amt > 0 AND from_topic != zero AND to_topic != zero
),
heavy AS (
  SELECT a FROM (SELECT from_topic AS a FROM clean UNION ALL SELECT to_topic FROM clean)
  GROUP BY a HAVING COUNT(*) >= heavy_min
),
wallet AS (
  SELECT c.* FROM clean c
  LEFT JOIN heavy hf ON hf.a = c.from_topic
  LEFT JOIN heavy ht ON ht.a = c.to_topic
  WHERE hf.a IS NULL AND ht.a IS NULL
),
by_sender AS (SELECT day, from_topic, SUM(amt) AS vol FROM clean GROUP BY 1, 2),
ranked AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY day ORDER BY vol DESC) AS rk FROM by_sender)
SELECT 'wallet_band' AS kind, day,
       CASE WHEN amt < 1000 THEN '<1k' WHEN amt < 10000 THEN '1k-10k'
            WHEN amt < 100000 THEN '10k-100k' ELSE '100k+' END AS band,
       COUNT(*) AS transfers, ROUND(SUM(amt), 2) AS volume_usd,
       CAST(NULL AS FLOAT64) AS top10_share, CAST(NULL AS INT64) AS senders
FROM wallet GROUP BY day, band
UNION ALL
SELECT 'top10', day, CAST(NULL AS STRING), CAST(NULL AS INT64), ROUND(SUM(vol), 2),
       SUM(IF(rk <= 10, vol, 0)) / SUM(vol), COUNT(*)
FROM ranked GROUP BY day
ORDER BY kind, day, band;
