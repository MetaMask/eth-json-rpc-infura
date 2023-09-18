import { providerFromEngine } from '@metamask/eth-json-rpc-provider';
import type { SafeEventEmitterProvider } from '@metamask/eth-json-rpc-provider';
import { JsonRpcEngine } from 'json-rpc-engine';

import type { CreateInfuraMiddlewareOptions } from './create-infura-middleware';
import { createInfuraMiddleware } from './create-infura-middleware';

/**
 * Creates a provider (as defined in
 * [`eth-json-rpc-provider`](https://github.com/MetaMask/eth-json-rpc-provider)
 * which is preloaded with middleware specialized for interfacing with Infura
 * JSON-RPC endpoints.
 * @param opts - Options to {@link createInfuraMiddleware}.
 * @returns The provider as returned by `providerFromEngine` (a part of
 * [`eth-json-rpc-provider`](https://github.com/MetaMask/eth-json-rpc-provider)).
 */
export function createProvider(
  opts: CreateInfuraMiddlewareOptions,
): SafeEventEmitterProvider {
  const engine = new JsonRpcEngine();
  engine.push(createInfuraMiddleware(opts));
  return providerFromEngine(engine);
}
