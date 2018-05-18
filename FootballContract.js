'use strict';

var TeamNumber = {1:"英",2:"德",3:"法",4:"荷",5:"西",6:"巴",7:"阿",8:"意",9:"葡",10:"美"};
var GameSchedule = {1:[1,2],2:[3,4],3:[5,6],4:[7,8],5:[9,10]};

var BetContent = function (index) {

    if(!index){
        throw new Error("BetContent no have index!");
    }

    this.index = index;
    this.AName = null;
    this.BName = null;
    this.AScore = 0;
    this.BScore = 0;
    this.ABet = new BigNumber(0);
    this.BBet = new BigNumber(0);
    this.length = 0;
    this.playerMap = {};

    //LocalContractStorage.defineMapProperty(contract, "betPlayerMap");//player bet info by betSessin index
};

var PlayerBetInfo = function () {

    this.from = "";
    this.betContentIndex = 0;//下注编号
    this.ABet = new BigNumber(0);
    this.BBet = new BigNumber(0);
    this.ADirection = 0;
    this.BDirection = 1;

};

var FootballContract = function () {
  LocalContractStorage.defineMapProperty(this, "gameScheduleMap");//all betSession
//   LocalContractStorage.defineMapProperty(this, "gameBetMap");//player bet info by betSessin index
//   LocalContractStorage.defineMapProperty(this, "gameBetMapLen");//player bet info by betSessin index
};

FootballContract.prototype = {
    init: function () {
      //TODO:
      this.adminAddress = "n1HH4bfu2w1ZC22MfSKH7YjNqtyoNHHHrY3";
    },

    addBetSession:function(betIndex){
      var index = parseInt(betIndex);
      var gameSchedule = GameSchedule[index];
      if(!gameSchedule){
        throw new Error("no have No." + betIndex + " by GameSchedule!");
      }

      var betContent = new BetContent(index);
      betContent.AName = TeamNumber[gameSchedule[0]];
      betContent.BName = TeamNumber[gameSchedule[1]];
      //betContent.playerMap = JSON.stringify({});

      this.gameScheduleMap.set(index,betContent);
      
      //LocalContractStorage.defineMapProperty(this, index);
      //betContent.mapName = index;

      return "addBetSession success :" + JSON.stringify(this.gameScheduleMap.get(index));
    },

    playerBet:function(index,direction){
        if(!index || !direction){
            new Error("playerBet args error : ");
        }
        
        var gameIndex = parseInt(index);
        var direction = parseInt(direction);

        var betGame = this.gameScheduleMap.get(gameIndex);
        if(!betGame){
            new Error("no betGame by index : " + gameIndex);
        }

        var playerForm = Blockchain.transaction.from;
        //var playerMap = JSON.parse(betGame.playerMap);

        var playerBetInfo = betGame.playerMap[playerForm];

        if(!playerBetInfo){
            playerBetInfo = new PlayerBetInfo();
            playerBetInfo.from = playerForm;
        }
        
        
        var value = new BigNumber(Blockchain.transaction.value);

        var value1 = value;
        var select = -1;
        if(direction == playerBetInfo.ADirection){
            value.plus(playerBetInfo.ABet);
            playerBetInfo.ABet = value;
            select = 0;
        }else if(direction == playerBetInfo.BDirection){
            value.plus(playerBetInfo.BBet);
            playerBetInfo.BBet = value;
            select = 1;
        }

        betGame.playerMap[playerForm] = playerBetInfo;

        //betGame.playerMap = JSON.stringify(playerMap);
        this.gameScheduleMap.set(gameIndex,betGame);

        
        return "playerBet info:" + JSON.stringify(this.gameScheduleMap.get(gameIndex) +":value="+value1+":select="+select);
        
    },

    getPlayerBetInfo:function(index){
        if(index == undefined ){
            new Error("getPlayerBetInfo args error : " + args);
        }
        var gameIndex = parseInt(index);
        var betGame = this.gameScheduleMap.get(gameIndex);
        if(!betGame){
            new Error("no betGame by index : " + gameIndex);
        }

        var playerForm = Blockchain.transaction.from;
        var playerBetInfo = betGame.playerMap[playerForm];

        return "getPlayerBetInfo info:" + JSON.stringify(playerBetInfo);

    },

    getScheduleInfo:function(index){
        var betGame = this.gameScheduleMap.get(index);
        
        return "ScheduleInfo : " + JSON.stringify(betGame);
    },
    paramTest:function(args){
        var name = args.name;
        var age = args.age;
        var gender = args.gender;
        //传入参数 改为[{"name":"cxp","age":"18","gender":"man"}]
        return "paramTest"+JSON.stringify(args) +":name=" + name+ ":age=" + age +":gender=" + gender;


    }
}


module.exports = FootballContract;