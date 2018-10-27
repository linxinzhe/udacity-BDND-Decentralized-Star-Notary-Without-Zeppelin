pragma solidity ^0.4.23;

import './ERC721Token.sol';

contract StarNotary is ERC721Token {

    struct Coordinator {
        string ra;
        string dec;
        string mag;
        string cent;
    }

    struct Star {
        string name;
        Coordinator coordinator;
        string story;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;
    mapping(uint256 => bool) public coordinatorTaken;

    function createStar(string _name, string _story, string _ra, string _dec, string _mag, string _cent, uint256 _tokenId) public {
        require(checkIfStarExist(_tokenId) == false, "Star is already exist");

        Coordinator memory newCoordinator = Coordinator(_ra, _dec, _mag, _cent);
        Star memory newStar = Star(_name, newCoordinator, _story);

        tokenIdToStarInfo[_tokenId] = newStar;
        coordinatorTaken[uint256(keccak256(_ra, _dec, _mag, _cent))] = true;

        ERC721Token.mint(_tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);

        require(msg.value >= starCost);

        clearPreviousStarState(_tokenId);

        transferFromHelper(starOwner, msg.sender, _tokenId);

        if (msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }

        starOwner.transfer(starCost);
    }

    function clearPreviousStarState(uint256 _tokenId) private {
        //clear approvals 
        tokenToApproved[_tokenId] = address(0);

        //clear being on sale 
        starsForSale[_tokenId] = 0;
    }

    function checkIfStarExist(uint256 _tokenId) public view returns (bool){
        Coordinator memory coordinator = tokenIdToStarInfo[_tokenId].coordinator;
        return coordinatorTaken[uint256(keccak256(coordinator.ra, coordinator.dec, coordinator.mag, coordinator.cent))];
    }

    function starsForSale(uint256 _tokenId) public view returns (uint256){
        return starsForSale[_tokenId];
    }

    function tokenIdToStarInfo(uint256 _tokenId) public view returns (string, string, string, string, string){
        Star memory star = tokenIdToStarInfo[_tokenId];
        return (star.name, star.story, star.coordinator.ra, star.coordinator.dec, star.coordinator.mag);
    }
}