# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Simplify `rpcService` parameter type of `createInfuraMiddleware` ([#127](https://github.com/MetaMask/eth-json-rpc-infura/pull/127))
- Bump `@metamask/eth-json-rpc-provider` from `^4.1.7` to `^5.0.0` ([#126](https://github.com/MetaMask/eth-json-rpc-infura/pull/126))
- Bump `@metamask/json-rpc-engine` from `^10.0.2` to `^10.1.0` ([#126](https://github.com/MetaMask/eth-json-rpc-infura/pull/126))

## [10.2.0]
### Added
- Add `sei-mainnet` and `sei-testnet` as Infura supported network ([#117](https://github.com/MetaMask/eth-json-rpc-infura/pull/117))

## [10.1.1]
### Fixed
- Fix middleware so that non-standard JSON-RPC error responses are no longer treated as successful responses ([#123](https://github.com/MetaMask/eth-json-rpc-infura/pull/123))
  - A "non-standard" error response is one with an `error` field but where there are more properties in the error object than expected

## [10.1.0]
### Added
- Add a way to pass an RPC service to `createInfuraMiddleware` ([#116](https://github.com/MetaMask/eth-json-rpc-infura/pull/116))
  - The new, recommended function signature is now `createInfuraMiddleware({ rpcService: AbstractRpcService; options?: { source?: string; headers?: HeadersInit } })`, where `AbstractRpcService` matches the same interface from `@metamask/network-controller`
  - This allows us to support automatic failover to a secondary node when the network goes down

### Changed
- Bump dependencies to remove pre-11.x versions of `@metamask/utils` from dependency tree ([#118](https://github.com/MetaMask/eth-json-rpc-infura/pull/118))
  - Bump `@metamask/eth-json-rpc-provider` from `^4.1.5` to `^4.1.7`
  - Bump `@metamask/json-rpc-engine` from `^10.0.0` to `^10.0.2`
  - Bump `@metamask/rpc-errors` from `^7.0.0` to `^7.0.2`
  - Bump `@metamask/utils` from `^9.1.0` to `^11.1.0`

### Deprecated
- Deprecate passing an RPC endpoint to `createInfuraMiddleware` ([#116](https://github.com/MetaMask/eth-json-rpc-infura/pull/116))
  - See recommended function signature above
  - The existing signature `createInfuraMiddleware({ network?: InfuraJsonRpcSupportedNetwork; maxAttempts?: number; source?: string; projectId: string; headers?: Record<string, string>; })` will be removed in a future major version

## [10.0.0]
### Changed
- **BREAKING**: `@metamask/json-rpc-engine` from `^7.1.1` to `^10.0.0` ([#112](https://github.com/MetaMask/eth-json-rpc-infura/pull/112))
- **BREAKING**: Update `@metamask/rpc-errors` from `^6.0.0` to `^7.0.0` ([#111](https://github.com/MetaMask/eth-json-rpc-infura/pull/111))
- **BREAKING**: Drop support for Node.js versions 16, 21 ([#109](https://github.com/MetaMask/eth-json-rpc-infura/pull/109))

### Removed
- Drop `node-fetch` dependency ([#110](https://github.com/MetaMask/eth-json-rpc-infura/pull/110))

## [9.1.0]
### Added
- Add `linea-sepolia` to `InfuraJsonRpcSupportedNetwork` to allow requests to Linea Sepolia on Infura ([#101](https://github.com/MetaMask/eth-json-rpc-infura/pull/101))

### Changed
- Bump `node-fetch` from `^2.6.7` to `^2.7.0` ([#93](https://github.com/MetaMask/eth-json-rpc-infura/pull/93))

## [9.0.0]
### Changed
- **BREAKING:** Minimum Node.js version is now v16 ([#91](https://github.com/MetaMask/eth-json-rpc-infura/pull/91))
- **BREAKING:** Update dependencies ([#95](https://github.com/MetaMask/eth-json-rpc-infura/pull/95))
  - Bump `@metamask/eth-json-rpc-provider` from `^1.0.0` to `^2.1.0`
  - Bump `@metamask/utils` from `^5.0.1` to `^8.1.0`
  - Update from `eth-rpc-errors`@`^4.0.3` to `@metamask/rpc-errors`@`^6.0.0`
  - Update from `json-rpc-engine`@`^6.1.0` to `@metamask/json-rpc-engine`@`^7.1.0`

## [8.1.2]
### Changed
- Bump `@metamask/utils` to `^5.0.1` ([#87](https://github.com/MetaMask/eth-json-rpc-infura/pull/87))

## [8.1.1]
### Changed
- Bump `@metamask/utils` to `^4.0.0` ([#83](https://github.com/MetaMask/eth-json-rpc-infura/pull/83))
- Replace `eth-json-rpc-middleware` with `@metamask/eth-json-rpc-provider` ([#82](https://github.com/MetaMask/eth-json-rpc-infura/pull/82))

## [8.1.0]
### Added
- Add `linea-goerli` and `linea-mainnet` as Infura supported networks ([#72](https://github.com/MetaMask/eth-json-rpc-infura/pull/72))

## [8.0.0]
### Changed
- **BREAKING:** Update `InfuraJsonRpcSupportedNetwork` with supported networks ([#69](https://github.com/MetaMask/eth-json-rpc-infura/pull/69))
  - The following networks have been removed from this type because they are no longer supported by Infura:
    - 'ropsten'
    - 'rinkeby'
    - 'kovan'
    - 'eth2-beacon-mainnet'
    - 'optimism-kovan'
    - 'arbitrum-rinkeby'

## [7.0.0]
### Added
- Add logging ([#63](https://github.com/MetaMask/eth-json-rpc-infura/pull/63))
  - You will not be able to see log messages by default, but you can turn them on for this library by setting the `DEBUG` environment variable to `metamask:eth-json-rpc-infura:*` or `metamask:*`.

### Changed
- **BREAKING:** Require Node >= 14 ([#62](https://github.com/MetaMask/eth-json-rpc-infura/pull/62))

## [6.0.0] - 2022-05-04
### Added
- Add TypeScript type definitions ([#58](https://github.com/MetaMask/eth-json-rpc-infura/pull/58))

### Changed
- Rename package to `@metamask/eth-json-rpc-infura` ([#61](https://github.com/MetaMask/eth-json-rpc-infura/pull/61))
  - `eth-json-rpc-infura` is deprecated and future releases will no longer occur under this name.
- Upgrade dependencies to make use of new TypeScript type definitions ([#58](https://github.com/MetaMask/eth-json-rpc-infura/pull/58))
  - `eth-json-rpc-middleware`: ^6.0.0 -> ^8.1.0 ([changelog](https://github.com/MetaMask/eth-json-rpc-middleware/blob/main/CHANGELOG.md#810))
  - `eth-rpc-errors`: ^3.0.0 -> ^4.0.3 ([changelog](https://github.com/MetaMask/eth-rpc-errors/blob/main/CHANGELOG.md#403---2021-03-10))
  - `json-rpc-engine`: ^5.3.0 -> ^6.1.0 ([changelog](https://github.com/MetaMask/json-rpc-engine/blob/main/CHANGELOG.md#610---2020-11-20))
- **BREAKING:** Simplify exports ([#58](https://github.com/MetaMask/eth-json-rpc-infura/pull/58))
  - All existing exports are now available under the package entrypoint. For instance, instead of:
    ```
    import createProvider from 'eth-json-rpc-infura/src/createProvider';
    ```
    you must now say:
    ```
    import { createProvider } from '@metamask/eth-json-rpc-infura';
    ```
- **BREAKING:** Add required Node version of >= 12 ([#44](https://github.com/MetaMask/eth-json-rpc-infura/pull/44))

### Security
- Upgrade `node-fetch` to ^2.6.7 ([#42](https://github.com/MetaMask/eth-json-rpc-infura/pull/42), [#53](https://github.com/MetaMask/eth-json-rpc-infura/pull/53))
  - This addresses [GHSA-r683-j2x4-v87g](https://github.com/advisories/GHSA-r683-j2x4-v87g).

## [5.1.0] - 2020-09-22
### Changed
- Update RPC packages ([#40](https://github.com/MetaMask/eth-json-rpc-infura/pull/40))
  - `json-rpc-engine@5.3.0`
  - `eth-json-rpc-middleware@6.0.0`

## [5.0.0] - 2020-09-08
### Changed
- Use Infura API v3 ([#32](https://github.com/MetaMask/eth-json-rpc-infura/pull/32))

## [4.1.0] - 2020-09-03
### Changed
- Use `node-fetch` in place of `cross-fetch` ([#29](https://github.com/MetaMask/eth-json-rpc-infura/pull/28))
- Use `eth-rpc-errors@3.0.0` ([#28](https://github.com/MetaMask/eth-json-rpc-infura/pull/28))
- Use `eth-json-rpc-middleware@4.4.1` ([#15](https://github.com/MetaMask/eth-json-rpc-infura/pull/15))

[Unreleased]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v10.2.0...HEAD
[10.2.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v10.1.1...v10.2.0
[10.1.1]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v10.1.0...v10.1.1
[10.1.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v10.0.0...v10.1.0
[10.0.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v9.1.0...v10.0.0
[9.1.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v9.0.0...v9.1.0
[9.0.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v8.1.2...v9.0.0
[8.1.2]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v8.1.1...v8.1.2
[8.1.1]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v8.1.0...v8.1.1
[8.1.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v8.0.0...v8.1.0
[8.0.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v7.0.0...v8.0.0
[7.0.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v6.0.0...v7.0.0
[6.0.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v5.1.0...v6.0.0
[5.1.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v5.0.0...v5.1.0
[5.0.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v4.1.0...v5.0.0
[4.1.0]: https://github.com/MetaMask/eth-json-rpc-infura/releases/tag/v4.1.0
