const createAsyncMiddleware = require('json-rpc-engine/src/createAsyncMiddleware')
const JsonRpcError = require('json-rpc-error')

module.exports = createInfuraMiddleware
module.exports.fetchConfigFromReq = fetchConfigFromReq

function createInfuraMiddleware({ network = 'mainnet' }) {
  return createAsyncMiddleware(async (req, res, next) => {
    const { fetchUrl, fetchParams } = fetchConfigFromReq({ network, req })
    const response = await fetch(fetchUrl, fetchParams)
    const rawData = await response.text()
    // handle errors
    if (!response.ok) {
      switch (response.status) {
        case 405:
          throw new JsonRpcError.MethodNotFound()

        case 418:
          throw createRatelimitError()

        case 503:
        case 504:
          throw createTimeoutError()

        default:
          throw createInternalError(rawData)
      }
    }
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
  let fetchUrl = `https://api.infura.io/v1/jsonrpc/${network}`
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
    fetchUrl += `/${method}?params=${paramsString}`
  }

  return { fetchUrl, fetchParams }
}


function createRatelimitError () {
  let msg = `Request is being rate limited.`
  return createInternalError(msg)
}

function createTimeoutError () {
  let msg = `Gateway timeout. The request took too long to process. `
  msg += `This can happen when querying logs over too wide a block range.`
  return createInternalError(msg)
}

function createInternalError (msg) {
  const err = new Error(msg)
  return new JsonRpcError.InternalError(err)
}
