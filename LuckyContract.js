'use strict';
//{10001:参数错误}

var CommCode = {
    "OK":200,
    "FAIL":400,
    "PermissionError":403,
    "ParamsError":10001,
    "ObjectIsNull":10002,
    "LtMinNas":10003
}


var LuckyContract = function () {
    LocalContractStorage.defineMapProperty(this, "gameMap");
    LocalContractStorage.defineMapProperty(this, "gameIndex");

    LocalContractStorage.defineMapProperty(this, "userGameMap");
    LocalContractStorage.defineMapProperty(this, "userGameNums");
    LocalContractStorage.defineMapProperty(this, "userGameIndex");

    LocalContractStorage.defineMapProperty(this, "userBetMap");
    LocalContractStorage.defineMapProperty(this, "userBetNums");
    LocalContractStorage.defineMapProperty(this, "userBetIndex");


  };
  
LuckyContract.prototype = {
    init: function () {
        this.netConfig = {
            mainnet: {
                admin: "n1HH4bfu2w1ZC22MfSKH7YjNqtyoNHHHrY3"
            },
            testnet: {
                admin: "n1VmVAnAL3WA69HSrpMTCfn9VpZ9AXJ4kiN"
            }
        }
        this.bigNumber = 1000000000000000000;
        //var runEnv = "mainnet";
        var runEnv = "testnet";
        this.envConfig = this.netConfig[runEnv];
        this.adminAddress = this.envConfig.admin;
        this.minNasCanBet = new BigNumber(0.01); 
        this.tax = 0.01;
      },

    takeout: function(address, value) {//取钱，address：发送的地址，value：取出的金额
        var fromUser = Blockchain.transaction.from
        if (fromUser != this.adminAddress) {//注意：这里判断了是否来自管理员的操作
            throw new Error(CommCode.PermissionError);
        }

        var amount = new BigNumber(value * this.bigNumber);
        var result = Blockchain.transfer(address, amount)//转账到指定地址
        return result
    },

    _verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return result == 0 ? false : true
    },
    //[{"title":"cxp1","betOption":["one","two"],"optionNum":2}]
    creatGame:function(gameInfo){
        
        if(!gameInfo.title || !gameInfo.betOption || !gameInfo.optionNum){
            throw new Error(CommCode.ParamsError);
        }
        
        var ts = Blockchain.transaction.timestamp,
            fromUser = Blockchain.transaction.from,
            txhash = Blockchain.transaction.hash;

        var game = {
            hash: txhash,
            createTime:ts,
            author: fromUser,

            title:gameInfo.title,
            betOption:gameInfo.betOption,
            optionNum:parseInt(gameInfo.optionNum),
            betAmount: [],

        }
        

        for(var i=0;i<game.optionNum;i++){
            game.betAmount.push(new BigNumber(0));
        }


        this.gameMap.set(txhash, game);
        this.gameNums += 1; 
        
        var userGameNums = this.userGameNums.get(fromUser) * 1;
        var userGameIndexKey = fromUser + "." + userGameNums;
        this.userGameIndex.set(userGameIndexKey,txhash);
        this.userGameNums.set(fromUser, userGameNums + 1);
        
        return "create game info =" + JSON.stringify(game);
    },

    t_creatGame:function(hash){
        return "game info ="+JSON.stringify(this.gameMap.get(hash));
    },

    userBet:function(betInfo){
        if(!betInfo.txhash || !betInfo.index){
            throw new Error(CommCode.ParamsError);
        }

        var amount = new BigNumber(Blockchain.transaction.value);
        if(amount.lt(this.minNasCanBet)){
            throw new Error(CommCode.LtMinNas);
        }

        var game = this.gameMap.get(betInfo.txhash);
        if(!game){
            throw new Error(CommCode.ObjectIsNull);
        }

        var cruTotalBet = game.betAmount[betInfo.index];
        var newTotalBet = cruTotalBet.plus(amount);

        this.gameMap.set(betInfo.txhash,game);


        var userBetNums = this.userBetNums.get(fromUser) * 1;
        var userBetIndexKey = fromUser + "." + userGameNums;
        this.userBetIndex.set(userBetIndexKey,txhash);
        this.userBetNums.set(fromUser, userBetNums + 1);
 
    },

    setGameResult:function(resultInfo){

    },

    _calculateGameResult:function(){

    },

}


module.exports = LuckyContract;