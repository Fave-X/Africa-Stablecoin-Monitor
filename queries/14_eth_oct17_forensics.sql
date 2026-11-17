-- 14_eth_oct17_forensics.sql — what was the $170B USDT spike on Saturday 17 Oct 2026?
-- One day of data only, so it's cheap. No need to save the result: screenshot it.
-- Shows the 15 sender→receiver pairs that moved the most USDT in transfers of $100k+,
-- whether each side is a smart contract, the time span, and one sample transaction to open on Etherscan.

DECLARE d DATE DEFAULT '2026-10-17';

WITH big AS (
  SELECT from_address, to_address, transaction_hash, block_timestamp,
         SAFE_CAST(value AS BIGNUMERIC) / 1e6 AS amt
  FROM `bigquery-public-data.crypto_ethereum.token_transfers`
  WHERE block_timestamp >= TIMESTAMP(d)
    AND block_timestamp <  TIMESTAMP(DATE_ADD(d, INTERVAL 1 DAY))
    AND token_address = '0xdac17f958d2ee523a2206206994597c13d831ec7'
    AND from_address != '0x0000000000000000000000000000000000000000'
    AND to_address   != '0x0000000000000000000000000000000000000000'
),
contracts AS (SELECT DISTINCT address FROM `bigquery-public-data.crypto_ethereum.contracts`),
day_total AS (SELECT SUM(amt) AS v FROM big WHERE amt >= 100000)
SELECT
  b.from_address, b.to_address,
  COUNT(*) AS transfers,
  COUNT(DISTINCT b.transaction_hash) AS txs,
  ROUND(CAST(SUM(b.amt) AS FLOAT64) / 1e9, 2) AS usd_bn,
  ROUND(CAST(SUM(b.amt) / ANY_VALUE(dt.v) AS FLOAT64) * 100, 1) AS pct_of_day_100k,
  b.from_address IN (SELECT address FROM contracts) AS from_is_contract,
  b.to_address   IN (SELECT address FROM contracts) AS to_is_contract,
  FORMAT_TIMESTAMP('%H:%M', MIN(b.block_timestamp)) AS first_utc,
  FORMAT_TIMESTAMP('%H:%M', MAX(b.block_timestamp)) AS last_utc,
  ANY_VALUE(b.transaction_hash) AS sample_tx
FROM big b CROSS JOIN day_total dt
WHERE b.amt >= 100000
GROUP BY b.from_address, b.to_address
ORDER BY usd_bn DESC
LIMIT 15;
