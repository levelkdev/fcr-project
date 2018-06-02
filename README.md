# fcr-project

A collection of repos used to interact with [Futarchy Curated Registry](https://github.com/levelkdev/tcr)

## Setup and Run

Run `npm install` in `fcr-cli`, `fcr-js`, and `fcr-web` directories.

In `fcr-cli`, run `npm run build`. To use the CLI, add `fcr-cli/build` to your system $PATH, then use the `fcr` command in your terminal.

Deploy the [Futarchy Curated Registry](https://github.com/levelkdev/tcr) contracts:
  * `npm run ganache`
  * `truffle migrate`

Start the web app: `npm start` from the `fcr-web` directory

Submit a listing application, for example:

```
# applies "new listing application" with deposit of 1000, from account at index 2

$ fcr apply "new listing application" 1000 --from=2
```

## Projects

### fcr-cli

Command line utility for interacting with FCR contracts.

Run it from the `fcr-cli` directory with `node src/index.js --help`, or build the `fcr` binary with `npm run build`.

### fcr-config

Stores config for FCR contract addresses on local, testnet, and (eventually) mainnet

### fcr-js

JS modules that expose transactions and calls to FCR contracts. Designed to be used by clients, currently `fcr-cli` and `fcr-web`

### fcr-web

Web application for FCR. Start with `npm start`

