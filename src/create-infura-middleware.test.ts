import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { Json, JsonRpcParams, JsonRpcRequest } from '@metamask/utils';

import { createInfuraMiddleware } from '.';
import type { AbstractRpcService } from './types';

describe('createInfuraMiddleware (given an RPC service)', () => {
  it('calls the RPC service with the correct request headers and body when no `source` option given', async () => {
    const rpcService = buildRpcService();
    const requestSpy = jest.spyOn(rpcService, 'request');
    const middleware = createInfuraMiddleware({
      rpcService,
    });

    const engine = new JsonRpcEngine();
    engine.push(middleware);
    await engine.handle({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
    });

    expect(requestSpy).toHaveBeenCalledWith(
      {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
      },
      {
        headers: {},
      },
    );
  });

  it('includes the `origin` from the given request in the request headers under the given `source`', async () => {
    const rpcService = buildRpcService();
    const requestSpy = jest.spyOn(rpcService, 'request');
    const middleware = createInfuraMiddleware({
      rpcService,
      options: {
        source: 'metamask',
      },
    });

    const engine = new JsonRpcEngine();
    engine.push(middleware);
    // @ts-expect-error This isn't a "proper" request as it includes `origin`,
    // but that's intentional.
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await engine.handle({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      origin: 'somedapp.com',
    });

    expect(requestSpy).toHaveBeenCalledWith(
      {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
      },
      {
        headers: {
          'Infura-Source': 'metamask/somedapp.com',
        },
      },
    );
  });

  it('includes provided extra request headers in the request, not allowing Infura-Source to be overwritten', async () => {
    const rpcService = buildRpcService();
    const requestSpy = jest.spyOn(rpcService, 'request');
    const middleware = createInfuraMiddleware({
      rpcService,
      options: {
        source: 'metamask',
        headers: {
          'X-Foo': 'Bar',
          'X-Baz': 'Qux',
          'Infura-Source': 'whatever',
        },
      },
    });

    const engine = new JsonRpcEngine();
    engine.push(middleware);
    // @ts-expect-error This isn't a "proper" request as it includes `origin`,
    // but that's intentional.
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await engine.handle({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      origin: 'somedapp.com',
    });

    expect(requestSpy).toHaveBeenCalledWith(
      {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
      },
      {
        headers: {
          'X-Foo': 'Bar',
          'X-Baz': 'Qux',
          'Infura-Source': 'metamask/somedapp.com',
        },
      },
    );
  });

  describe('if the response from the service does not contain an `error` field', () => {
    it('returns a successful JSON-RPC response containing the value of the `result` field', async () => {
      const rpcService = buildRpcService();
      jest.spyOn(rpcService, 'request').mockResolvedValue({
        id: 1,
        jsonrpc: '2.0',
        result: 'the result',
      });
      const middleware = createInfuraMiddleware({
        rpcService,
      });

      const engine = new JsonRpcEngine();
      engine.push(middleware);
      const result = await engine.handle({
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
      });

      expect(result).toStrictEqual({
        id: 1,
        jsonrpc: '2.0',
        result: 'the result',
        error: undefined,
      });
    });
  });

  describe('if the response from the service contains an `error` field with a standard JSON-RPC error object', () => {
    it('returns an unsuccessful JSON-RPC response containing the error', async () => {
      const rpcService = buildRpcService();
      jest.spyOn(rpcService, 'request').mockResolvedValue({
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -1000,
          message: 'oops',
        },
      });
      const middleware = createInfuraMiddleware({
        rpcService,
      });

      const engine = new JsonRpcEngine();
      engine.push(middleware);
      const result = await engine.handle({
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
      });

      expect(result).toStrictEqual({
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -1000,
          message: 'oops',
        },
      });
    });
  });

  describe('if the response from the service contains an `error` field with a non-standard JSON-RPC error object', () => {
    it('returns an unsuccessful JSON-RPC response containing the error, wrapped in an "internal" error (but preserving the original message)', async () => {
      const rpcService = buildRpcService();
      jest.spyOn(rpcService, 'request').mockResolvedValue({
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32000,
          data: {
            foo: 'bar',
          },
          message: 'VM Exception while processing transaction: revert',
          // @ts-expect-error The `name` property is not strictly part of the
          // JSON-RPC error object.
          name: 'RuntimeError',
          stack:
            'RuntimeError: VM Exception while processing transaction: revert at exactimate (/Users/elliot/code/metamask/metamask-mobile/node_modules/ganache/dist/node/webpack:/Ganache/ethereum/ethereum/lib/src/helpers/gas-estimator.js:257:23)',
        },
      });
      const middleware = createInfuraMiddleware({
        rpcService,
      });

      const engine = new JsonRpcEngine();
      engine.push(middleware);
      const result = await engine.handle({
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
      });

      expect(result).toStrictEqual({
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'VM Exception while processing transaction: revert',
          data: {
            cause: {
              code: -32000,
              data: {
                foo: 'bar',
              },
              message: 'VM Exception while processing transaction: revert',
              name: 'RuntimeError',
              stack:
                'RuntimeError: VM Exception while processing transaction: revert at exactimate (/Users/elliot/code/metamask/metamask-mobile/node_modules/ganache/dist/node/webpack:/Ganache/ethereum/ethereum/lib/src/helpers/gas-estimator.js:257:23)',
            },
          },
        },
      });
    });
  });

  describe('if the request to the service throws', () => {
    it('returns an unsuccessful JSON-RPC response containing the error', async () => {
      const rpcService = buildRpcService();
      jest.spyOn(rpcService, 'request').mockRejectedValue(new Error('oops'));
      const middleware = createInfuraMiddleware({
        rpcService,
      });

      const engine = new JsonRpcEngine();
      engine.push(middleware);
      const result = await engine.handle({
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
      });

      expect(result).toMatchObject({
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32603,
          data: {
            cause: {
              message: 'oops',
              stack: expect.stringContaining('Error: oops'),
            },
          },
        },
      });
    });
  });
});

