// SPDX-License-Identifier: GPL3
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract XchaingeToken is ERC721, ERC721URIStorage, Ownable {
  event NFTMinted(address indexed to, uint256 indexed tokenId);

  constructor() ERC721("XchaingeToken", "OWN") {}

  function safeMint(uint256 tokenId, string memory uri) public {
    _safeMint(msg.sender, tokenId);
    _setTokenURI(tokenId, uri);
    emit NFTMinted(msg.sender, tokenId);
  }

  // The following functions are overrides required by Solidity.

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);
  }

  function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
  {
    return super.tokenURI(tokenId);
  }
}
