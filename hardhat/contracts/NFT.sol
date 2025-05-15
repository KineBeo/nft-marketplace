// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title NFT
 * @dev ERC721URIStorage is used instead of ERC721 because it handles storage and retrieval
 * of token URIs (metadata) in a more gas-efficient way, especially for tokens with metadata.
 */
contract NFT is ERC721URIStorage {
    uint256 private _nextTokenId;

    address private immutable marketplaceAddress;
    mapping(uint256 => address) private _creators;

    event TokenMinted(uint256 indexed tokenId, string tokenURI, address marketplaceAddress);

    constructor(address _marketplaceAddress) ERC721("MarkKop", "MARK") {
        marketplaceAddress = _marketplaceAddress;
    }

    /**
     * @dev Mints a new token with the provided URI
     * @param tokenURI The URI for the token metadata
     * @return The ID of the newly minted token
     */
    function mintToken(string memory tokenURI) public returns (uint256) {
        uint256 newItemId = ++_nextTokenId;
        _mint(msg.sender, newItemId);
        _creators[newItemId] = msg.sender;
        _setTokenURI(newItemId, tokenURI);

        // Give the marketplace approval to transact NFTs between users
        setApprovalForAll(marketplaceAddress, true);

        emit TokenMinted(newItemId, tokenURI, marketplaceAddress);
        return newItemId;
    }

    /**
     * @dev Returns an array of all tokens owned by the caller
     * @return An array of token IDs owned by the caller
     */
    function getTokensOwnedByMe() public view returns (uint256[] memory) {
        uint256 numberOfExistingTokens = _nextTokenId;
        uint256 numberOfTokensOwned = balanceOf(msg.sender);
        uint256[] memory ownedTokenIds = new uint256[](numberOfTokensOwned);

        uint256 currentIndex = 0;
        for (uint256 i = 0; i < numberOfExistingTokens; i++) {
            uint256 tokenId = i + 1;
            if (ownerOf(tokenId) != msg.sender) continue;
            ownedTokenIds[currentIndex] = tokenId;
            currentIndex += 1;
        }

        return ownedTokenIds;
    }

    /**
     * @dev Returns the creator of a specific token
     * @param tokenId The ID of the token
     * @return The address of the token's creator
     */
    function getTokenCreatorById(uint256 tokenId) public view returns (address) {
        return _creators[tokenId];
    }

    /**
     * @dev Returns an array of all tokens created by the caller
     * @return An array of token IDs created by the caller
     */
    function getTokensCreatedByMe() public view returns (uint256[] memory) {
        uint256 numberOfExistingTokens = _nextTokenId;
        uint256 numberOfTokensCreated = 0;

        for (uint256 i = 0; i < numberOfExistingTokens; i++) {
            uint256 tokenId = i + 1;
            if (_creators[tokenId] != msg.sender) continue;
            numberOfTokensCreated += 1;
        }

        uint256[] memory createdTokenIds = new uint256[](numberOfTokensCreated);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < numberOfExistingTokens; i++) {
            uint256 tokenId = i + 1;
            if (_creators[tokenId] != msg.sender) continue;
            createdTokenIds[currentIndex] = tokenId;
            currentIndex += 1;
        }

        return createdTokenIds;
    }
} 