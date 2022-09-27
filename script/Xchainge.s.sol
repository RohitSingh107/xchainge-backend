// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Xchainge.sol";

contract DeployXchainge is Script {
  function run() external {
    // uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // vm.startBroadcast(deployerPrivateKey);
    vm.startBroadcast();
    Xchainge xchainge = new Xchainge();
    vm.stopBroadcast();
  }
}
