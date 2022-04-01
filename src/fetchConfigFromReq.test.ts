import { fetchConfigFromReq } from '.';

describe('fetchConfigFromReq', () => {
  it('builds the URL and params for an Infura request based on the given network, JSON-RPC request, and project ID', () => {
    const { fetchUrl, fetchParams } = fetchConfigFromReq({
      network: 'mainnet',
      req: {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBlockByNumber',
        params: ['0x482103', true],
      },
      projectId: 'abcdef1234567890',
    });
    const decodedFetchParams = {
      ...fetchParams,
      body: JSON.parse(fetchParams.body),
    };

    expect(fetchUrl).toStrictEqual(
      'https://mainnet.infura.io/v3/abcdef1234567890',
    );

    expect(decodedFetchParams).toStrictEqual({
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['0x482103', true],
      },
    });
  });

  it('uses the given source to add an Infura-Source header', () => {
    const { fetchUrl, fetchParams } = fetchConfigFromReq({
      network: 'mainnet',
      req: {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBlockByNumber',
        params: ['0x482103', true],
      },
      projectId: 'abcdef1234567890',
      source: 'eth-json-rpc-infura',
    });
    const decodedFetchParams = {
      ...fetchParams,
      body: JSON.parse(fetchParams.body),
    };

    expect(fetchUrl).toStrictEqual(
      'https://mainnet.infura.io/v3/abcdef1234567890',
    );

    expect(decodedFetchParams).toStrictEqual({
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Infura-Source': 'eth-json-rpc-infura/internal',
      },
      body: {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['0x482103', true],
      },
    });
  });

  it('uses the origin in the JSON-RPC request instead of "internal" when building the Infura-Source header', () => {
    const { fetchUrl, fetchParams } = fetchConfigFromReq({
      network: 'mainnet',
      req: {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBlockByNumber',
        params: ['0x482103', true],
        origin: 'happydapp.eth',
      },
      projectId: 'abcdef1234567890',
      source: 'eth-json-rpc-infura',
    });
    const decodedFetchParams = {
      ...fetchParams,
      body: JSON.parse(fetchParams.body),
    };

    expect(fetchUrl).toStrictEqual(
      'https://mainnet.infura.io/v3/abcdef1234567890',
    );

    expect(decodedFetchParams).toStrictEqual({
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Infura-Source': 'eth-json-rpc-infura/happydapp.eth',
      },
      body: {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['0x482103', true],
      },
    });
  });

  it('allows custom headers to be specified', () => {
    const { fetchUrl, fetchParams } = fetchConfigFromReq({
      network: 'mainnet',
      req: {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBlockByNumber',
        params: ['0x482103', true],
      },
      projectId: 'abcdef1234567890',
      extraHeaders: {
        'User-Agent': 'app/1.0',
      },
    });
    const decodedFetchParams = {
      ...fetchParams,
      body: JSON.parse(fetchParams.body),
    };

    expect(fetchUrl).toStrictEqual(
      'https://mainnet.infura.io/v3/abcdef1234567890',
    );

    expect(decodedFetchParams).toStrictEqual({
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'app/1.0',
      },
      body: {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['0x482103', true],
      },
    });
  });
});
