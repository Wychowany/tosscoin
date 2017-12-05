pragma solidity 0.4.18;

contract TossCoin {

	address player1;
	address player2;
	address oracle;
	uint value;

	function TossCoin(address _oracle) payable public {
		oracle = _oracle;
		player1 = msg.sender;
		value = msg.value;
	}

	function join() payable public {
		require(msg.value == value);
		require(player2 == 0x0);
		player2 = msg.sender;
	}

	function settle(address winner) public {
		require(msg.sender == oracle);
		require(player1 == winner || player2 == winner);
		winner.transfer(this.balance);
	}
}