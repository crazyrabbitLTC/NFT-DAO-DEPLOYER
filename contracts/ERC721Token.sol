// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Votes.sol";

/// @title ERC721 Token Implementation
/// @notice Extends ERC721 with additional features like enumeration, URI storage, burnability, access control, and voting.
/// @dev Utilizes OpenZeppelin contracts for standardized, secure implementation of ERC721 functionality.
/// @custom:security-contact dennison@tally.xyz
contract ERC721Token is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, AccessControl, EIP712, ERC721Votes {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextTokenId;

    string private _baseURI;
    event BaseURIChanged(string newBaseURI);

    /// @notice Initializes the contract with given parameters.
    /// @param baseURI_ The initial base URI for token metadata.
    /// @param name The name of the token.
    /// @param symbol The symbol of the token.
    constructor(
        string memory baseURI_,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) EIP712(name, "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        _baseURI = baseURI_;
        emit BaseURIChanged(_baseURI);
    }

    /// @dev Internal function to return the base URI for token metadata.
    /// @return The base URI.
    function _baseURI() internal view override returns (string memory) {
        return _baseURI;
    }

    /// @notice Sets a new base URI for token metadata.
    /// @dev Restricted to accounts with the default admin role.
    /// @param newBaseURI The new base URI to set.
    function setBaseURI(string memory newBaseURI) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseURI = newBaseURI;
        emit BaseURIChanged(_baseURI);
    }

    /// @notice Mints a new token with a specified URI to a given address.
    /// @dev Restricted to accounts with the minter role.
    /// @param to The address to mint the token to.
    /// @param uri The URI for the new token's metadata.
    function safeMint(address to, string memory uri) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    /// @dev Internal function to update delegatee for a token.
    /// @param to The address to delegate to.
    /// @param tokenId The token ID.
    /// @param auth The authorized address.
    /// @return The address of the delegatee.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable, ERC721Votes) returns (address) {
        return super._update(to, tokenId, auth);
    }

    /// @dev Internal function to increase the balance of an account for voting.
    /// @param account The account to increase the balance of.
    /// @param value The value to increase the balance by.
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable, ERC721Votes) {
        super._increaseBalance(account, value);
    }

    /// @notice Returns the URI for a given token ID.
    /// @dev Overrides ERC721 and ERC721URIStorage.
    /// @param tokenId The token ID.
    /// @return The URI of the given token ID.
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /// @notice Checks if the contract supports an interface.
    /// @dev Overrides ERC721, ERC721Enumerable, ERC721URIStorage, and AccessControl.
    /// @param interfaceId The interface ID to check.
    /// @return True if the contract supports the interface.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
