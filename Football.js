'use strict';

var TeamNumber = {1:"英",2:"德",3:"法",4:"荷",5:"西",6:"巴",7:"阿",8:"意",9:"葡",10:"美"};
var GameSchedule = {1:[1,2],2:[3,4],3:[5,6],4:[7,8],5:[9,10]};

var GameContent = function (obj) {
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

var PlayerBetContent = function () {

    this.from = "";
    this.ABet = new BigNumber(0);
    this.BBet = new BigNumber(0);
    this.ADirection = 0;
    this.BDirection = 1;

};


Football.prototype = {
    init: function () {
      //TODO:
    },
}


module.exports = Football;