const createAsyncMiddleware = require('json-rpc-engine/src/createAsyncMiddleware');
const { ethErrors } = require('eth-rpc-errors');
const fetch = require('node-fetch');

const RETRIABLE_ERRORS = [
  // ignore server overload errors
  'Gateway timeout',
  'ETIMEDOUT',
  'ECONNRESET',
  // ignore server sent html error pages
  // or truncated json responses
  'SyntaxError',
];

module.exports = createInfuraMiddleware;
module.exports.fetchConfigFromReq = fetchConfigFromReq;

/**
 * Arguments to {@link fetch}.
 *
 * @typedef {object} FetchConfig
 * @property {string} fetchUrl - The URL to fetch.
 * @property {object} fetchParams - The options object to pass to {@link fetch}.
 * @property {string} fetchParams.method - The request method.
 * @property {Record<string, string>} fetchParams.headers - The request headers.
 * @property {string} fetchParams.body - The request body.
 */

/**
 * Builds {@link json-rpc-engine}-compatible middleware designed for interfacing
 * with Infura's JSON-RPC endpoints.
 *
 * @param {object} [opts] - The options (default: {}).
 * @param {string} [opts.network] - A network that Infura supports; plugs into
 * `https://${network}.infura.io` (default: 'mainnet').
 * @param {number} [opts.maxAttempts] - The number of times a request to Infura
 * should be retried in the case of failure (default: 5).
 * @param {string} [opts.source] - A descriptor for the entity making the
 * request; tracked by Infura for analytics purposes.
 * @param {string} [opts.projectId] - The Infura project id.
 * @param {Record<string, string>} [opts.headers] - Extra headers that will be
 * used to make the request.
 * @returns {Function} The middleware.
 */
function createInfuraMiddleware(opts = {}) {
  const network = opts.network || 'mainnet';
  const maxAttempts = opts.maxAttempts || 5;
  const { source, projectId, headers = {} } = opts;

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
      } catch (err) {
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
 * A utility function that promisifies `setTimeout`.
 *
 * @param {number} length - The number of milliseconds to wait.
 * @returns {Promise<number>} A promise that resolves after the given time has
 * elapsed.
 */
function timeout(length) {
  return new Promise((resolve) => {
    setTimeout(resolve, length);
  });
}

/**
 * Upon making a request, we may get an error that is temporary and
 * intermittent. In these cases we can attempt the request again with the
 * assumption that the error is unlikely to occur again. Here we determine if
 * we have received such an error.
 *
 * @param {Error} err - The error object.
 * @returns {boolean} Whether the request that produced the error can be retried.
 */
function isRetriableError(err) {
  const errMessage = err.toString();
  return RETRIABLE_ERRORS.some((phrase) => errMessage.includes(phrase));
}

/**
 * Makes a request to Infura, updating the given response object if the response
 * has a "successful" status code or throwing an error otherwise.
 *
 * @param {string} network - A network that Infura supports; plugs into
 * `https://${network}.infura.io`.
 * @param {string} projectId - The Infura project id.
 * @param {Record<string, string>} extraHeaders - Extra headers that will be
 * used to make the request.
 * @param {object} req - The original request object obtained via the middleware
 * stack.
 * @param {object} res - The original response object obtained via the
 * middleware stack.
 * @param {string} source - A descriptor for the entity making the request;
 * tracked by Infura for analytics purposes.
 * @throws an error with a detailed message if the HTTP status code is anywhere
 * outside 2xx, and especially if it is 405, 429, 503, or 504.
 */
async function performFetch(
  network,
  projectId,
  extraHeaders,
  req,
  res,
  source,
) {
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
 * Determines the arguments to feed into {@link fetch}.
 *
 * @param {object} options - The options.
 * @param {string} options.network - A network that Infura supports; plugs into
 * `https://${network}.infura.io`.
 * @param {string} options.projectId - The Infura project id.
 * @param {Record<string, string>} [options.extraHeaders] - Extra headers that
 * will be used to make the request.
 * @param {object} options.req - The original request object obtained via the
 * middleware stack.
 * @param {string} [options.source] - A descriptor for the entity making the
 * request; tracked by Infura for analytics purposes.
 * @returns {FetchConfig} An object containing the URL and a bag of options,
 * both of which will be passed to {@link fetch}.
 */
function fetchConfigFromReq({ network, projectId, extraHeaders, req, source }) {
  const requestOrigin = req.origin || 'internal';
  const headers = Object.assign({}, extraHeaders, {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });

  if (source) {
    headers['Infura-Source'] = `${source}/${requestOrigin}`;
  }

  return {
    fetchUrl: `https://${network}.infura.io/v3/${projectId}`,
    fetchParams: {
      method: 'POST',
      headers,
      body: JSON.stringify(normalizeReq(req)),
    },
  };
}

/**
 * Strips out extra keys from a request object that could be rejected by strict
 * nodes like parity.
 *
 * @param {object} req - The original request object obtained via the
 * middleware stack.
 * @returns {Record<'id' | 'jsonrpc' | 'method' | 'params', any>} An object that
 * describes a JSON-RPC request.
 */
function normalizeReq(req) {
  return {
    id: req.id,
    jsonrpc: req.jsonrpc,
    method: req.method,
    params: req.params,
  };
}

/**
 * Builds a JSON-RPC 2.0 internal error object describing a rate-limiting
 * error.
 *
 * @returns {EthereumRpcError} The error object.
 */
function createRatelimitError() {
  const msg = `Request is being rate limited.`;
  return createInternalError(msg);
}

/**
 * Builds a JSON-RPC 2.0 internal error object describing a timeout error.
 *
 * @returns {EthereumRpcError} The error object.
 */
function createTimeoutError() {
  let msg = `Gateway timeout. The request took too long to process. `;
  msg += `This can happen when querying logs over too wide a block range.`;
  return createInternalError(msg);
}

/**
 * Builds a JSON-RPC 2.0 internal error object.
 *
 * @param {string} msg - The message.
 * @returns {EthereumRpcError} The error object.
 */
function createInternalError(msg) {
  return ethErrors.rpc.internal(msg);
}
