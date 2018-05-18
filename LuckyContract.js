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
    //all game
    LocalContractStorage.defineMapProperty(this, "gameMap");
    LocalContractStorage.defineMapProperty(this, "gameIndex");

    //user game into
    LocalContractStorage.defineMapProperty(this, "userGameMap");
    LocalContractStorage.defineMapProperty(this, "userGameNums");
    LocalContractStorage.defineMapProperty(this, "userGameIndex");

    //user bet info
    LocalContractStorage.defineMapProperty(this, "userBetMap");
    LocalContractStorage.defineMapProperty(this, "userBetNums");
    LocalContractStorage.defineMapProperty(this, "userBetIndex");

    //bet info
    LocalContractStorage.defineMapProperty(this, "betUserAddress");
    LocalContractStorage.defineMapProperty(this, "betUserNums");

    //attribute
    LocalContractStorage.defineProperty(this, "netConfig");
    LocalContractStorage.defineProperty(this, "bigNumber");
    LocalContractStorage.defineProperty(this, "envConfig");
    LocalContractStorage.defineProperty(this, "adminAddress");
    LocalContractStorage.defineProperty(this, "minNasCanBet");
    LocalContractStorage.defineProperty(this, "tax");
    LocalContractStorage.defineProperty(this, "gameNums");

  };
  
LuckyContract.prototype = {
    init:function () {
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
        this.minNasCanBet = 0.01 * this.bigNumber;
        this.tax = 0.01;
        this.gameNums = 0;
    },

    takeout:function(address, value) {//取钱，address：发送的地址，value：取出的金额
        var fromUser = Blockchain.transaction.from
        if (fromUser != this.adminAddress) {//注意：这里判断了是否来自管理员的操作
            throw new Error(CommCode.PermissionError);
        }

        var amount = new BigNumber(value * this.bigNumber);
        var result = Blockchain.transfer(address, amount)//转账到指定地址
        return result
    },

    _verifyAddress:function (address) {
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
            from: fromUser,

            title:gameInfo.title,
            betOption:gameInfo.betOption,
            optionNum:parseInt(gameInfo.optionNum),
            betAmount: {},
            betUserInfo: {},
            betUserNums:{}
        }
        

        for(var i=0;i<game.optionNum;i++){
            var curOption = game.betOption[i];
            game.betAmount[curOption] = new BigNumber(0);
            game.betUserInfo[curOption] = {};
            game.betUserNums[curOption] = 0;
        }


        this.gameMap.set(txhash, game);
        this.gameNums += 1; 
        this.gameIndex.set(this.gameNums,txhash);
        
        var userGameNums = this.userGameNums.get(fromUser) * 1;
        var userGameIndexKey = fromUser + "." + userGameNums;
        this.userGameIndex.set(userGameIndexKey,txhash);
        this.userGameNums.set(fromUser, userGameNums + 1);
        
        return "create game info =" + JSON.stringify(game);
    },

    t_creatGame:function(hash){
        return "game info ="+JSON.stringify(this.gameMap.get(hash));
    },

    //[{"txhash":"817943f9571b86909d535bc01e25f87afa6d525773d349b331fa623aadec0e1f","index":1}]
    userBet:function(betInfo){
        if(!betInfo.txhash || !betInfo.index){
            throw new Error(CommCode.ParamsError);
        }
        var ts = Blockchain.transaction.timestamp,
        fromUser = Blockchain.transaction.from,
        txhash = Blockchain.transaction.hash;

        var amount = Blockchain.transaction.value;
        if(amount.lt(this.minNasCanBet)){
            throw new Error(CommCode.LtMinNas);
        }

        var game = this.gameMap.get(betInfo.txhash);
        if(!game){
            throw new Error(CommCode.ObjectIsNull);
        }

        // var cruTotalBet = game.betAmount[betInfo.index];
        // var newTotalBet = cruTotalBet.plus(amount);
        var curOption = game.betOption[betInfo.index];
        game.betAmount[curOption] = game.betAmount[curOption].plus(amount);
        game.betUserNums[curOption] += 1;

        var betUser = game.betUserInfo[curOption][fromUser];
        if(!betUser){
            betUser = {
                "form":fromUser,
                "bet":amount,
                "betTime":ts,
            }
        }else{
            betUser.bet = betUser.bet.plus(amount);
            betUser.betTime = ts;
        }

        game.betUserInfo[curOption][fromUser] = betUser;

        this.gameMap.set(betInfo.txhash,game);

        var userBetNums = this.userBetNums.get(fromUser) * 1;
        var userBetIndexKey = fromUser + "." + userGameNums;
        this.userBetIndex.set(userBetIndexKey,txhash);
        this.userBetNums.set(fromUser, userBetNums + 1);
 
    },

    t_userBet:function(){
        var amount = Blockchain.transaction.value;
        var have = true;
        if(amount.lt(this.minNasCanBet)){
            have = false;
        }

        return "t_userBet : " + JSON.stringify(amount) +" have:" + have;
    },

    t1_userBet:function(value){

        var aa = value * this.bigNumber;

        return "t1_userBet : " + aa;
    },

    t2_userBet:function(){

        return "t2_userBet : " + this.minNasCanBet;
    },

    t3_userBet:function(){
        var amount = Blockchain.transaction.value;
        return "t3_userBet : " + amount;
    },

    setGameResult:function(resultInfo){

    },

    _calculateGameResult:function(){

    },

}


module.exports = LuckyContract;