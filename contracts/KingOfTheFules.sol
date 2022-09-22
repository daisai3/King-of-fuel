// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract KingOfTheFules {
    using SafeERC20 for IERC20;

    struct KingInfo {
        uint256 amount;
        address account;
    }

    KingInfo public currentKing;
    IERC20 public stakingToken;

    event KingChanged(address indexed currentKing, address indexed prevKing);

    /**
     * @notice Constructor
     * @param _stakingToken  address of staking token
     */
    constructor(IERC20 _stakingToken) {
        require(
            address(_stakingToken) != address(0),
            "Zero address: stakingToken"
        );
        stakingToken = _stakingToken;
    }

    /**
     * @notice Get min amount to steal crown
     */
    function getMinAmounToStealCrown() public view returns (uint256) {
        return (currentKing.amount * 150) / 100;
    }

    /**
     * @notice Get info of current king
     */
    function getCurrentKing()
        public
        view
        returns (address account, uint256 amount)
    {
        account = currentKing.account;
        amount = currentKing.amount;
    }

    /**
     * @notice Steal crown
     * @param _amount  amount of staking token
     */
    function stealCrown(uint256 _amount) public {
        require(_amount != 0, "Amount can't be 0!");
        require(_amount >= getMinAmounToStealCrown(), "Not enough amount!");
        require(msg.sender != currentKing.account, "Sender is current king!");

        address prevKing = currentKing.account;

        currentKing.amount = _amount;
        currentKing.account = msg.sender;

        if (prevKing != address(0)) {
            stakingToken.safeTransferFrom(msg.sender, prevKing, _amount);
        }

        emit KingChanged(msg.sender, prevKing);
    }
}
