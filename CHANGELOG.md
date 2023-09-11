# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v8.1.2...HEAD
[8.1.2]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v8.1.1...v8.1.2
[8.1.1]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v8.1.0...v8.1.1
[8.1.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v8.0.0...v8.1.0
[8.0.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v7.0.0...v8.0.0
[7.0.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v6.0.0...v7.0.0
[6.0.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v5.1.0...v6.0.0
[5.1.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v5.0.0...v5.1.0
[5.0.0]: https://github.com/MetaMask/eth-json-rpc-infura/compare/v4.1.0...v5.0.0
[4.1.0]: https://github.com/MetaMask/eth-json-rpc-infura/releases/tag/v4.1.0
