// ALEKSANDER NUSZEL //

var TossCoin = artifacts.require('./TossCoin.sol'); 
import exceptThrow from 'zeppelin-solidity/test/helpers/expectThrow';


contract ('TossCoin', function(accounts){

    let toss;
    let amount = 124123132;
    const oracle = accounts[0];

    async function redeploy(){
        toss = await TossCoin.new(oracle, {from: accounts[1], value: amount});
    }
    const deployer_before = web3.eth.getBalance(accounts[1]); // it is only used for the first test

    beforeEach(redeploy);

    // it changes anyway even if the amount equals 0, due to used gas 
    it("change balance of the deployer", async function(){
       const deployer_after = await web3.eth.getBalance(accounts[1]);
       let balance_after_deployment = await web3.eth.getBalance(toss.address); 
       assert.isFalse(deployer_before.equals(deployer_after)); 
    
    });

    it("contract's balance equals the value that creator sent", async function(){
        let balance_after_deployment = await web3.eth.getBalance(toss.address);
        assert.isTrue(balance_after_deployment.equals(amount));
    });

    it("contract's balance equals value * 2 after second participant joined", async function(){
        let joining = accounts[3];
        await toss.join({from: joining, value: amount});
        let balance_after_joined = await web3.eth.getBalance(toss.address);
        assert.isTrue(balance_after_joined.equals(2*amount));
    });

    it("contract's balance equals 0 after oracle judges", async function(){
        let joining = accounts[3];
        let winner = accounts[3];
        await toss.join({from: joining, value: amount});
        await toss.settle(winner,{from: oracle});
        let balance_after_settle_executed = await web3.eth.getBalance(toss.address);
        assert.isTrue(balance_after_settle_executed.equals(0));
    });

    it("change balance of the joining participant", async function() {
        let joining = accounts[3];
        const joining_participant_before = await web3.eth.getBalance(joining);
        await toss.join({from: joining, value: amount});
        const joining_participant_after = await web3.eth.getBalance(joining);
        assert.isFalse(joining_participant_after.equals(joining_participant_before));
    });

    it("check if oracle's balance after settle is diffetent", async function() {
        let joining = accounts[3];
        let winner = accounts[3];
        await toss.join({from: joining, value: amount});
        let balance_before_settle_executed = await web3.eth.getBalance(oracle);
        await toss.settle(winner,{from: oracle});
        let balance_after_settle_executed = await web3.eth.getBalance(oracle);
        assert.isFalse(balance_before_settle_executed.equals(balance_after_settle_executed));
    });

    it("should throw an exception when winner decides", async function(){
        let winner = accounts[1];
        let looser = accounts[2];
        await toss.join({from: looser, value: amount});
        await exceptThrow(toss.settle(winner, {from:winner}));
    });

    it("should throw an exception when looser decides", async function(){
        let winner = accounts[1];
        let looser = accounts[2];
        await toss.join({from: looser, value: amount});
        await exceptThrow(toss.settle(winner, {from:looser}));
    });

    it("should throw an exception when other person decides", async function() {
        let winner = accounts[1];
        let looser = accounts[2];
        await toss.join({from: accounts[2], value: amount});
        await exceptThrow(toss.settle(winner, {from: accounts[3]}));
    });

    it("should throw an exception when winner is not participant", async function (){
        let winner = accounts[1];
        let looser = accounts[2];
        await toss.join({from: accounts[2], value: amount});
        await exceptThrow(toss.settle(accounts[5], {from: oracle}));
    });
    
    it("should throw an exception when second participant tries to join again", 
    async function(){
        await toss.join({from: accounts[2], value: amount});
        await exceptThrow(toss.join({from: accounts[2], value: amount}));
    });

    it("should throw an exception when second participant has already joined and other wants to join", 
    async function(){
        await toss.join({from: accounts[2], value: amount});
        await exceptThrow(toss.join({from: accounts[4], value: amount}));
    });

    it("should throw an axception when second's participant value is different", 
    async function(){
        await exceptThrow(toss.join({from: accounts[2], value: amount + 4}));
    });

    it("change contract's balance after participant joined", async function(){
        let winner = accounts[1];
        let looser = accounts[2];
        const contract_balance_before = await web3.eth.getBalance(toss.address);
        await toss.join({from: accounts[2], value: amount});
        const contract_balance_after = await web3.eth.getBalance(toss.address);
        assert.isTrue(contract_balance_after.equals(contract_balance_before.plus(amount)));
        assert.isTrue(contract_balance_after.equals(2 * amount));
    });
    
    it("change contract's blance after oracle executes settle function", async function(){
        let winner = accounts[3];
        let looser = accounts[1];
        await toss.join({from: accounts[3], value: amount});
        const contract_balance_before = await web3.eth.getBalance(toss.address)
        await toss.settle(winner, {from: oracle});
        const contract_balance_after = await web3.eth.getBalance(toss.address)
        assert.isTrue(contract_balance_before.equals(contract_balance_after.plus(2*amount)));
    });

    it("change balance of the winner after oracle and shouldnt change looser's balance"
    , async function() {
        let winner = accounts[1];
        let looser = accounts[2];
        await toss.join({from: looser, value: amount});
        const balance_of_winner_before = await web3.eth.getBalance(winner);
        const balance_of_looser_before = await web3.eth.getBalance(looser);
        await toss.settle(winner, {from: oracle});
        const balance_of_winner_after = await web3.eth.getBalance(winner);
        const balance_of_looser_after = await web3.eth.getBalance(looser);
        assert.isTrue(balance_of_winner_after.equals(balance_of_winner_before.plus(2*amount)));
        assert.isTrue(balance_of_looser_before.equals(balance_of_looser_after));
    });

    
});