const createAsyncMiddleware = require('json-rpc-engine/src/createAsyncMiddleware')

module.exports = createInfuraMiddleware
module.exports.urlFromReq = urlFromReq

function createInfuraMiddleware({ network = 'mainnet' }) {
  return createAsyncMiddleware(async (req, res, next) => {
    const targetUrl = urlFromReq({ network, req })
    const response = await fetch(targetUrl)
    const rawData = await response.text()
    // special case for now
    if (req.method === 'eth_getBlockByNumber' && rawData === 'Not Found') {
      err.result = null
      return
    }
    const data = JSON.parse(rawData)
    res.result = data.result
    res.error = data.error
  })
}

function urlFromReq({ network, req }) {
  const { method, params } = req
  const paramsString = encodeURIComponent(JSON.stringify(params))
  const targetUrl = `https://api.infura.io/v1/jsonrpc/${network}/${method}?params=${paramsString}`
  return targetUrl
}