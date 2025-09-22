import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import { createAsyncMiddleware } from '@metamask/json-rpc-engine';
import type { JsonRpcError } from '@metamask/rpc-errors';
import { rpcErrors } from '@metamask/rpc-errors';
import {
  type Json,
  type JsonRpcParams,
  type PendingJsonRpcResponse,
} from '@metamask/utils';

import { fetchConfigFromReq } from './fetch-config-from-req';
import { projectLogger, createModuleLogger } from './logging-utils';
import type {
  AbstractRpcService,
  ExtendedJsonRpcRequest,
  InfuraJsonRpcSupportedNetwork,
  RequestHeaders,
} from './types';

/**
 * A simplified version of the `HeadersInit` type from the Fetch API.
 *
 * We purposefully do not use that type because we don't want to accidentally
 * rely on browser-only APIs in this package.
 */
type Headers = Record<string, string>;

export type CreateInfuraMiddlewareOptions = {
  network?: InfuraJsonRpcSupportedNetwork;
  maxAttempts?: number;
  source?: string;
  projectId: string;
  headers?: Headers;
};

const log = createModuleLogger(projectLogger, 'create-infura-middleware');
const RETRIABLE_ERRORS = [
  // ignore server overload errors
  'Gateway timeout',
  'ETIMEDOUT',
  'ECONNRESET',
  // ignore server sent html error pages
  // or truncated json responses
  'SyntaxError',
];

/**
 * Creates middleware for sending a JSON-RPC request through the given RPC
 * service.
 * @param args - The arguments to this function.
 * @param args.rpcService - The RPC service to use.
 * @param args.options - Options.
 * @param args.options.source - A descriptor for the entity making the request;
 * tracked by Infura for analytics purposes.
 * @param args.options.headers - Extra headers to include in the request.
 * @returns The fetch middleware.
 */
export function createInfuraMiddleware(args: {
  rpcService: AbstractRpcService;
  options?: {
    source?: string;
    headers?: Headers;
  };
}): JsonRpcMiddleware<JsonRpcParams, Json>;

/**
 * Builds [`@metamask/json-rpc-engine`](https://github.com/MetaMask/@metamask/json-rpc-engine)-compatible middleware designed
 * for interfacing with Infura's JSON-RPC endpoints.
 * @deprecated This overload is deprecated — please pass an `RpcService`
 * instance from `@metamask/network-controller` instead.
 * @param args - The arguments to this function.
 * @param args.network - A network that Infura supports; plugs into
 * `https://${network}.infura.io` (default: 'mainnet').
 * @param args.maxAttempts - The number of times a request to Infura should be
 * retried in the case of failure (default: 5).
 * @param args.source - A descriptor for the entity making the request; tracked
 * by Infura for analytics purposes.
 * @param args.projectId - The Infura project id.
 * @param args.headers - Extra headers that will be used to make the request.
 * @returns The `@metamask/json-rpc-engine`-compatible middleware.
 */
export function createInfuraMiddleware(
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  args: CreateInfuraMiddlewareOptions,
): JsonRpcMiddleware<JsonRpcParams, Json>;

// The overloads are documented above.
// eslint-disable-next-line jsdoc/require-jsdoc
export function createInfuraMiddleware(
  args:
    | {
        rpcService: AbstractRpcService;
        options?: {
          source?: string;
          headers?: Headers;
        };
      }
    | CreateInfuraMiddlewareOptions,
): JsonRpcMiddleware<JsonRpcParams, Json> {
  if ('rpcService' in args) {
    return createInfuraMiddlewareWithRpcService(args);
  }
  return createInfuraMiddlewareWithoutRpcService(args);
}

/**
 * Creates middleware for sending a JSON-RPC request through the given RPC
 * service.
 * @param args - The arguments to this function.
 * @param args.rpcService - The RPC service to use.
 * @param args.options - Options.
 * @param args.options.source - A descriptor for the entity making the request;
 * tracked by Infura for analytics purposes.
 * @param args.options.headers - Extra headers to include in the request.
 * @returns The fetch middleware.
 */
