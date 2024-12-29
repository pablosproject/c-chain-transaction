-- All bigint data are represented as NUMERIC to make the schema more flexible and to avoid any data loss.
CREATE TABLE transactions (
    -- Primary fields
    block_number NUMERIC NOT NULL,
    tx_index INTEGER NOT NULL,
    -- Transaction data
    timestamp TIMESTAMP NOT NULL,
    status BOOLEAN NOT NULL,
    from_address VARCHAR(60) NOT NULL, -- The `from` address is in C-Chain Bech32 format
    to_address VARCHAR(42) NOT NULL,
    gas_limit NUMERIC NOT NULL, -- Using NUMERIC for precise large numbers
    gas_used NUMERIC NOT NULL,
    gas_price NUMERIC NOT NULL,
    value NUMERIC NOT NULL,
    -- Primary key
    PRIMARY KEY (block_number, tx_index)
);
