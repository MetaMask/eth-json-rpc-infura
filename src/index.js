const createAsyncMiddleware = require('json-rpc-engine/src/createAsyncMiddleware')

module.exports = createInfuraMiddleware
module.exports.fetchConfigFromReq = fetchConfigFromReq

function createInfuraMiddleware({ network = 'mainnet' }) {
  return createAsyncMiddleware(async (req, res, next) => {
    const { fetchUrl, fetchParams } = fetchConfigFromReq({ network, req })
    const response = await fetch(fetchUrl, fetchParams)
    const rawData = await response.text()
    // special case for now
    if (req.method === 'eth_getBlockByNumber' && rawData === 'Not Found') {
      res.result = null
      return
    }
    const data = JSON.parse(rawData)
    res.result = data.result
    res.error = data.error
  })
}

function fetchConfigFromReq({ network, req }) {
  const { method, params } = req

  const fetchParams = {}
  let fetchUrl = `https://api.infura.io/v1/jsonrpc/${network}/`
  const isPostMethod = ['eth_sendRawTransaction'].includes(req.method)
  if (isPostMethod) {
    fetchParams.method = 'POST'
    fetchParams.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    fetchParams.body = JSON.stringify(req)
  } else {
    fetchParams.method = 'GET'
    const paramsString = encodeURIComponent(JSON.stringify(params))
    fetchUrl += `${method}?params=${paramsString}`
  }

  return { fetchUrl, fetchParams }
}
