import type { PendingJsonRpcResponse } from 'json-rpc-engine';
import { createAsyncMiddleware } from 'json-rpc-engine';
import type { EthereumRpcError } from 'eth-rpc-errors';
import { ethErrors } from 'eth-rpc-errors';
import fetch from 'node-fetch';
import type {
  ExtendedJsonRpcRequest,
  InfuraJsonRpcSupportedNetwork,
  RequestHeaders,
} from './types';
import fetchConfigFromReq from './fetchConfigFromReq';

interface EthereumErrorOptions<T> {
  message?: string;
  data?: T;
}

export interface CreateInfuraMiddlewareOptions {
  network?: InfuraJsonRpcSupportedNetwork;
  maxAttempts?: number;
  source?: string;
  projectId: string;
  headers?: Record<string, string>;
}

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
 * Builds [`json-rpc-engine`](https://github.com/MetaMask/json-rpc-engine)-compatible middleware designed
 * for interfacing with Infura's JSON-RPC endpoints.
 *
 * @param opts - The options.
 * @param opts.network - A network that Infura supports; plugs into
 * `https://${network}.infura.io` (default: 'mainnet').
 * @param opts.maxAttempts - The number of times a request to Infura should be
 * retried in the case of failure (default: 5).
 * @param opts.source - A descriptor for the entity making the request; tracked
 * by Infura for analytics purposes.
 * @param opts.projectId - The Infura project id.
 * @param opts.headers - Extra headers that will be used to make the request.
 * @returns The `json-rpc-engine`-compatible middleware.
 */
export default function createInfuraMiddleware({
  network = 'mainnet',
  maxAttempts = 5,
  source,
  projectId,
  headers = {},
}: CreateInfuraMiddlewareOptions) {
  // validate options
  if (!projectId || typeof projectId !== 'string') {
    throw new Error(`Invalid value for 'projectId': "${projectId}"`);
  }

  if (!headers || typeof headers !== 'object') {
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
        await performFetch(network, projectId, headers, req, res, source);
        // request was successful
        break;
      } catch (err: any) {
        // an error was caught while performing the request
        // if not retriable, resolve with the encountered error
        if (!isRetriableError(err)) {
          // abort with error
          throw err;
        }
        // if no more attempts remaining, throw an error
        const remainingAttempts = maxAttempts - attempt;
        if (!remainingAttempts) {
          const errMsg = `InfuraProvider - cannot complete request. All retries exhausted.\nOriginal Error:\n${err.toString()}\n\n`;
          const retriesExhaustedErr = new Error(errMsg);
          throw retriesExhaustedErr;
        }
        // otherwise, ignore error and retry again after timeout
        await timeout(1000);
      }
    }
    // request was handled correctly, end
  });
}

/**
 * Makes a request to Infura, updating the given response object if the response
 * has a "successful" status code or throwing an error otherwise.
 *
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
  req: ExtendedJsonRpcRequest<unknown>,
  res: PendingJsonRpcResponse<unknown>,
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
        throw ethErrors.rpc.methodNotFound();

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
    res.result = null;
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
 *
 * @returns The error object.
 */
function createRatelimitError(): EthereumRpcError<unknown> {
  const msg = `Request is being rate limited.`;
  return createInternalError(msg);
}

/**
 * Builds a JSON-RPC 2.0 internal error object describing a timeout error.
 *
 * @returns The error object.
 */
function createTimeoutError(): EthereumRpcError<unknown> {
  let msg = `Gateway timeout. The request took too long to process. `;
  msg += `This can happen when querying logs over too wide a block range.`;
  return createInternalError(msg);
}

/**
 * Builds a JSON-RPC 2.0 internal error object.
 *
 * @param msg - The message.
 * @returns The error object.
 */
function createInternalError<T>(
  msg: string | EthereumErrorOptions<T> | undefined,
): EthereumRpcError<T> {
  return ethErrors.rpc.internal<T>(msg);
}

/**
 * Upon making a request, we may get an error that is temporary and
 * intermittent. In these cases we can attempt the request again with the
 * assumption that the error is unlikely to occur again. Here we determine if we
 * have received such an error.
 *
 * @param err - The error object.
 * @returns Whether the request that produced the error can be retried.
 */
function isRetriableError(err: any): boolean {
  const errMessage = err.toString();
  return RETRIABLE_ERRORS.some((phrase) => errMessage.includes(phrase));
}

/**
 * A utility function that promisifies `setTimeout`.
 *
 * @param length - The number of milliseconds to wait.
 * @returns A promise that resolves after the given time has elapsed.
 */
function timeout(length: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, length);
  });
}
