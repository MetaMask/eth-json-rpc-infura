const RpcEngine = require('json-rpc-engine');
const providerFromEngine = require('eth-json-rpc-middleware/providerFromEngine');
const createInfuraMiddleware = require('.');

module.exports = createProvider;

/**
 * Creates a provider (as defined in
 * [`eth-json-rpc-middleware`](https://github.com/MetaMask/eth-json-rpc-middleware)
 * which is preloaded with middleware specialized for interfacing with Infura
 * JSON-RPC endpoints.
 *
 * @param {object} opts - Options to {@link createInfuraMiddleware}.
 * @returns {object} The provider as returned by `providerFromEngine` (a part of
 * [`eth-json-rpc-middleware`](https://github.com/MetaMask/eth-json-rpc-middleware)).
 */
function createProvider(opts) {
  const engine = new RpcEngine();
  engine.push(createInfuraMiddleware(opts));
  return providerFromEngine(engine);
}
