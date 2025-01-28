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
  | 'linea-mainnet';

/**
 * The interface for a service class responsible for making a request to an RPC
 * endpoint.
 */
export type AbstractRpcService = {
  /**
   * Listens for when the RPC service retries the request.
   * @param listener - The callback to be called when the retry occurs.
   * @returns A disposable.
   */
  onRetry: (
    listener: (
      data: ({ error: Error } | { value: unknown }) & {
        delay: number;
        attempt: number;
        endpointUrl: string;
      },
    ) => void,
  ) => {
    dispose(): void;
  };

  /**
   * Listens for when the RPC service retries the request too many times in a
   * row.
   * @param listener - The callback to be called when the circuit is broken.
   * @returns A disposable.
   */
  onBreak: (
    listener: (
      data: ({ error: Error } | { value: unknown } | { isolated: true }) & {
        endpointUrl: string;
      },
    ) => void,
  ) => {
    dispose(): void;
  };

  /**
   * Listens for when the policy underlying this RPC service detects a slow
   * request.
   * @param listener - The callback to be called when the request is slow.
   * @returns A disposable.
   */
  onDegraded: (listener: (data: { endpointUrl: string }) => void) => {
    dispose(): void;
  };

  /**
   * Makes a request to the RPC endpoint.
   */
  request<Params extends JsonRpcParams, Result extends Json>(
    jsonRpcRequest: JsonRpcRequest<Params>,
    fetchOptions?: RequestInit,
  ): Promise<JsonRpcResponse<Result | null>>;
};
