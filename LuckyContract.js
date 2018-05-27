'use strict';
//{10001:参数错误}

var CommCode = {
    "OK":200,
    "FAIL":400,
    "PermissionError":403,
    "ParamsError":10001,
    "ObjectIsNull":10002,
    "LtMinNas":10003,
    "GameOver":10004
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


    _verifyAddress:function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return result == 0 ? false : true
    },
    //[{"title":"cxp1","betOption":["one","two"],"optionNum":2,"endTime",0}]
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
            finish:0,
            endTime:0,

            title:gameInfo.title,
            betOption:gameInfo.betOption,
            optionNum:parseInt(gameInfo.optionNum),
            betAmount: {},
            betUserInfo:{},
            betUserNums:{}
        }

        if(!!gameInfo.endTime){
            endTime = gameInfo.endTime;
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
        
        var userGameNums = this.userGameNums.get(fromUser) * 1 + 1;
        this.userGameNums.set(fromUser, userGameNums);

        var userGameIndexKey = fromUser + "." + userGameNums;
        this.userGameIndex.set(userGameIndexKey,txhash);

        var result={
            "game":game,
            "gameNums":this.gameNums,
            "userGameNums":userGameNums,
            "userGameIndexKey":userGameIndexKey
        }
               
        return result;
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

        if (limit == -1) {
            limit = total
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

    getCreateGameByUser:function(limit,offset){
        if(limit == undefined || offset == undefined){
            throw Error(CommCode.ParamsError);
        }
        var ts = Blockchain.transaction.timestamp,
        fromUser = Blockchain.transaction.from,
        txhash = Blockchain.transaction.hash;

        var total = this.userGameNums.get(fromUser) * 1;
        var result = {
            total: total,
            games: []
        };

        if(total == 0){
            return result;
        }

        if(limit == -1){
            limit = total;
        }

        if(offset == -1){
            offset = total;
        }

        // result["limit"] = limit;
        // result["offset"] = offset;
        // result["keys"] = [];
        // result["hashs"] = [];

        for (var i = offset; i > offset - limit; i--) {
            var userGameIndexKey = fromUser + "." + i;
            var txhash = this.userGameIndex.get(userGameIndexKey);
            var gameInfo = this.gameMap.get(txhash);
            if (!!gameInfo) {
                result.games.push(gameInfo)
            }

            result["keys"].push(userGameIndexKey);
            result["hashs"].push(txhash);
        }

        return result;

        // var userGameIndexKey = fromUser + "." + userGameNums;
        // this.userGameIndex.set(userGameIndexKey,txhash);

    },

    t_creatGame:function(hash){
        return "game info ="+JSON.stringify(this.gameMap.get(hash));
    },

    //[{"title":"cxp1","betOption":["one","two"],"optionNum":2}]
    //[{"txhash":"eb3c70b40251a7812516f8142f3ed246fc583fa7532d87da6e383fd578a57b42","index":1,"send":0}]
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

        if(game.finish > 0){
            throw new Error(CommCode.GameOver);
        }

        if(game.endTime > 0 && ts >game.endTime){
            game.finish = 1;
            this.gameMap.set(betInfo.txhash,game);
            throw new Error(CommCode.GameOver);
        }

        var curOption = game.betOption[betInfo.index];
        game.betAmount[curOption] = new BigNumber(game.betAmount[curOption]).plus(amount);
       
        var betUser = game.betUserInfo[curOption][fromUser];
        if(!betUser){
            betUser = {
                "from":fromUser,
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
            "from":fromUser,
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
        if(game.finish > 0){
            throw new Error(CommCode.GameOver);
        }

        if(fromUser != game.from){
            throw new Error(CommCode.PermissionError);
        }

        var optionNum = game.optionNum;
        if(resultInfo.index > optionNum - 1){
            throw new Error(CommCode.ParamsError);
        }

        var bonus = new BigNumber(0);
        for(var i=0;i<optionNum;i++){
            if(i != resultInfo.index){
                var loseNum = new BigNumber(game.betAmount[game.betOption[i]])
                bonus = bonus.plus(loseNum);
            }
        }

        var rightOption = game.betOption[resultInfo.index];
        var winnerNum = new BigNumber(game.betAmount[rightOption]);
        var winnerArr = game.betUserInfo[rightOption];

        var winnerResult = [];
        for(var winner in winnerArr){
            var curWinner = winnerArr[winner];
            var ratio = new BigNumber(curWinner.bet).div(winnerNum);
            var winnerInfo={
                "address":curWinner.from,
                "bet":curWinner.bet,
                "ratio":ratio,
                "option":rightOption,
                "reward":bonus.times(ratio).plus(curWinner.bet).toFixed(0)
            }
            winnerResult.push(winnerInfo);
        }

        var sendInfo=[];
        if(resultInfo.send==1){
            for(var i = 0 ;i<winnerResult.length;i++){
                var amount = new BigNumber(winnerResult[i].reward);
                Blockchain.transfer(winnerResult[i].address, amount)//转账到指定地址
                sendInfo.push({"address":winnerResult[i].address,"amount":amount,"sendTime":Blockchain.transaction.timestamp});
            }
            game.finish = 1;
        }

        this.gameMap.set(resultInfo.txhash,game);

        var result={
            "winner":winnerArr,
            "bonus":bonus,
            "winnerResult":winnerResult,
            "sendInfo":sendInfo
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

        if (limit == -1) {
            limit = total;
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

    t_big:function(arg){
        var aa = new BigNumber(444555666.666).toFixed(0);
        var bb = new BigNumber(222333444555.777).decimalPlaces(1);
        var cc = -1;
        if(arg == 1){
            var cc = new BigNumber(222333444555.666).integerValue();
        }

        return {"aa1":aa,"bb":bb,"cc":cc}
        
        
    }

}


module.exports = LuckyContract;