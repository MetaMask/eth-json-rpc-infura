const test = require('tape')
const nock = require('nock')
const { fetchConfigFromReq } = require('../src/index')


test('fetchConfigFromReq - basic', (t) => {

  const network = 'mainnet'
  const req = {
    method: 'eth_getBlockByNumber',
    params: ['0x482103', true],
  }

  const { fetchUrl, fetchParams } = fetchConfigFromReq({ network, req })
  t.equals(fetchUrl, 'https://api.infura.io/v1/jsonrpc/mainnet/eth_getBlockByNumber?params=%5B%220x482103%22%2Ctrue%5D')
  t.deepEquals(fetchParams, { method: 'GET' })
  t.end()

})

test('fetchConfigFromReq - basic', (t) => {

  const network = 'ropsten'
  const req = {
    method: 'eth_sendRawTransaction',
    params: ['0x0102030405060708090a0b0c0d0e0f'],
  }

  const { fetchUrl, fetchParams } = fetchConfigFromReq({ network, req })
  t.equals(fetchUrl, 'https://api.infura.io/v1/jsonrpc/ropsten')
  t.deepEquals(fetchParams, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
  t.end()

})


test('fetchConfigFromReq - strip non-standard keys', (t) => {

  const network = 'ropsten'
  const req = {
    method: 'eth_sendRawTransaction',
    params: ['0x0102030405060708090a0b0c0d0e0f'],
    origin: 'happydapp.eth',
  }

  const { fetchUrl, fetchParams } = fetchConfigFromReq({ network, req })
  t.equals(fetchUrl, 'https://api.infura.io/v1/jsonrpc/ropsten')
  const parsedReq = JSON.parse(fetchParams.body)
  t.notOk('origin' in parsedReq, 'non-standard key removed from req')
  t.end()

})

test('createInfuraMiddleware - runs through all the retry attempts due to empty response', (t) => {
  const scope = nock('https://api.infura.io').persist().get(/.*/).times(5).reply(200, {})
  const network = 'mainnet'
  const req = {
    method: 'eth_getBlockByNumber',
    params: ['0x482103', true],
  }

  const createInfuraMiddleware = require('../src/index')

  const fetchMiddlewear = createInfuraMiddleware()

    fetchMiddlewear(req, {}, () => {}, (e) => {
      t.true(scope.isDone(), 'should fetch 5 times')
      t.true(e.message.includes('All retries exhausted'), 'error message should include: All retries exhausted')
      t.true(e.message.includes('Response has no error or result'), 'error message should include: Response has no error or result')
      t.end()
    })
})