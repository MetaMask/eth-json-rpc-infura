const RpcEngine = require('json-rpc-engine')
const providerFromEngine = require('eth-json-rpc-middleware/providerFromEngine')
const createInfuraMiddleware = require('./index')


module.exports = createProvider

function createProvider(){
  const engine = new RpcEngine()
  engine.push(createInfuraMiddleware({ network: 'mainnet' }))
  return providerFromEngine(engine)
}
