'use strict';

var LOTTERY_STATUS_INIT = 1; // 摇号初始状态
var LOTTERY_STATUS_DOING = 2; // 摇号进行中
var LOTTERY_STATUS_END = 3; // 摇号结束

var LOTTERY_SPECIAL = 1; // 特等奖
var LOTTERY_ONE = 2; // 一等奖
var LOTTERY_TWO = 3; // 二等奖
var LOTTERY_THREE = 4; // 三等奖
var LOTTERY_NORMAL = 5; // 优秀奖
var LOTTERY_NOLEVEL = 10; // 普通摇号，只需要选中

var LOTTERY_TYPE_NORMAL = 1; // 不分等级，只有选中与否
var LOTTERY_TYPE_PROMOTE = 2; // 分一二三等奖

var LOTTERY_TYPE_PROMOTE_SPLIT = "@@@";
var LOTTERY_ADDRESS_SPLIT = "@@@";

// count：奖项的数量设置
// type: 类型
var AwardItem = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.count = o.count;
        this.type = o.type;
        this.done = o.done;
        this.timestamp = o.timestamp;
        this.hash = o.hash;
        this.total = o.total;
    } else {
        this.count = 0;
        this.type = -1;
        this.done = false;
        this.timestamp = '';
        this.hash = '';
        this.total = '';
    }
}
AwardItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var LotteryContent = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.id = o.id;
        this.title = o.title;
        this.adPic = o.adPic; // 广告图片
        this.description = o.description;
        this.publisher = o.publisher;
        this.participator = o.participator; // 参与者的钱包地址 字符串链接
        this.type = o.type;
        this.startTime = o.startTime;
        this.awardList = o.awardList; // 奖项设置
        this.timestamp = o.timestamp;
        this.status = o.status; // 摇号状态   开始/结束
        this.totalParticipatorCount = o.totalParticipatorCount;
    } else {
        this.id = '';
        this.title = '';
        this.adPic = ''; // 广告图片
        this.description = '';
        this.publisher = '';
        this.participator = null; // 参与者的钱包地址 字符串链接
        this.type = '';
        this.startTime = -1;
        this.awardList = null;
        this.timestamp = '';
        this.status = LOTTERY_STATUS_INIT;
        this.totalParticipatorCount = 0;
    }
};
LotteryContent.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var participatorContent = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.id = o.id;
        this.address = o.address;
        this.number = o.number;
        this.type = o.type; // 中奖类型  几等奖
        this.status = o.status;
    } else {
        this.id = '';
        this.address = '';
        this.number = 0;
        this.type = ''; // 中奖类型  几等奖
        this.status = LOTTERY_STATUS_INIT;
    }
}
participatorContent.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

// 通用lists
var Lists = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.list = o.list || [];
    } else {
        this.list = [];
    }
};
Lists.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var LotteryContract = function() {
    LocalContractStorage.defineMapProperties(this, {
        LotteryMap: {
            parse: function(text) {
                return new LotteryContent(text);
            },
            stringify: function(o) {
                return o.toString();
            }
        },
        participatorMap: {
            parse: function(text) {
                return new participatorContent(text);
            },
            stringify: function(o) {
                return o.toString();
            }
        },
        UserPublishedLotteryMap: {
            parse: function(text) {
                return new Lists(text);
            },
            stringify: function(o) {
                return o.toString();
            }
        },
        UserJoinedLotteryMap: {
            parse: function(text) {
                return new Lists(text);
            },
            stringify: function(o) {
                return o.toString();
            }
        },
        AllLotteryMap: {
            parse: function(text) {
                return new Lists(text);
            },
            stringify: function(o) {
                return o.toString();
            }
        },
    });
};

