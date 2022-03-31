const RpcEngine = require('json-rpc-engine');
const providerFromEngine = require('eth-json-rpc-middleware/providerFromEngine');
const createInfuraMiddleware = require('.');

module.exports = createProvider;

/**
 * Creates a provider (as defined in {@link eth-json-rpc-middleware} which is
 * preloaded with middleware specialized for interfacing with Infura JSON-RPC
 * endpoints.
 *
 * @param {object} opts - Options to {@link createInfuraMiddleware}.
 * @returns {object} The provider as returned by {@link providerFromEngine}.
 */
function createProvider(opts) {
  const engine = new RpcEngine();
  engine.push(createInfuraMiddleware(opts));
  return providerFromEngine(engine);
}
