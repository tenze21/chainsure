// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ChainSureToken} from "../src/ChainSureToken.sol";
import {Script} from "forge-std/Script.sol";

contract DeployChainSureToken is Script{
    function run() external returns(ChainSureToken){
        vm.startBroadcast();
        ChainSureToken chainsureToken=new ChainSureToken();
        vm.stopBroadcast();
        return chainsureToken;
    }
}