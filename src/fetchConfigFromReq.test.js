const { fetchConfigFromReq } = require('.');

describe('fetchConfigFromReq (JS-only tests)', () => {
  it('strips non-standard keys from the given JSON-RPC request before building the resulting fetchParams', () => {
    const { fetchUrl, fetchParams } = fetchConfigFromReq({
      network: 'mainnet',
      req: {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBlockByNumber',
        params: ['0x482103', true],
        foo: 'bar',
        baz: 'qux',
      },
      projectId: 'abcdef1234567890',
    });
    const decodedFetchParams = Object.assign({}, fetchParams, {
      body: JSON.parse(fetchParams.body),
    });

    expect(fetchUrl).toStrictEqual(
      'https://mainnet.infura.io/v3/abcdef1234567890',
    );

    expect(decodedFetchParams.body).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: ['0x482103', true],
    });
  });
});
