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
        this.contractAddress = null;
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

    setContractAddress = function(address){
        if(this._verifyAddress(address)){
            this.contractAddress = address;
        }else{
            throw new Error(CommCode.PermissionError);
        }
        
    },

    _verifyAddress:function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return result == 0 ? false : true
    },
    //[{"title":"cxp1","betOption":["one","two"],"optionNum":2}]
    createGame:function(gameInfo){
        
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
            game.betAmount[curOption] = 0;
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

    getGameByHash:function(hash){
        if(hash == undefined){
            throw new Error(CommCode.ParamsError);
        }
        return this.gameMap.get(hash);
    },

    getGameList:function(limit,offset){
        if(limit == undefined || offset == undefined){
            throw Error(CommCode.ParamsError);
        }

        var fromUser = Blockchain.transaction.from,
            total = this.gameNums,
            result = {
                total: total,
                games: []
            };

        if (!total) {
            return result
        }

        if (offset == -1) {
            offset = total
        }

        for (var i = offset; i > offset - limit; i--) {
            var txhash = this.gameIndex.get(i);
            var gameInfo = this.gameMap.get(txhash);
            if (gameInfo) {
                result.games.push(gameInfo)
            }
        }

        return result;

    },

    t_creatGame:function(hash){
        return "game info ="+JSON.stringify(this.gameMap.get(hash));
    },

    //[{"title":"cxp1","betOption":["one","two"],"optionNum":2}]
    //[{"txhash":"b3cc0fbf675592d7d5d60961ea16c3eeaf5fab17403a4b8428492bb481ed3bf2","index":0}]
    userBet:function(betInfo){
        if(!betInfo.txhash){
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

        var curOption = game.betOption[betInfo.index];
        game.betAmount[curOption] = new BigNumber(game.betAmount[curOption]).plus(amount);
       
        var betUser = game.betUserInfo[curOption][fromUser];
        if(!betUser){
            betUser = {
                "form":fromUser,
                "bet":amount,
                "betTime":ts,
            }
            game.betUserNums[curOption] += 1;
        }else{
            betUser.bet = new BigNumber(betUser.bet).plus(amount);
            betUser.betTime = ts;
        }

        game.betUserInfo[curOption][fromUser] = betUser;

        this.gameMap.set(betInfo.txhash,game);

        var userBetNums = this.userBetNums.get(fromUser) * 1;
        userBetNums += 1;
        this.userBetNums.set(fromUser, userBetNums);

        var userBetIndexKey = fromUser + "." + userBetNums;
        this.userBetIndex.set(userBetIndexKey,txhash);
 
        var userBetInfo={
            "game":game.hash,
            "option":betInfo.index,
            "form":fromUser,
            "bet":amount,
            "betTime":ts
        }

        this.userBetMap.set(txhash,userBetInfo);

        var result ={
            "from":fromUser,
            "index":userBetIndexKey,
            "txhash":txhash,
        }

        return result;
 
    },

    confirmResult:function(resultInfo){
        if(resultInfo.txhash == undefined || resultInfo.index == undefined){
            throw new Error(CommCode.ParamsError);
        }

        var ts = Blockchain.transaction.timestamp,
        fromUser = Blockchain.transaction.from,
        txhash = Blockchain.transaction.hash;

        var game = this.gameMap.get(resultInfo.txhash);
        var optionNum = game.optionNum;
        if(resultInfo.index > optionNum - 1){
            throw new Error(CommCode.ParamsError);
        }

        var rightOption = game.betOption[resultInfo.index];
        var winner = game.betUserInfo[rightOption];

        var bonus = new BigNumber(0);

        var allI =[];
        var haveI = [];
        var lostOpt = [];
        var lostBetNums = [];
        var gameInfo = "aa";

        for(var i=0;i<optionNum;i++){
            allI.push(i);
            if(i != resultInfo.index){
                var game = this.gameMap.get(resultInfo.txhash)
                gameInfo = game;
                var loseBet = game.betOption[i]
                var loseNum = new BigNumber(game.betAmount[loseBet])

                lostOpt.push(loseBet);
                lostBetNums.push(loseNum);
                haveI.push(i);

                bonus = bonus.plus(loseNum);
            }
        }

        var result={
            "winner":winner,
            "bonus":bonus,
            "allI":allI,
            "haveI":haveI,
            "lostOpt":lostOpt,
            "lostBetNums":lostBetNums,
            "gameInfo":gameInfo
        };

        return result;
        

    },
    
    
    getUserBetList:function(limit,offset){
        if(limit == undefined || offset == undefined){
            throw Error(CommCode.ParamsError);
        }

        var fromUser = Blockchain.transaction.from,
            total = this.userBetNums.get(fromUser),
            result = {
                total: total,
                bets: []
            };

        if (!total) {
            return result;
        }

        if (offset == -1) {
            offset = total;
        }

        for (var i = offset; i > offset - limit; i--) {
            var index = fromUser +"." + i;
            var txhash = this.userBetIndex.get(index);
            var betInfo = this.userBetMap.get(txhash);
            if (betInfo) {
                result.bets.push(betInfo);
            }
        }

        return result;

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