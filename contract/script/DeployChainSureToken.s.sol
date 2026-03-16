// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ChainSureToken} from "../src/ChainSureToken.sol";
import {Script} from "forge-std/Script.sol";

contract DeployChainSureToken is Script{
    function run() external returns(ChainSureToken){
        string memory baseURI= "https://pink-charming-whale-541.mypinata.cloud/ipfs/bafybeiawrmzn46oee4opfn5ji4blpewo7hrwiszwxv5dikto2gw6fiarmy/";
        vm.startBroadcast();
        ChainSureToken chainsureToken=new ChainSureToken(baseURI);
        vm.stopBroadcast();
        return chainsureToken;
    }
}