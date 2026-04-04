// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ChainSureToken} from "../src/ChainSureToken.sol";
import {Script} from "forge-std/Script.sol";
import {DevOpsTools} from "foundry-devops/src/DevOpsTools.sol";

contract IssuePolicy is Script{
    function run() public {
        address mostRecentDeployedConract= DevOpsTools.get_most_recent_deployment("ChainSureToken", block.chainid);
        issuePolicyOnContract(mostRecentDeployedConract);
    }   
    function issuePolicyOnContract(address contractAddress) public {
        ChainSureToken chainSureToken= ChainSureToken(contractAddress);
        vm.startBroadcast();
        chainSureToken.issuePolicy(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, "SampleSignature", "https://pink-charming-whale-541.mypinata.cloud/ipfs/bafkreidto6c5lbpvpsgql3yusjcetom4n25q3xkztz7n2fwywxzj6vei4q");
        vm.stopBroadcast();
    }
}

contract InvalidatePolicy is Script{
    function run() public {
        address mostRecentDeployedConract= DevOpsTools.get_most_recent_deployment("ChainSureToken", block.chainid);
        invalidatePolicyOnContract(mostRecentDeployedConract);
    }   
    function invalidatePolicyOnContract(address contractAddress) public {
        ChainSureToken chainSureToken= ChainSureToken(contractAddress);
        vm.startBroadcast();
        chainSureToken.invalidatePolicy(0);
        vm.stopBroadcast();
    }
}