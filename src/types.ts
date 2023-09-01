import type { JsonRpcRequest } from 'json-rpc-engine';

export type RequestHeaders = Record<string, string>;

export type ExtendedJsonRpcRequest<Params> = JsonRpcRequest<Params> & { origin?: string };

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
  | 'linea-mainnet';
