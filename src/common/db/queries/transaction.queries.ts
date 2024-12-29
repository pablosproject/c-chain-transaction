/** Types generated for queries found in "src/common/db/queries/transaction.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

export type NumberOrStringArray = (NumberOrString)[];

export type booleanArray = (boolean)[];

export type numberArray = (number)[];

export type stringArray = (string)[];

/** 'InsertTransaction' parameters type */
export interface IInsertTransactionParams {
  block_number?: NumberOrString | null | void;
  from_address?: string | null | void;
  gas_limit?: NumberOrString | null | void;
  gas_price?: NumberOrString | null | void;
  gas_used?: NumberOrString | null | void;
  status?: boolean | null | void;
  timestamp?: NumberOrString | null | void;
  to_address?: string | null | void;
  tx_index?: number | null | void;
  value?: NumberOrString | null | void;
}

/** 'InsertTransaction' return type */
export type IInsertTransactionResult = void;

/** 'InsertTransaction' query type */
export interface IInsertTransactionQuery {
  params: IInsertTransactionParams;
  result: IInsertTransactionResult;
}

const insertTransactionIR: any = {"usedParamSet":{"timestamp":true,"status":true,"block_number":true,"tx_index":true,"from_address":true,"to_address":true,"value":true,"gas_limit":true,"gas_used":true,"gas_price":true},"params":[{"name":"timestamp","required":false,"transform":{"type":"scalar"},"locs":[{"a":254,"b":263}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":279,"b":285}]},{"name":"block_number","required":false,"transform":{"type":"scalar"},"locs":[{"a":301,"b":313}]},{"name":"tx_index","required":false,"transform":{"type":"scalar"},"locs":[{"a":328,"b":336}]},{"name":"from_address","required":false,"transform":{"type":"scalar"},"locs":[{"a":352,"b":364}]},{"name":"to_address","required":false,"transform":{"type":"scalar"},"locs":[{"a":380,"b":390}]},{"name":"value","required":false,"transform":{"type":"scalar"},"locs":[{"a":406,"b":411}]},{"name":"gas_limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":427,"b":436}]},{"name":"gas_used","required":false,"transform":{"type":"scalar"},"locs":[{"a":452,"b":460}]},{"name":"gas_price","required":false,"transform":{"type":"scalar"},"locs":[{"a":476,"b":485}]}],"statement":"INSERT INTO\n    transactions (\n        timestamp,\n        status,\n        block_number,\n        tx_index,\n        from_address,\n        to_address,\n        value,\n        gas_limit,\n        gas_used,\n        gas_price\n    )\nVALUES\n    (\n    to_timestamp(:timestamp::bigint),\n    :status::boolean,\n    :block_number::bigint,\n    :tx_index::integer,\n    :from_address::varchar,\n    :to_address::varchar,\n    :value::numeric,\n    :gas_limit::numeric,\n    :gas_used::numeric,\n    :gas_price::numeric\n    )"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO
 *     transactions (
 *         timestamp,
 *         status,
 *         block_number,
 *         tx_index,
 *         from_address,
 *         to_address,
 *         value,
 *         gas_limit,
 *         gas_used,
 *         gas_price
 *     )
 * VALUES
 *     (
 *     to_timestamp(:timestamp::bigint),
 *     :status::boolean,
 *     :block_number::bigint,
 *     :tx_index::integer,
 *     :from_address::varchar,
 *     :to_address::varchar,
 *     :value::numeric,
 *     :gas_limit::numeric,
 *     :gas_used::numeric,
 *     :gas_price::numeric
 *     )
 * ```
 */
export const insertTransaction = new PreparedQuery<IInsertTransactionParams,IInsertTransactionResult>(insertTransactionIR);


/** 'BulkInsertTransaction' parameters type */
export interface IBulkInsertTransactionParams {
  block_number?: NumberOrStringArray | null | void;
  from_address?: stringArray | null | void;
  gas_limit?: NumberOrStringArray | null | void;
  gas_price?: NumberOrStringArray | null | void;
  gas_used?: NumberOrStringArray | null | void;
  status?: booleanArray | null | void;
  timestamp?: NumberOrStringArray | null | void;
  to_address?: stringArray | null | void;
  tx_index?: numberArray | null | void;
  value?: NumberOrStringArray | null | void;
}

/** 'BulkInsertTransaction' return type */
export type IBulkInsertTransactionResult = void;

/** 'BulkInsertTransaction' query type */
export interface IBulkInsertTransactionQuery {
  params: IBulkInsertTransactionParams;
  result: IBulkInsertTransactionResult;
}

const bulkInsertTransactionIR: any = {"usedParamSet":{"timestamp":true,"status":true,"block_number":true,"tx_index":true,"from_address":true,"to_address":true,"value":true,"gas_limit":true,"gas_used":true,"gas_price":true},"params":[{"name":"timestamp","required":false,"transform":{"type":"scalar"},"locs":[{"a":358,"b":367}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":391,"b":397}]},{"name":"block_number","required":false,"transform":{"type":"scalar"},"locs":[{"a":415,"b":427}]},{"name":"tx_index","required":false,"transform":{"type":"scalar"},"locs":[{"a":444,"b":452}]},{"name":"from_address","required":false,"transform":{"type":"scalar"},"locs":[{"a":470,"b":482}]},{"name":"to_address","required":false,"transform":{"type":"scalar"},"locs":[{"a":500,"b":510}]},{"name":"value","required":false,"transform":{"type":"scalar"},"locs":[{"a":528,"b":533}]},{"name":"gas_limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":551,"b":560}]},{"name":"gas_used","required":false,"transform":{"type":"scalar"},"locs":[{"a":578,"b":586}]},{"name":"gas_price","required":false,"transform":{"type":"scalar"},"locs":[{"a":604,"b":613}]}],"statement":"INSERT INTO\n    transactions (\n        timestamp,\n        status,\n        block_number,\n        tx_index,\n        from_address,\n        to_address,\n        value,\n        gas_limit,\n        gas_used,\n        gas_price\n    )\nSELECT * FROM UNNEST(\n    ARRAY(\n        SELECT (timestamp 'epoch' + (unnest::bigint * interval '1 microsecond'))\n        FROM unnest(:timestamp::bigint[])\n    ),\n    :status::boolean[],\n    :block_number::bigint[],\n    :tx_index::integer[],\n    :from_address::varchar[],\n    :to_address::varchar[],\n    :value::numeric[],\n    :gas_limit::numeric[],\n    :gas_used::numeric[],\n    :gas_price::numeric[]\n)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO
 *     transactions (
 *         timestamp,
 *         status,
 *         block_number,
 *         tx_index,
 *         from_address,
 *         to_address,
 *         value,
 *         gas_limit,
 *         gas_used,
 *         gas_price
 *     )
 * SELECT * FROM UNNEST(
 *     ARRAY(
 *         SELECT (timestamp 'epoch' + (unnest::bigint * interval '1 microsecond'))
 *         FROM unnest(:timestamp::bigint[])
 *     ),
 *     :status::boolean[],
 *     :block_number::bigint[],
 *     :tx_index::integer[],
 *     :from_address::varchar[],
 *     :to_address::varchar[],
 *     :value::numeric[],
 *     :gas_limit::numeric[],
 *     :gas_used::numeric[],
 *     :gas_price::numeric[]
 * )
 * ```
 */
export const bulkInsertTransaction = new PreparedQuery<IBulkInsertTransactionParams,IBulkInsertTransactionResult>(bulkInsertTransactionIR);


