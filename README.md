# DAO Governance Project

## Overview

The DAO Governance Project is a decentralized autonomous organization (DAO) system implemented on the Ethereum blockchain. It leverages smart contracts to enable a community-driven governance mechanism. The project consists of two primary contracts: `DAOGovernor` and `DAOToken`.

### DAOToken (ERC721)

`DAOToken` is an ERC721 token that includes features like enumeration, URI storage, burnability, and voting. This token represents voting power in the DAO, with each token allowing the holder to participate in governance processes.

### DAOGovernor

`DAOGovernor` is the governance contract that allows token holders to propose, vote on, and execute changes within the DAO. It integrates with a TimelockController to ensure proposals are executed securely and with a delay, allowing for community review.

## Setup and Deployment

### Prerequisites

- Node.js and npm installed.
- An Ethereum wallet with Ether for deployment.
- An Infura or Alchemy account for Ethereum network access.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/crazyrabbitLTC/NFT-DAO-DEPLOYER
    ```

2. Install dependencies:
    ```bash
    cd https://github.com/crazyrabbitLTC/NFT-DAO-DEPLOYER
    npm install
    ```

3. Set up environment variables:
    - Create a `.env` file in the root directory.
    - Add environment variables for Ethereum network access and private keys.

### Deployment

To deploy the contracts to the Ethereum network:

1. Configure deployment settings in `scripts/daoConfig.ts`:
    - Set `tokenName`, `tokenSymbol`, `baseURI`, `governorName`, and other parameters.

2. Run the deployment script:
    ```bash
    npx hardhat run scripts/deployDAO.ts --network [yourNetwork]
    ```

3. After successful deployment, note down the contract addresses for `DAOGovernor`, `DAOToken`, and `TimelockController`.

## Testing

The project includes a comprehensive test suite to validate the functionality of the smart contracts.

### Running Tests

To run the tests:

1. Execute the following command:
    ```bash
    npx hardhat test
    ```

2. The test scripts cover various aspects like token minting, access control, proposal creation, voting mechanisms, and the full proposal cycle.

## How the System Works

1. **Token Minting and Distribution**: The `DAOToken` contract allows designated minters to create new tokens and distribute them to community members or stakeholders.

2. **Proposal Creation**: Token holders can create proposals for changes within the DAO using the `DAOGovernor` contract. Proposals include target contract addresses, calldata, and a description.

3. **Voting Process**: Token holders vote on proposals during the defined voting period. Votes are weighted based on the number of tokens held.

4. **Timelock and Execution**: Successful proposals are queued in the TimelockController with a delay, allowing for community oversight. After the delay, proposals can be executed, enacting the proposed changes.

5. **Governance Control**: The `DAOGovernor` contract manages the governance process, ensuring that proposals are handled transparently and securely.

## Contributing

Contributions to the project are welcome. Please follow the standard GitHub fork-and-pull request workflow.

1. Fork the repository.
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Feel free to modify and personalize the README to better fit your project's specific requirements and characteristics.


This project is based on the template:
# Hardhat Template [![Open in Gitpod][gitpod-badge]][gitpod] [![Github Actions][gha-badge]][gha] [![Hardhat][hardhat-badge]][hardhat] [![License: MIT][license-badge]][license]

[gitpod]: https://gitpod.io/#https://github.com/paulrberg/hardhat-template
[gitpod-badge]: https://img.shields.io/badge/Gitpod-Open%20in%20Gitpod-FFB45B?logo=gitpod
[gha]: https://github.com/paulrberg/hardhat-template/actions
[gha-badge]: https://github.com/paulrberg/hardhat-template/actions/workflows/ci.yml/badge.svg
[hardhat]: https://hardhat.org/
[hardhat-badge]: https://img.shields.io/badge/Built%20with-Hardhat-FFDB1C.svg
[license]: https://opensource.org/licenses/MIT
[license-badge]: https://img.shields.io/badge/License-MIT-blue.svg

A Hardhat-based template for developing Solidity smart contracts, with sensible defaults.

- [Hardhat](https://github.com/nomiclabs/hardhat): compile, run and test smart contracts
- [TypeChain](https://github.com/ethereum-ts/TypeChain): generate TypeScript bindings for smart contracts
- [Ethers](https://github.com/ethers-io/ethers.js/): renowned Ethereum library and wallet implementation
- [Solhint](https://github.com/protofire/solhint): code linter
- [Solcover](https://github.com/sc-forks/solidity-coverage): code coverage
- [Prettier Plugin Solidity](https://github.com/prettier-solidity/prettier-plugin-solidity): code formatter

## Getting Started

Click the [`Use this template`](https://github.com/paulrberg/hardhat-template/generate) button at the top of the page to
create a new repository with this repo as the initial state.

## Features

This template builds upon the frameworks and libraries mentioned above, so for details about their specific features,
please consult their respective documentations.

For example, for Hardhat, you can refer to the [Hardhat Tutorial](https://hardhat.org/tutorial) and the
[Hardhat Docs](https://hardhat.org/docs). You might be in particular interested in reading the
[Testing Contracts](https://hardhat.org/tutorial/testing-contracts) section.

### Sensible Defaults

This template comes with sensible default configurations in the following files:

```text
├── .editorconfig
├── .eslintignore
├── .eslintrc.yml
├── .gitignore
├── .prettierignore
├── .prettierrc.yml
├── .solcover.js
├── .solhint.json
└── hardhat.config.ts
```

### VSCode Integration

This template is IDE agnostic, but for the best user experience, you may want to use it in VSCode alongside Nomic
Foundation's [Solidity extension](https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-solidity).

### GitHub Actions

This template comes with GitHub Actions pre-configured. Your contracts will be linted and tested on every push and pull
request made to the `main` branch.

Note though that to make this work, you must use your `INFURA_API_KEY` and your `MNEMONIC` as GitHub secrets.

For more information on how to set up GitHub secrets, check out the
[docs](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions).

You can edit the CI script in [.github/workflows/ci.yml](./.github/workflows/ci.yml).

## Usage

### Pre Requisites

First, you need to install the dependencies:

```sh
$ pnpm install
```

Then, you need to set up all the required
[Hardhat Configuration Variables](https://hardhat.org/hardhat-runner/docs/guides/configuration-variables). You might
also want to install some that are optional.

To assist with the setup process, run `pnpm dlx hardhat vars setup`. To set a particular value, such as a BIP-39
mnemonic variable, execute this:

```sh
$ pnpm dlx hardhat vars set MNEMONIC
? Enter value: ‣ here is where your twelve words mnemonic should be put my friend
```

If you do not already have a mnemonic, you can generate one using this [website](https://iancoleman.io/bip39/).

### Compile

Compile the smart contracts with Hardhat:

```sh
$ pnpm compile
```

### TypeChain

Compile the smart contracts and generate TypeChain bindings:

```sh
$ pnpm typechain
```

### Test

Run the tests with Hardhat:

```sh
$ pnpm test
```

### Lint Solidity

Lint the Solidity code:

```sh
$ pnpm lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ pnpm lint:ts
```

### Coverage

Generate the code coverage report:

```sh
$ pnpm coverage
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true pnpm test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ pnpm clean
```

### Deploy

Deploy the contracts to Hardhat Network:

```sh
$ pnpm deploy:contracts
```

### Tasks

#### Deploy Greeter

Deploy a new instance of the Greeter contract via a task:

```sh
$ pnpm task:deployGreeter --network ganache --greeting "Bonjour, le monde!"
```

#### Set Greeting

Run the `setGreeting` task on the Ganache network:

```sh
$ pnpm task:setGreeting --network ganache --greeting "Bonjour, le monde!" --account 3
```

## Tips

### Syntax Highlighting

If you use VSCode, you can get Solidity syntax highlighting with the
[hardhat-solidity](https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-solidity) extension.

## Using GitPod

[GitPod](https://www.gitpod.io/) is an open-source developer platform for remote development.

To view the coverage report generated by `pnpm coverage`, just click `Go Live` from the status bar to turn the server
on/off.

## Local development with Ganache

### Install Ganache

```sh
$ npm i -g ganache
```

### Run a Development Blockchain

```sh
$ ganache -s test
```

> The `-s test` passes a seed to the local chain and makes it deterministic

Make sure to set the mnemonic in your `.env` file to that of the instance running with Ganache.

## License

This project is licensed under MIT.
