'use strict';

var TeamNumber = {1:"英",2:"德",3:"法",4:"荷",5:"西",6:"巴",7:"阿",8:"意",9:"葡",10:"美"};
var GameSchedule = {1:[1,2],2:[3,4],3:[5,6],4:[7,8],5:[9,10]};

var BetContent = function (obj) {
    if(!obj){
        throw new Error("GameContent not have init params!");
    }
    var gameInfo = JSON.parse(obj);

    if(!gameInfo.index){
        throw new Error("GameContent no have index!");
    }

    this.index = gameInfo.index;
    this.AName = "";
    this.BName = "";
    this.AScore = 0;
    this.BScore = 0;
    this.ABet = new BigNumber(0);
    this.BBet = new BigNumber(0);
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
  LocalContractStorage.defineMapProperty(this, "gameScheduleMap");
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

      var gameInfo = {"index":index};

      var betContent = new BetContent(gameInfo);
      betContent.AName = TeamNumber[gameSchedule[0]];
      betContent.BName = TeamNumber[gameSchedule[1]];
      this.gameScheduleMap.put(index,betContent);

      return "addBetSession success :" + JSON.stringify(betContent);
    }
}


module.exports = FootballContract;