function createInfuraMiddlewareWithRpcService({
  rpcService,
  options = {},
}: {
  rpcService: AbstractRpcService;
  options?: {
    source?: string;
    headers?: Headers;
  };
}): JsonRpcMiddleware<JsonRpcParams, Json> {
  const { source, headers: extraHeaders = {} } = options;

  return createAsyncMiddleware(
    async (req: ExtendedJsonRpcRequest<JsonRpcParams>, res) => {
      const headers: Headers =
        source !== undefined && req.origin !== undefined
          ? { ...extraHeaders, 'Infura-Source': `${source}/${req.origin}` }
          : extraHeaders;

      const jsonRpcResponse = await rpcService.request(
        {
          id: req.id,
          jsonrpc: req.jsonrpc,
          method: req.method,
          params: req.params,
        },
        {
          headers,
        },
      );

      // Discard the `id` and `jsonrpc` fields in the response body
      // (the JSON-RPC engine will fill those in)

      if ('error' in jsonRpcResponse) {
        res.error = jsonRpcResponse.error;
      } else {
        res.result = jsonRpcResponse.result;
        res.error = undefined;
      }
    },
  );
}

/**
 * Builds [`@metamask/json-rpc-engine`](https://github.com/MetaMask/@metamask/json-rpc-engine)-compatible middleware designed
 * for interfacing with Infura's JSON-RPC endpoints.
 * @param opts - The options.
 * @param opts.network - A network that Infura supports; plugs into
 * `https://${network}.infura.io` (default: 'mainnet').
 * @param opts.maxAttempts - The number of times a request to Infura should be
 * retried in the case of failure (default: 5).
 * @param opts.source - A descriptor for the entity making the request; tracked
 * by Infura for analytics purposes.
 * @param opts.projectId - The Infura project id.
 * @param opts.headers - Extra headers that will be used to make the request.
 * @returns The `@metamask/json-rpc-engine`-compatible middleware.
 */
