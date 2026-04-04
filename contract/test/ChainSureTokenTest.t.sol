// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {ChainSureToken} from "../src/ChainSureToken.sol";
import {DeployChainSureToken} from "../script/DeployChainSureToken.s.sol";

contract ChainSureTokenTest is Test{
    ChainSureToken private chainSureToken;
    DeployChainSureToken private deployer;
    address user = address(1);

    event PolicyIssued(address indexed to, uint256 indexed tokenId);

    function setUp() public{
        deployer= new DeployChainSureToken();
        chainSureToken= deployer.run();

    }

    modifier issuePolicy(){
        vm.prank(chainSureToken.owner());
        chainSureToken.issuePolicy(user, "SampleSignature", "https://mypinata.cloud/ipfs/example");
        _;
    }

    function testPolicyGetsIssuedToUser() public issuePolicy{
        assertEq(chainSureToken.ownerOf(0), user);
    }

    function testTokenUriIsSetOnIssue() public issuePolicy{
        string memory tokenURI= chainSureToken.tokenURI(0);
        assertEq(tokenURI, "https://mypinata.cloud/ipfs/example");
    }

    function testPolicySignatureIsStored() public issuePolicy{
        string memory signature = chainSureToken.getPolicySignature(0);
        assertEq(signature, "SampleSignature");
    }

    function testPolicyInvalidation() public issuePolicy{
        vm.prank(chainSureToken.owner());
        chainSureToken.invalidatePolicy(0);
        assertTrue(chainSureToken.isPolicyInvalid(0));
    }

    function testthrowsInvalidTokenIDOnGetSignature() public {
        vm.expectRevert(abi.encodeWithSelector(ChainSureToken.ChainSureToken__InvalidTokenID.selector, 999));
        chainSureToken.getPolicySignature(999);
    }

    function testthrowsInvalidTokenIDOnCheckInvalid() public {
        vm.expectRevert(abi.encodeWithSelector(ChainSureToken.ChainSureToken__InvalidTokenID.selector, 999));
        chainSureToken.isPolicyInvalid(999);
    }

    function testIssuePolicyEmitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit ChainSureToken.PolicyIssued(user, 0);
        vm.prank(chainSureToken.owner());
        chainSureToken.issuePolicy(user, "SampleSignature", "https://mypinata.cloud/ipfs/example");
    }

    function testInvalidatePolicyEmitsEvent() public issuePolicy{
        vm.expectEmit(true, true, true, true);
        emit ChainSureToken.PolicyInvalidated(0);
        vm.prank(chainSureToken.owner());
        chainSureToken.invalidatePolicy(0);
    }
}