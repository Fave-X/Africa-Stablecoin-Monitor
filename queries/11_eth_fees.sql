-- 11_eth_fees.sql
-- Fee of a plain USDT/USDC transfer on Ethereum: transactions sent directly to the token
-- contract (excludes DEX swaps / batchers). Fee in ETH; converted to USD in Python.
-- Save result as data/raw/eth_fees.csv
-- Columns: day, token, n_tx, median_fee_eth, p90_fee_eth

DECLARE start_ts TIMESTAMP DEFAULT TIMESTAMP('2026-10-05');
DECLARE end_ts   TIMESTAMP DEFAULT TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY);

WITH tx AS (
  SELECT
    DATE(block_timestamp) AS day,
    IF(to_address = '0xdac17f958d2ee523a2206206994597c13d831ec7', 'USDT', 'USDC') AS token,
    CAST(receipt_gas_used AS BIGNUMERIC)
      * CAST(COALESCE(receipt_effective_gas_price, gas_price) AS BIGNUMERIC) / 1e18 AS fee_eth
  FROM `bigquery-public-data.crypto_ethereum.transactions`
  WHERE block_timestamp >= start_ts AND block_timestamp < end_ts
    AND to_address IN ('0xdac17f958d2ee523a2206206994597c13d831ec7',
                       '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    AND receipt_status = 1
    AND STARTS_WITH(input, '0xa9059cbb')   -- transfer(address,uint256)
)
SELECT
  day, token,
  COUNT(*) AS n_tx,
  CAST(APPROX_QUANTILES(fee_eth, 100)[OFFSET(50)] AS FLOAT64) AS median_fee_eth,
  CAST(APPROX_QUANTILES(fee_eth, 100)[OFFSET(90)] AS FLOAT64) AS p90_fee_eth
FROM tx
GROUP BY day, token
ORDER BY day, token;
