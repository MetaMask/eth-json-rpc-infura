const test = require('tape')
const { urlFromReq } = require('../src/index')

test('urlFromReq - basic', (t) => {
  
  const network = 'mainnet'
  const req = {
    method: 'eth_getBlockByNumber',
    params: ['0x482103', true]
  }
  
  const url = urlFromReq({ network, req })
  t.equals(url, 'https://api.infura.io/v1/jsonrpc/mainnet/eth_getBlockByNumber?params=%5B%220x482103%22%2Ctrue%5D')
  t.end()

})