/*
@name InsertTransaction
*/
INSERT INTO
    transactions (
        timestamp,
        status,
        block_number,
        tx_index,
        from_address,
        to_address,
        value,
        gas_limit,
        gas_used,
        gas_price
    )
VALUES
    (
    to_timestamp(:timestamp::bigint),
    :status::boolean,
    :block_number::bigint,
    :tx_index::integer,
    :from_address::varchar,
    :to_address::varchar,
    :value::numeric,
    :gas_limit::numeric,
    :gas_used::numeric,
    :gas_price::numeric
    );

/*
@name BulkInsertTransaction
*/
INSERT INTO
    transactions (
        timestamp,
        status,
        block_number,
        tx_index,
        from_address,
        to_address,
        value,
        gas_limit,
        gas_used,
        gas_price
    )
SELECT * FROM UNNEST(
    ARRAY(
        SELECT (timestamp 'epoch' + (unnest::bigint * interval '1 microsecond'))
        FROM unnest(:timestamp::bigint[])
    ),
    :status::boolean[],
    :block_number::bigint[],
    :tx_index::integer[],
    :from_address::varchar[],
    :to_address::varchar[],
    :value::numeric[],
    :gas_limit::numeric[],
    :gas_used::numeric[],
    :gas_price::numeric[]
);
