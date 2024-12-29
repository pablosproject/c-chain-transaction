-- Add index for pure value-based queries without block info (value based)
CREATE INDEX idx_transactions_value ON transactions(
    value DESC
);

-- Add index for address-specific queries
CREATE INDEX idx_transactions_from_address ON transactions(from_address, block_number DESC, tx_index DESC);
CREATE INDEX idx_transactions_to_address ON transactions(to_address, block_number DESC, tx_index DESC);

-- Index for count operations
CREATE INDEX idx_transactions_addresses ON transactions(
    from_address,
    to_address
) WHERE from_address IS NOT NULL OR to_address IS NOT NULL;
