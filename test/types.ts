import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";

import type { TimelockController } from "../types";
import type { DAOGovernor } from "../types";
import type { DAOToken } from "../types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    timelock: TimelockController;
    governor: DAOGovernor;
    token: DAOToken;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
}