LotteryContract.prototype = {
    init: function() {},
    // 获取最新发布的摇号/摇奖
    getNewPublishLotterys: function(limit, offset) {
        var from = Blockchain.transaction.from;
        var lotterys = this.AllLotteryMap.get('allLottery');

        if (lotterys) {
            limit = parseInt(limit);
            offset = parseInt(offset);
            if (offset > lotterys.list.length) {
                return {
                    total: lotterys.list.length
                };
            }
            var number = offset + limit;
            if (number > lotterys.list.length) {
                number = lotterys.list.length;
            }
            var outArr = [];
            for (var i = offset; i < number; i++) {
                var lottery = this.LotteryMap.get(lotterys.list[i]);
                if (lottery) {
                    outArr.push(lottery);
                }
            }
            return {
                total: lotterys.list.length,
                lotterys: outArr
            };
        } else {
            return null;
        }
    },
    // 发布一个新的摇号/摇奖
    publishLottery: function(title, description, adPic, participator, startTime, type, awards) {
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;

        if (!title) {
            throw new Error('lottery should have title');
        }
        if (!participator) {
            throw new Error('lottery should have participators');
        }
        if (type != LOTTERY_TYPE_NORMAL && type != LOTTERY_TYPE_PROMOTE) {
            throw new Error('lottery type is not ok');
        }
        if (type == LOTTERY_TYPE_PROMOTE && !awards) {
            throw new Error('lottery should have awards');
        }
        if (timestamp > startTime) {
            throw new Error('lottery start time should bigger than now');
        }

        var lottery = new LotteryContent();
        lottery.id = from + '-lottery-' + timestamp;
        lottery.title = title;
        lottery.description = description;
        lottery.adPic = adPic;
        lottery.publisher = from;
        lottery.timestamp = timestamp;
        lottery.status = LOTTERY_STATUS_INIT;
        lottery.type = type;
        lottery.startTime = startTime;

        // 根据类型确定奖项类型
        if (type == LOTTERY_TYPE_PROMOTE) {
            var awardsArr = awards.split(LOTTERY_TYPE_PROMOTE_SPLIT);
            var awardList = [];
            for (var i = 0; i < awardsArr.length; i++) {
                var awradItem = new AwardItem();
                awradItem.count = awardsArr[i];
                awradItem.type = (i + 1);
                awradItem.done = false;
                awardList.push(awradItem);
            }
            lottery.awardList = awardList;
        } else {
            lottery.awardList = [{
                count: awards,
                type: LOTTERY_NOLEVEL,
                done: false
            }];
        }

        // 参加者
        var participatorArr = participator.split(LOTTERY_ADDRESS_SPLIT);
        lottery.participator = [];
        var totalParticipatorCount = 0;
        for (var i = 0; i < participatorArr.length; i++) {
            if (participatorArr[i] && Blockchain.verifyAddress(participatorArr[i])) {
                lottery.participator.push({
                    address: participatorArr[i],
                    number: totalParticipatorCount,
                    type: 0
                });
                var participator = new participatorContent();
                participator.address = participatorArr[i];
                participator.id = lottery.id + '-' + participatorArr[i];
                participator.number = totalParticipatorCount;
                totalParticipatorCount += 1;
                this.participatorMap.set(participator.id, participator);
            }
        }
        lottery.totalParticipatorCount = totalParticipatorCount;
        this.LotteryMap.set(lottery.id, lottery);

        for (var i = 0; i < lottery.participator.length; i++) {
            var myJoin = this.UserJoinedLotteryMap.get(lottery.participator[i].address);
            if (!myJoin) {
                myJoin = new Lists();
            }
            myJoin.list.splice(0, 0, lottery.id);
            this.UserJoinedLotteryMap.set(lottery.participator[i].address, myJoin);
        }

        var myPublish = this.UserPublishedLotteryMap.get(from);
        if (!myPublish) {
            myPublish = new Lists();
        }
        myPublish.list.splice(0, 0, lottery.id);
        this.UserPublishedLotteryMap.set(from, myPublish);

        var allLotterys = this.AllLotteryMap.get('allLottery');
        if (!allLotterys) {
            allLotterys = new Lists();
        }
        allLotterys.list.splice(0, 0, lottery.id);
        this.AllLotteryMap.set('allLottery', allLotterys);
    },
    // 获取摇号/摇奖详情
    getLotteryByID: function(lotteryID) {
        var from = Blockchain.transaction.from;
        var lottery = this.LotteryMap.get(lotteryID);
        if (lottery) {
            lottery.isMyPublish = lottery.publisher == from;
        }
        return lottery;
    },
    // 进行摇号/摇奖
    doLottery(id, level) {
        var lottery = this.LotteryMap.get(id);
        var hash = Blockchain.transaction.hash;
        var timestamp = Blockchain.transaction.timestamp;
        var seed = hash.replace(/[^0-9]/ig, '');
        if (seed.length > 6) {
            seed = seed.slice(-6);
        }
        seed = new BigNumber(seed);

        if (lottery.status == LOTTERY_STATUS_END) {
            throw new Error('lottery has end');
        }
        if (lottery.startTime > timestamp) {
            throw new Error('shold not do lottery before setting time');
        }

        // 直接选出获胜者，没有级别
        if (lottery.type == LOTTERY_TYPE_NORMAL) {
            seed = seed.modulo(lottery.totalParticipatorCount);
            var count = lottery.awardList[0].count;
            var total = lottery.totalParticipatorCount;
            var times = Math.floor(total / count);
            for (var i = 0; i < count; i++) {
                var selected = seed.plus(times * i);
                if (selected >= lottery.totalParticipatorCount) {
                    selected = selected.modulo(lottery.totalParticipatorCount);
                }
                lottery.participator[selected].type = LOTTERY_NOLEVEL;

                var id = lottery.id + '-' + lottery.participator[selected].address;
                var participator = this.participatorMap.get(id);
                participator.type = LOTTERY_NOLEVEL;
                participator.status = LOTTERY_STATUS_END;
                this.participatorMap.set(participator.id, participator);
            }
            lottery.status = LOTTERY_STATUS_END;
            lottery.awardList[0].done = true;
            lottery.awardList[0].timestamp = timestamp;
            lottery.awardList[0].hash = hash;
            lottery.awardList[0].total = total;
            this.LotteryMap.set(lottery.id, lottery);
        } else {
            if (level >= lottery.awardList.length || level < 0) {
                throw new Error('lottery has no this award!');
            }
            if (!lottery.awardList[level] || lottery.awardList[level].count == 0 || lottery.awardList[level].done) {
                throw new Error('lottery this award has got');
            }
            var toChooseParticipatorArr = [];
            for (var i = 0; i < lottery.participator.length; i++) {
                if (!lottery.participator[i].type) {
                    toChooseParticipatorArr.push(lottery.participator[i]);
                }
            }
            seed = seed.modulo(toChooseParticipatorArr.length);
            var count = lottery.awardList[level].count;
            var total = toChooseParticipatorArr.length;
            var times = Math.floor(total / count);
            for (var i = 0; i < count; i++) {
                var selected = seed.plus(times * i);
                if (selected >= total) {
                    selected = selected.modulo(total);
                }
                lottery.participator[toChooseParticipatorArr[selected].number].type = (level * 1 + 1);

                var id = lottery.id + '-' + lottery.participator[toChooseParticipatorArr[selected].number].address;
                var participator = this.participatorMap.get(id);
                participator.type = (level * 1 + 1);
                participator.status = LOTTERY_STATUS_END;
                this.participatorMap.set(id, participator);
            }

            lottery.awardList[level].done = true;
            lottery.awardList[level].timestamp = timestamp;
            lottery.awardList[level].hash = hash;
            lottery.awardList[level].total = total;
            var status = LOTTERY_STATUS_END;
            for (var i = 0; i < LOTTERY_NORMAL; i++) {
                if (!lottery.awardList[i].done && lottery.awardList[i].count) {
                    status = LOTTERY_STATUS_DOING;
                }
            }
            lottery.status = status;
            this.LotteryMap.set(lottery.id, lottery);
        }
    },
    // 获取摇号/摇奖的结果
    getResultByLotteryID: function(lotteryID) {
        var from = Blockchain.transaction.from;
        return this.participatorMap.get(lotteryID + '-' + from);
    },
    // 获取我发布的摇号/摇奖
    getMyPublishLotterys: function(limit, offset) {
        var from = Blockchain.transaction.from;
        var myPublish = this.UserPublishedLotteryMap.get(from);

        if (myPublish) {
            limit = parseInt(limit);
            offset = parseInt(offset);
            if (offset > myPublish.list.length) {
                return {
                    total: myPublish.list.length
                };
            }
            var number = offset + limit;
            if (number > myPublish.list.length) {
                number = myPublish.list.length;
            }
            var outArr = [];
            for (var i = offset; i < number; i++) {
                var lottery = this.LotteryMap.get(myPublish.list[i]);
                outArr.push(lottery);
            }

            return {
                total: myPublish.list.length,
                lotterys: outArr
            };
        } else {
            return null;
        }
    },
    // 获取我参与的摇号/摇奖
    getMyJoinedLotterys: function(limit, offset) {
        var from = Blockchain.transaction.from;
        var myJoin = this.UserJoinedLotteryMap.get(from);

        if (myJoin) {
            limit = parseInt(limit);
            offset = parseInt(offset);
            if (offset > myJoin.list.length) {
                return {
                    total: myJoin.list.length
                };
            }
            var number = offset + limit;
            if (number > myJoin.list.length) {
                number = myJoin.list.length;
            }
            var outArr = [];
            for (var i = offset; i < number; i++) {
                var lottery = this.LotteryMap.get(myJoin.list[i]);
                outArr.push(lottery);
            }

            return {
                total: myJoin.list.length,
                lotterys: outArr
            };
        } else {
            return null;
        }
    },
    // 地址校验，不合格地址不能参与摇号/摇奖
    verifyAddress(addresses) {
        var addressArr = addresses.split(LOTTERY_ADDRESS_SPLIT);
        var count = 0,
            wrong = [];
        for (var i = 0; i < addressArr.length; i++) {
            if (Blockchain.verifyAddress(addressArr[i])) {
                count += 1;
            } else {
                wrong.push(addressArr[i]);
            }
        }

        return {
            count: count,
            wrong: wrong
        }
    }
};
module.exports = LotteryContract;