describe('createInfuraMiddleware (given an RPC endpoint)', () => {
  it('throws when an empty set of options is given', () => {
    expect(() => createInfuraMiddleware({} as any)).toThrow(
      /Invalid value for 'projectId'/u,
    );
  });

  it('throws when the projectId is null', () => {
    expect(() => createInfuraMiddleware({ projectId: null } as any)).toThrow(
      /Invalid value for 'projectId'/u,
    );
  });

  it('throws when the projectId is undefined', () => {
    expect(() =>
      createInfuraMiddleware({ projectId: undefined } as any),
    ).toThrow(/Invalid value for 'projectId'/u);
  });

  it('throws when the projectId is an empty string', () => {
    expect(() => createInfuraMiddleware({ projectId: '' })).toThrow(
      /Invalid value for 'projectId'/u,
    );
  });

  it('throws when the projectId is not a string', () => {
    expect(() => createInfuraMiddleware({ projectId: 42 } as any)).toThrow(
      /Invalid value for 'projectId'/u,
    );
  });

  it('throws when headers is null', () => {
    expect(() =>
      createInfuraMiddleware({ projectId: 'foo', headers: null } as any),
    ).toThrow(/Invalid value for 'headers'/u);
  });

  it('throws when headers is an empty string', () => {
    expect(() =>
      createInfuraMiddleware({ projectId: 'foo', headers: '' } as any),
    ).toThrow(/Invalid value for 'headers'/u);
  });

  it('throws when headers is not an object', () => {
    expect(() =>
      createInfuraMiddleware({ projectId: 'foo', headers: 42 } as any),
    ).toThrow(/Invalid value for 'headers'/u);
  });
});

/**
 * Constructs a fake RPC service for use as a failover in tests.
 * @returns The fake failover service.
 */
function buildRpcService(): AbstractRpcService {
  return {
    endpointUrl: new URL('https://metamask.test'),

    async request<Params extends JsonRpcParams, Result extends Json>(
      jsonRpcRequest: JsonRpcRequest<Params>,
      _fetchOptions?: RequestInit,
    ) {
      return {
        id: jsonRpcRequest.id,
        jsonrpc: jsonRpcRequest.jsonrpc,
        result: 'ok' as Result,
      };
    },
    onRetry() {
      return {
        dispose() {
          // do nothing
        },
      };
    },
    onBreak() {
      return {
        dispose() {
          // do nothing
        },
      };
    },
    onDegraded() {
      return {
        dispose() {
          // do nothing
        },
      };
    },
  };
}
