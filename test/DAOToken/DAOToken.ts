import { expect } from "chai";
import { ethers } from "hardhat";
import type { DAOToken } from "../../types"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DAOToken Contract", function () {
    let daoToken: DAOToken;
    let admin: SignerWithAddress, minter:SignerWithAddress, user: SignerWithAddress;
const baseURI = "https://base.uri/";
    beforeEach(async function () {
        // Deploy the DAOToken contract
        const DAOTokenFactory = await ethers.getContractFactory("DAOToken");
        [admin, minter, user] = await ethers.getSigners();
        daoToken = await DAOTokenFactory.deploy(baseURI, "DAOToken", "DAO");

        // Grant MINTER_ROLE to minter
        await daoToken.grantRole(ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE")), minter.address);
    });

    describe("Access Control", function () {
        it("should allow only admin to set Base URI", async function () {
            await expect(daoToken.connect(minter).setBaseURI("https://new.base.uri/")).to.be.reverted;
            await expect(daoToken.connect(admin).setBaseURI("https://new.base.uri/")).to.not.be.reverted;
        });

        it("should allow only minter to mint new tokens", async function () {
            await expect(daoToken.connect(user).safeMint(user.address, "uri")).to.be.reverted;
            await expect(daoToken.connect(minter).safeMint(user.address, "uri")).to.not.be.reverted;
        });
    });

    describe("Minting", function () {
        it("should mint token with correct URI", async function () {
            await daoToken.connect(minter).safeMint(user.address, "tokenURI");
            expect(await daoToken.tokenURI(0)).to.equal(baseURI.concat("tokenURI"));
        });
    });

    describe("Base URI", function () {
        it("should update base URI correctly", async function () {
            await daoToken.connect(admin).setBaseURI("https://new.base.uri/");
            expect(await daoToken.baseURI()).to.equal("https://new.base.uri/");
        });
    });

    describe("ERC721 Compliance", function () {
        beforeEach(async function () {
            await daoToken.connect(minter).safeMint(admin.address, "tokenURI");
        });

        it("should transfer tokens correctly", async function () {
            await daoToken.connect(admin).transferFrom(admin.address, user.address, 0);
            expect(await daoToken.ownerOf(0)).to.equal(user.address);
        });

        // Additional tests for enumeration, balance, etc.
    });

    // Additional tests for ERC721Votes and other functionalities.
});