export function createInfuraMiddlewareWithoutRpcService({
  network = 'mainnet',
  maxAttempts = 5,
  source,
  projectId,
  headers = {},
}: CreateInfuraMiddlewareOptions): JsonRpcMiddleware<JsonRpcParams, Json> {
  // validate options
  if (!projectId || typeof projectId !== 'string') {
    throw new Error(`Invalid value for 'projectId': "${projectId}"`);
  }

  if (!headers || typeof headers !== 'object') {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Invalid value for 'headers': "${headers}"`);
  }

  if (!maxAttempts) {
    throw new Error(
      `Invalid value for 'maxAttempts': "${maxAttempts}" (${typeof maxAttempts})`,
    );
  }

  return createAsyncMiddleware(async (req, res) => {
    // retry MAX_ATTEMPTS times, if error matches filter
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // attempt request
        log(
          'Attempting request to Infura. network = %o, projectId = %s, headers = %o, req = %o',
          network,
          projectId,
          headers,
          req,
        );

        await performFetch(network, projectId, headers, req, res, source);
        // request was successful
        break;
      } catch (err: any) {
        // an error was caught while performing the request
        // if not retriable, resolve with the encountered error
        if (!isRetriableError(err)) {
          // abort with error
          log(
            'Non-retriable request error encountered. req = %o, res = %o, error = %o',
            req,
            res,
            err,
          );
          throw err;
        }
        // if no more attempts remaining, throw an error
        const remainingAttempts = maxAttempts - attempt;
        if (!remainingAttempts) {
          log(
            'Retriable request error encountered, but exceeded max attempts. req = %o, res = %o, error = %o',
            req,
            res,
            err,
          );
          const errMsg = `InfuraProvider - cannot complete request. All retries exhausted.\nOriginal Error:\n${
            err.toString() as string
          }\n\n`;
          const retriesExhaustedErr = new Error(errMsg);
          throw retriesExhaustedErr;
        }

        // otherwise, ignore error and retry again after timeout
        log(
          'Retriable request error encountered. req = %o, res = %o, error = %o',
          req,
          res,
          err,
        );
        log('Waiting 1 second to try again...');
        await timeout(1000);
      }
    }
    // request was handled correctly, end
  });
}

/**
 * Makes a request to Infura, updating the given response object if the response
 * has a "successful" status code or throwing an error otherwise.
 * @param network - A network that Infura supports; plugs into
 * `https://${network}.infura.io`.
 * @param projectId - The Infura project id.
 * @param extraHeaders - Extra headers that will be used to make the request.
 * @param req - The original request object obtained via the middleware stack.
 * @param res - The original response object obtained via the middleware stack.
 * @param source - A descriptor for the entity making the request;
 * tracked by Infura for analytics purposes.
 * @throws an error with a detailed message if the HTTP status code is anywhere
 * outside 2xx, and especially if it is 405, 429, 503, or 504.
 */
async function performFetch(
  network: InfuraJsonRpcSupportedNetwork,
  projectId: string,
  extraHeaders: RequestHeaders,
  req: ExtendedJsonRpcRequest<JsonRpcParams>,
  res: PendingJsonRpcResponse,
  source: string | undefined,
): Promise<void> {
  const { fetchUrl, fetchParams } = fetchConfigFromReq({
    network,
    projectId,
    extraHeaders,
    req,
    source,
  });
  const response = await fetch(fetchUrl, fetchParams);
  const rawData = await response.text();
  // handle errors
  if (!response.ok) {
    switch (response.status) {
      case 405:
        throw rpcErrors.methodNotFound();

      case 429:
        throw createRatelimitError();

      case 503:
      case 504:
        throw createTimeoutError();

      default:
        throw createInternalError(rawData);
    }
  }

  // special case for now
  if (req.method === 'eth_getBlockByNumber' && rawData === 'Not Found') {
    // TODO Would this be more correct?
    // delete res.result;
    res.result = null as any as JsonRpcParams;
    return;
  }

  // parse JSON
  const data = JSON.parse(rawData);

  // finally return result
  res.result = data.result;
  res.error = data.error;
}

/**
 * Builds a JSON-RPC 2.0 internal error object describing a rate-limiting
 * error.
 * @returns The error object.
 */
function createRatelimitError(): JsonRpcError<undefined> {
  const msg = `Request is being rate limited.`;
  return createInternalError(msg);
}

/**
 * Builds a JSON-RPC 2.0 internal error object describing a timeout error.
 * @returns The error object.
 */
function createTimeoutError(): JsonRpcError<undefined> {
  let msg = `Gateway timeout. The request took too long to process. `;
  msg += `This can happen when querying logs over too wide a block range.`;
  return createInternalError(msg);
}

/**
 * Builds a JSON-RPC 2.0 internal error object.
 * @param msg - The message.
 * @returns The error object.
 */
function createInternalError(msg: string): JsonRpcError<undefined> {
  return rpcErrors.internal(msg);
}

/**
 * Upon making a request, we may get an error that is temporary and
 * intermittent. In these cases we can attempt the request again with the
 * assumption that the error is unlikely to occur again. Here we determine if we
 * have received such an error.
 * @param err - The error object.
 * @returns Whether the request that produced the error can be retried.
 */
function isRetriableError(err: any): boolean {
  const errMessage = err.toString();
  return RETRIABLE_ERRORS.some((phrase) => errMessage.includes(phrase));
}

/**
 * A utility function that promisifies `setTimeout`.
 * @param length - The number of milliseconds to wait.
 * @returns A promise that resolves after the given time has elapsed.
 */
async function timeout(length: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, length);
  });
}
