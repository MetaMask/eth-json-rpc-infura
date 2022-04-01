import type { JsonRpcRequest } from 'json-rpc-engine';
import type {
  ExtendedJsonRpcRequest,
  RequestHeaders,
  InfuraJsonRpcSupportedNetwork,
} from './types';

interface FetchConfig {
  fetchUrl: string;
  fetchParams: {
    method: string;
    headers: RequestHeaders;
    body: string;
  };
}

/**
 * Determines the arguments to feed into `fetch` in order to make a request to
 * Infura.
 *
 * @param options - The options.
 * @param options.network - A network that Infura supports; plugs into
 * `https://${network}.infura.io`.
 * @param options.projectId - The Infura project id.
 * @param options.extraHeaders - Extra headers that will be used to make the
 * request.
 * @param options.req - The original request object obtained via the
 * middleware stack.
 * @param options.source - A descriptor for the entity making the request;
 * tracked by Infura for analytics purposes.
 * @returns An object containing the URL and a bag of options, both of which
 * will be passed to `fetch`.
 */
export default function fetchConfigFromReq({
  network,
  projectId,
  extraHeaders = {},
  req,
  source,
}: {
  network: InfuraJsonRpcSupportedNetwork;
  projectId: string;
  extraHeaders?: RequestHeaders;
  req: ExtendedJsonRpcRequest<unknown>;
  source?: string | undefined;
}): FetchConfig {
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
 * @param req - The original request object obtained via the middleware stack.
 * @returns An object that describes a JSON-RPC request.
 */
function normalizeReq(
  req: ExtendedJsonRpcRequest<unknown>,
): JsonRpcRequest<unknown> {
  return {
    id: req.id,
    jsonrpc: req.jsonrpc,
    method: req.method,
    params: req.params,
  };
}
