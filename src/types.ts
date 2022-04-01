import type { JsonRpcRequest } from 'json-rpc-engine';

export type RequestHeaders = Record<string, string>;

export type ExtendedJsonRpcRequest<T> = JsonRpcRequest<T> & { origin?: string };

/**
 * These are networks:
 *
 * 1. for which Infura has released official, production support (see <https://docs.infura.io>)
 * 2. which support the JSON-RPC 2.0 protocol
 */
export type InfuraJsonRpcSupportedNetwork =
  | 'mainnet'
  | 'ropsten'
  | 'rinkeby'
  | 'kovan'
  | 'goerli'
  | 'eth2-beacon-mainnet'
  | 'filecoin'
  | 'polygon-mainnet'
  | 'polygon-mumbai'
  | 'palm-mainnet'
  | 'palm-testnet'
  | 'optimism-mainnet'
  | 'optimism-kovan'
  | 'arbitrum-mainnet'
  | 'arbitrum-rinkeby'
  // Legacy networks for compatibility with NetworkController
  | 'optimism'
  | 'optimismTest';
