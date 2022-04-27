import { JsonRpcEngine } from 'json-rpc-engine';
import { providerFromEngine } from 'eth-json-rpc-middleware';
import type { SafeEventEmitterProvider } from 'eth-json-rpc-middleware';
import {
  createInfuraMiddleware,
  CreateInfuraMiddlewareOptions,
} from './create-infura-middleware';

/**
 * Creates a provider (as defined in
 * [`eth-json-rpc-middleware`](https://github.com/MetaMask/eth-json-rpc-middleware)
 * which is preloaded with middleware specialized for interfacing with Infura
 * JSON-RPC endpoints.
 *
 * @param opts - Options to {@link createInfuraMiddleware}.
 * @returns The provider as returned by `providerFromEngine` (a part of
 * [`eth-json-rpc-middleware`](https://github.com/MetaMask/eth-json-rpc-middleware)).
 */
export function createProvider(
  opts: CreateInfuraMiddlewareOptions,
): SafeEventEmitterProvider {
  const engine = new JsonRpcEngine();
  engine.push(createInfuraMiddleware(opts));
  return providerFromEngine(engine);
}
