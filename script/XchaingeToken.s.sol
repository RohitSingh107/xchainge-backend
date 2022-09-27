// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/XchaingeToken.sol";

contract DeployXchaingeToken is Script {
  function run() external {
    // uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // vm.startBroadcast(deployerPrivateKey);
    vm.startBroadcast();
    XchaingeToken xchaingeToken = new XchaingeToken();
    vm.stopBroadcast();
  }
}
