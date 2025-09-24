import type {
  Json,
  JsonRpcParams,
  JsonRpcRequest,
  JsonRpcResponse,
} from '@metamask/utils';

export type RequestHeaders = Record<string, string>;

export type ExtendedJsonRpcRequest<Params extends JsonRpcParams> =
  JsonRpcRequest<Params> & { origin?: string };

/**
 * These are networks:
 *
 * 1. for which Infura has released official, production support (see <https://docs.infura.io>)
 * 2. which support the JSON-RPC 2.0 protocol
 */
export type InfuraJsonRpcSupportedNetwork =
  | 'mainnet'
  | 'goerli'
  | 'sepolia'
  | 'filecoin'
  | 'polygon-mainnet'
  | 'polygon-mumbai'
  | 'palm-mainnet'
  | 'palm-testnet'
  | 'optimism-mainnet'
  | 'optimism-goerli'
  | 'arbitrum-mainnet'
  | 'arbitrum-goerli'
  | 'aurora-mainnet'
  | 'aurora-testnet'
  | 'avalanche-mainnet'
  | 'avalanche-fuji'
  | 'celo-mainnet'
  | 'celo-alfajores'
  | 'near-mainnet'
  | 'near-testnet'
  | 'starknet-mainnet'
  | 'starknet-goerli'
  | 'linea-goerli'
  | 'linea-sepolia'
  | 'linea-mainnet'
  | 'sei-mainnet'
  | 'sei-testnet';

/**
 * A copy of the `AbstractRpcService` type in metamask/network-controller`, but
 * keeping only the `request` method.
 *
 * We cannot get `AbstractRpcService` directly from
 * `@metamask/network-controller` because relying on this package would create a
 * circular dependency.
 *
 * This type should be accurate as of `@metamask/network-controller` 24.x and
 * `@metamask/utils` 11.x.
 */
export type AbstractRpcServiceLike = {
  request: <Params extends JsonRpcParams, Result extends Json>(
    jsonRpcRequest: JsonRpcRequest<Params>,
    fetchOptions?: RequestInit,
  ) => Promise<JsonRpcResponse<Result | null>>;
};
