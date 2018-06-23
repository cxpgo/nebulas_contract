上传的记录
var RecordItem = function(text) {
    if (text) {
        var item = JSON.parse(text);

        this.id = item.id; //ID
        this.name = item.name; //名称
        this.city = item.city; //城市
        this.address = item.address; //位置
        this.content = item.content; //内容
        this.author = item.author; //作者
        this.zan = item.zan; //是否被点赞过
        this.timestamp = item.timestamp; //记录的时间
        this.img1 = item.img1; //图片1url
        this.img2 = item.img2; //图片2url
        this.img3 = item.img3; //图片3url
        this.img4 = item.img4; //图片4url
        this.zanNum = item.zanNum; //点赞个数
        this.commentNum = item.commentNum; //评论个数
    } else {

        this.id = ""; //ID
        this.name = ""; //名称
        this.city = ""; //城市
        this.address = ""; //位置
        this.content = ""; //内容
        this.author = ""; //作者
        this.zan = 0; //该作者是否点赞过 0-没有 1-有
        this.timestamp = Date.parse(new Date()); //记录的时间
        this.img1 = ""; //图片1url
        this.img2 = ""; //图片2url
        this.img3 = ""; //图片3url
        this.img4 = ""; //图片4url
        this.zanNum = 0; //点赞个数
        this.commentNum = 0; //评论个数

    }
};

RecordItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//评论的记录
var CommentItem = function(text) {
    if (text) {
        var item = JSON.parse(text);

        this.id = item.id; //ID
        this.foodID = item.foodID; //美食ID
        this.content = item.content; //内容
        this.author = item.author; //作者
        this.timestamp = item.timestamp; //记录的时间
    } else {
        this.id = ""; //ID
        this.foodID = ""; //美食ID
        this.content = ""; //内容
        this.author = ""; //作者
        this.timestamp = Date.parse(new Date()); //记录的时间
    }
};

CommentItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var FOOD = function() {
    LocalContractStorage.defineProperty(this, "size"); //自增ID
    LocalContractStorage.defineProperty(this, "commentSize"); //自增评论ID
    LocalContractStorage.defineProperty(this, "owner"); //创建者账号
    LocalContractStorage.defineProperty(this, "balance"); //合约余额
    LocalContractStorage.defineProperty(this, "rewardMoney"); //单个奖金金额
    LocalContractStorage.defineProperty(this, "pageNum"); //单页数据条数
    LocalContractStorage.defineProperty(this, "rewardAuthor"); //领奖作者数组
    //信息发布记录
    LocalContractStorage.defineMapProperty(this, "RecordRepo", {
        parse: function(text) {
            return new RecordItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "cityRepo"); //单个城市的美食ID
    LocalContractStorage.defineMapProperty(this, "zanAuthorRepo"); //单个美食点赞的钱包地址
    LocalContractStorage.defineMapProperty(this, "authorZanRepo"); //单个作者点赞的美食ID
    //美食评论记录
    LocalContractStorage.defineMapProperty(this, "commentRepo", {
        parse: function(text) {
            return new CommentItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "foodCommentRepo"); //单个美食评论记录
};

FOOD.prototype = {
    init: function() {
        this.size = 0; //记录总条数
        this.commentSize = 0; //评论总条数
        this.pageNum = 20; //每页20条数据
        this.rewardAuthor = []; //领奖作者数组
        this.rewardMoney = new BigNumber(0.01 * 1e18); //单个奖金0.01NAS
        this.owner = Blockchain.transaction.from;; //创建者账号
        this.balance = new BigNumber(Blockchain.transaction.value); //合约余额
    },

    //充值
    pay: function() {

        this._updateBalance("add", Blockchain.transaction.value);
        return Blockchain.transaction.value;
    },

    //提币
    recieve: function(value) {
        var author = Blockchain.transaction.from;
        var money = new BigNumber(value * 1e18);

        //更新钱包
        this._updateBalance("add", Blockchain.transaction.value);

        if (author == this.owner) {
            //查询余额是否充足
            if (this.balance < money) {
                throw new Error("奖池金额仅剩" + this.balance * 1e-18 + "NAS");
            } else {
                //更新钱包
                this._updateBalance("reduce", money);
                Blockchain.transfer(author, money);
                return "成功提取" + money * 1e-18 + "NAS";
            }
        } else {
            throw new Error("您没有权限提币");
        }

        // return ("奖池"+this.balance +"  提现"+money + "  剪去后"+reduce);
    },

    /***********************
       1. 上传记录
    ***********************/
    //新增记录
    save: function(name, city, address, content, img1, img2, img3, img4) {
        name = name.trim();
        if (!name || name === "") {
            throw new Error("请填写美食名字");
        }
        city = city.trim();
        if (!city || city === "") {
            throw new Error("请选择城市");
        }
        address = address.trim();
        if (!address || address === "") {
            throw new Error("请填写详细地址");
        }
        content = content.trim();
        if (!content || content === "") {
            throw new Error("请填写美食简介");
        }
        img1 = img1.trim();
        if (!img1 || img1 === "") {
            throw new Error("请最少上传一张美食图片");
        }
        img2 = (!img2 || img2.trim() == "") ? "" : img2;
        img3 = (!img3 || img3.trim() == "") ? "" : img3;
        img4 = (!img4 || img4.trim() == "") ? "" : img4;

        //更新余额
        this._updateBalance("add", Blockchain.transaction.value);

        var author = Blockchain.transaction.from;

        var id = this.size;
        var recordItem = new RecordItem();
        recordItem.id = id; //id
        recordItem.name = name; //名称
        recordItem.city = city; //城市
        recordItem.address = address; //位置
        recordItem.content = content; //内容
        recordItem.author = author; //作者
        recordItem.img1 = img1; //图片1url
        recordItem.img2 = img2; //图片2url
        recordItem.img3 = img3; //图片3url
        recordItem.img4 = img4; //图片4url

        //将该记录存入RecordRepo表；
        this.RecordRepo.put(id, recordItem);
        this.size++;

        //将该id存入cityRepo表
        var cityIds = this.cityRepo.get(city) || [];
        cityIds.push(id);
        this.cityRepo.set(city, cityIds);

        //查询余额是否充足
        if (this.balance < this.rewardMoney) {
            return "奖池金额不足，感谢您的分享";
        } else {
            //查重用户是否领过奖励
            var authors = this.rewardAuthor || [];
            //存在该ID
            if (authors.indexOf(author) == -1) {
                authors.push(author);
                Blockchain.transfer(author, this.rewardMoney);
                this.rewardAuthor = authors;
                //更新钱包
                this._updateBalance("reduce", this.rewardMoney);
                return "感谢分享，已给您" + author + "钱包地址发送0.01NAS";
            } else {
                return "该钱包地址曾领取过奖励，感谢分享！"
            }
        }
    },
    //更新钱包余额
    _updateBalance: function(name, value) {
        value = new BigNumber(value);
        if (name == "add") {
            this.balance = new BigNumber(this.balance).plus(value);
        } else if (name = "reduce") {
            this.balance = new BigNumber(this.balance).sub(value);
        }
    },

    //获取奖池金额
    getRewardBalance: function() {
        return this.balance;
    },
    //获取领奖人数
    getRewardAuthorNum: function() {
        var authors = this.rewardAuthor || [];
        return authors.length;
    },
    /***********************
       2. 评论和点赞
    ***********************/
    //发表评论
    comment: function(foodID, content) {
        foodID = parseInt(foodID);
        if (foodID < 0 || foodID >= this.size) {
            throw new Error("美食编号错误");
        }

        content = content.trim();
        if (!content || content === "") {
            throw new Error("请填写评论内容");
        }

        //更新余额
        this._updateBalance("add", Blockchain.transaction.value);

        var author = Blockchain.transaction.from;

        var id = this.commentSize;
        var commentItem = new CommentItem();
        commentItem.id = id; //id
        commentItem.foodID = foodID; //美食ID
        commentItem.content = content; //内容
        commentItem.author = author; //作者

        //将该记录存入commentRepo表；
        this.commentRepo.put(id, commentItem);
        this.commentSize++;

        //评论存储到对应美食ID
        var foods = this.foodCommentRepo.get(foodID) || [];
        foods.push(id);
        this.foodCommentRepo.set(foodID, foods);
    },
    //点赞
    zan: function(foodID) {
        foodID = parseInt(foodID);
        if (foodID < 0 || foodID >= this.size) {
            throw new Error("美食编号错误");
        }
        //更新余额
        this._updateBalance("add", Blockchain.transaction.value);
        var author = Blockchain.transaction.from;

        //作者点赞的所有美食ID
        var zans = this.authorZanRepo.get(author) || [];
        //未点赞过
        if (zans.indexOf(foodID) == -1) {
            //该作者添加点赞记录
            zans.push(foodID);
            this.authorZanRepo.set(author, zans);

            //该美食添加赞记录
            var zan2 = this.zanAuthorRepo.get(foodID) || [];
            zan2.push(author);
            this.zanAuthorRepo.set(foodID, zan2);
        }
        //已点赞过
        else {
            throw new Error("您曾经点赞过该美食");
        }
    },
    //获取单个美食评论个数
    getCommentNum: function(foodID) {
        foodID = parseInt(foodID);
        if (foodID < 0 || foodID >= this.size) {
            throw new Error("美食编号错误");
        }
        //更新余额
        this._updateBalance("add", Blockchain.transaction.value);
        var comment = this.foodCommentRepo.get(foodID) || [];
        return comment.length;
    },
    //获取单个美食点赞个数
    getZanNum: function(foodID) {
        foodID = parseInt(foodID);
        if (foodID < 0 || foodID >= this.size) {
            throw new Error("美食编号错误");
        }
        //更新余额
        this._updateBalance("add", Blockchain.transaction.value);
        var zan = this.zanAuthorRepo.get(foodID) || [];
        return zan.length;
    },

    /***********************
      3. 获取美食数据
    ***********************/
    //1.分页获取美食数据
    getRecord: function(author, city, p) {
        //city城市所有数据
        var AllRecords = this._getCityAllRecord(city) || [];
        AllRecords.reverse(); //翻转数组
        //最大页码数
        var maxPage = parseInt(AllRecords.length / this.pageNum);
        maxPage = (AllRecords.length % this.pageNum === 0) ? maxPage : maxPage + 1;

        //钱包地址
        author = author.trim();
        author = (!author || author === "") ? "user" : author;

        //更新余额
        this._updateBalance("add", Blockchain.transaction.value);

        //获取分页数据
        var page = parseInt(p);
        page = (page === 0 || !page) ? 1 : page;

        var result = [];
        if (maxPage === 0 || page > maxPage) {
            return result;
        }

        //返回指定页记录
        var num = AllRecords.length;
        var pageNum = this.pageNum;
        var star = num - pageNum * page;
        star = (star > 0) ? star : 0;
        var end = num - 1 - pageNum * (page - 1);

        var authorZanIDs = this.authorZanRepo.get(author) || []; //作者所有赞过的ID
        var list = [];
        if (star === end) {
            list.push(AllRecords[star]);
        } else {
            list = AllRecords.slice(star, end + 1) || [];
        }

        for (var i = list.length - 1; i >= 0; i--) {
            var record = list[i]; //取编号i的记录
            //存在该ID
            if (authorZanIDs.indexOf(record.id) != -1) {
                record.zan = 1;
            } else {
                record.zan = 0;
            }
            //修改点赞数
            record.zanNum = this.getZanNum(record.id) || 0;

            //修改评论数
            record.commentNum = this.getCommentNum(record.id) || 0;
            result.push(record);
        }
        return result;
    },

    //获取city所有数据
    _getCityAllRecord: function(city) {
        city = (!city || city === "") ? "" : city;
        //没有传入城市ID,返回全部
        if (city === "") {
            var list = [];
            for (var i = this.size - 1; i >= 0; i--) {
                var record = this.RecordRepo.get(i);
                list.push(record);
            }
            return list;

        }
        //返回指定城市数据
        else {
            var recordIds = this.cityRepo.get(city) || [];
            var list = [];
            for (var i = recordIds.length - 1; i >= 0; i--) {
                var record = this.RecordRepo.get(recordIds[i]);
                list.push(record);
            }
            return list;
        }
    },
    //2.获取单条美食基础数据
    getRecordDetail: function(author, foodID) {
        foodID = parseInt(foodID);
        if (foodID < 0 || foodID >= this.size) {
            throw new Error("美食编号错误");
        }
        //钱包地址
        author = author.trim();
        author = (!author || author == "") ? "user" : author;

        //更新余额
        this._updateBalance("add", Blockchain.transaction.value);
        //读取原记录
        var record = this.RecordRepo.get(foodID) || "";
        if (record == "") {
            throw new Error("没有该美食记录");
        }

        //修改是否点赞
        var authors = this.zanAuthorRepo.get(foodID) || [];
        record.zan = (authors.indexOf(author) != -1) ? "1" : "0";

        //修改点赞数
        record.zanNum = this.getZanNum(foodID) || 0;

        //修改评论数
        record.commentNum = this.getCommentNum(foodID) || 0;

        return record;
    },

    //3.分页获取某美食评论详情
    getFoodComment: function(foodID, p) {
        foodID = parseInt(foodID);
        if (foodID < 0 || foodID >= this.size) {
            throw new Error("美食编号错误");
        }
        //该美食所有评论ID
        var commentIds = this.foodCommentRepo.get(foodID) || [];

        //最大页码数
        var maxPage = parseInt(commentIds.length / this.pageNum);
        maxPage = (commentIds.length % this.pageNum === 0) ? maxPage : maxPage + 1;

        //更新余额
        this._updateBalance("add", Blockchain.transaction.value);

        //获取分页数据
        var page = parseInt(p);
        page = (page === 0 || !page) ? 1 : page;

        var result = [];
        if (maxPage === 0 || page > maxPage) {
            1
            return result;
        }
        //返回指定页记录
        var num = commentIds.length;
        var pageNum = this.pageNum;
        var star = num - pageNum * page;
        star = (star > 0) ? star : 0;
        var end = num - 1 - pageNum * (page - 1);

        var list = []; //该页评论的所有评论ID数
        if (star === end) {
            list.push(commentIds[star]);
        } else {
            list = commentIds.slice(star, end + 1) || [];
        }
        for (var i = list.length - 1; i >= 0; i--) {
            var comment = this.commentRepo.get(list[i]); //取编号i的评论记录
            result.push(comment);
        }
        return result;
    },
};
module.exports = FOOD;