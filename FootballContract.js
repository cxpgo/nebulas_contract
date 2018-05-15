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
    this.playerMap = JSON.parse("{}");

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
        if(direction == playerBetInfo.ADirection){
            playerBetInfo.ABet.plus(value);
        }else if(direction == playerBetInfo.BDirection){
            playerBetInfo.BBet.plus(value);
        }

        betGame.playerMap[playerForm] = playerBetInfo;

        //betGame.playerMap = JSON.stringify(playerMap);
        this.gameScheduleMap.set(gameIndex,betGame);

        
        return "playerBet info:" + JSON.stringify(this.gameScheduleMap.get(gameIndex));
        
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
    getScheduleInfo1:function(){
        var len = this.gameScheduleMap.length;
        
        return "ScheduleInfo len : " + len + " content:" + JSON.stringify(this.gameScheduleMap);
    }
}


module.exports = FootballContract;