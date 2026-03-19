// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChainSureToken
 * @dev ERC721 token representing insurance policies, with minting and invalidation controlled by the contract owner.
*/
contract ChainSureToken is ERC721, Ownable{
    /**
    * @dev Error thrown when an invalid token ID is accessed.
    * @param tokenId The invalid token ID that was accessed.
    */
    error ChainSureToken__InvalidTokenID(uint256 tokenId);

    /** 
     * @dev Emitted when a new insurance policy is issued.
     * @param to The address that received the new policy token.
     * @param tokenId The ID of the newly issued policy token.
     */
    event PolicyIssued(address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when an insurance policy is invalidated.
     * @param tokenId The ID of the policy token that was invalidated.
     */
    event PolicyInvalidated(uint256 indexed tokenId);

    /**
     * @dev Mapping of policy signatures to their respective token IDs.
    */
    mapping(uint256 => string) private policySignatures;

    /**
     * @dev Mapping to track invalidated policies by their token IDs.
    */
    mapping(uint256 => bool) private invalidPolicies;

    uint256 private _nextTokenID;
    string private _baseTokenURI;

    constructor(string memory baseURI) ERC721("Insurance Policy", "CIP") Ownable(msg.sender){
        _nextTokenID=0;
        _baseTokenURI=baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function issuePolicy(address to, string memory signature) external onlyOwner{
        uint256 tokenId = _nextTokenID++;
        _safeMint(to, tokenId);
        policySignatures[tokenId] = signature;
        emit PolicyIssued(to, tokenId);
    }

    function invalidatePolicy(uint256 tokenId) external onlyOwner {
        if(tokenId >= _nextTokenID){
            revert ChainSureToken__InvalidTokenID(tokenId);
        }
        invalidPolicies[tokenId] = true;
        emit PolicyInvalidated(tokenId);
    }

    function getPolicySignature(uint256 tokenId) external view returns (string memory) {
        if(tokenId >= _nextTokenID){
            revert ChainSureToken__InvalidTokenID(tokenId);
        }
        return policySignatures[tokenId];
    }

    function isPolicyInvalid(uint256 tokenID) external view returns(bool){
        if(tokenID >= _nextTokenID){
            revert ChainSureToken__InvalidTokenID(tokenID);
        }
        return invalidPolicies[tokenID];
    }
}