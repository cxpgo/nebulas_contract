'use strict';

var BBSContract = function() {
    LocalContractStorage.defineMapProperty(this, "category");
    LocalContractStorage.defineProperty(this, "categoryNums");
    LocalContractStorage.defineMapProperty(this, "categoryIndex");

    LocalContractStorage.defineMapProperty(this, "topic");
    LocalContractStorage.defineMapProperty(this, "topicContent");
    LocalContractStorage.defineMapProperty(this, "topicAdditional");
    LocalContractStorage.defineMapProperty(this, "topicAdditionalIndex");

    LocalContractStorage.defineMapProperty(this, "topicFavNums");

    LocalContractStorage.defineProperty(this, "topicNums");
    LocalContractStorage.defineMapProperty(this, "topicIndex");

    // ææèµç
    LocalContractStorage.defineMapProperty(this, "donateInfo");
    LocalContractStorage.defineMapProperty(this, "donateNums");
    LocalContractStorage.defineMapProperty(this, "donateIndex");
    LocalContractStorage.defineMapProperty(this, "donateNas", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new BigNumber(str);
        }
    });

    // ææ¶å°çæèµ
    LocalContractStorage.defineMapProperty(this, "getDonateNums");
    LocalContractStorage.defineMapProperty(this, "getDonateIndex");
    LocalContractStorage.defineMapProperty(this, "getDonateNas", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new BigNumber(str);
        }
    });

    LocalContractStorage.defineMapProperty(this, "donateTopicNums");
    LocalContractStorage.defineMapProperty(this, "donateTopicIndex");
    LocalContractStorage.defineMapProperty(this, "donateTopicNas", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new BigNumber(str);
        }
    });

    LocalContractStorage.defineMapProperty(this, "userBalance", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new BigNumber(str);
        }
    });

    LocalContractStorage.defineMapProperty(this, "categoryTopic");

    LocalContractStorage.defineMapProperty(this, "userTopicNums");
    LocalContractStorage.defineMapProperty(this, "userTopicIndex");

    LocalContractStorage.defineProperty(this, "replyNums");
    LocalContractStorage.defineMapProperty(this, "reply");
    LocalContractStorage.defineMapProperty(this, "topicReplyNums");
    LocalContractStorage.defineMapProperty(this, "replyIndex");

    // ä¿å­ç¨æ·åä¸çè®¨è®ºåè¡¨
    LocalContractStorage.defineMapProperty(this, "userReplyNums");
    LocalContractStorage.defineMapProperty(this, "userReplyIndex");

    LocalContractStorage.defineMapProperty(this, "userInfo");
    LocalContractStorage.defineMapProperty(this, "userAddressIndex");
    LocalContractStorage.defineMapProperty(this, "nickNameIndex");
    LocalContractStorage.defineProperty(this, "userNums");

    LocalContractStorage.defineMapProperty(this, "userFllow");
    LocalContractStorage.defineMapProperty(this, "userFllowNums");

    //æ¶èå¸å­
    LocalContractStorage.defineMapProperty(this, "favTopic"); //å¨æä¸ªIDï¼æ¶èçå¸å­ä¿¡æ¯
    LocalContractStorage.defineMapProperty(this, "favTopicMap"); //æ¯å¦ææ¶èæä¸ªä¸»é¢
    LocalContractStorage.defineMapProperty(this, "favTopicIndex"); //ç±»ä¼¼èªå¢IDçåè½
    LocalContractStorage.defineMapProperty(this, "favTopicNums"); //çå®çæ¶èæ°

    //æ¶èæ ç®
    LocalContractStorage.defineMapProperty(this, "favCategory");
    LocalContractStorage.defineMapProperty(this, "favCategoryMap");
    LocalContractStorage.defineMapProperty(this, "favCategoryIndex");
    LocalContractStorage.defineMapProperty(this, "favCategoryNums");

    //è¢«ç¨æ·å³æ³¨çæ°é
    LocalContractStorage.defineMapProperty(this, "userFansNums");

    LocalContractStorage.defineMapProperty(this, "dailyUser");
    LocalContractStorage.defineMapProperty(this, "dailyTopic");
    LocalContractStorage.defineMapProperty(this, "dailyReply");

    // é»åå
    LocalContractStorage.defineMapProperty(this, "blacklist");

    LocalContractStorage.defineMapProperty(this, "dailyUserNums");
    LocalContractStorage.defineMapProperty(this, "dailyTopicNums");
    LocalContractStorage.defineMapProperty(this, "dailyReplyNums");

    LocalContractStorage.defineProperty(this, "hotTopicCache");
    LocalContractStorage.defineProperty(this, "hotTopic");

    LocalContractStorage.defineProperty(this, "taxNas", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new BigNumber(str);
        }
    });

    LocalContractStorage.defineProperty(this, "config");
    LocalContractStorage.defineProperty(this, "adsList");

    LocalContractStorage.defineProperty(this, "adminAddress");
};

BBSContract.prototype = {
    init: function() {
        var netConfig = {
            mainnet: {
                admin: "n1YRHvX98NQR3fpGrinf2UUy8wZaxaCeXSN"
            },
            testnet: {
                admin: "n1J5YqDGzXbGNUwW9asuh4py2sjHr86XyHr"
            }
        }
        var runEnv = "mainnet"
        var envConfig = netConfig[runEnv]
        this.adminAddress = envConfig.admin
        this.categoryNums = 0
        this.topicNums = 0
        this.replyNums = 0
        this.userNums = 0

        this.config = {
            tax: 0.01, //tax  è´¹ç
            minNasCanPost: 0, //minNasCanPost åå¸å¸å­ç­æä½æ¶ï¼ä½é¢å¤§äºå¤å°NASæè½åå¸
            addUserPayNas: 0, //ç¨æ·æ³¨åæ¶ï¼éè¦ç NAS æ°é
            allowUserField: [
                "avatar", "nickName", "weibo", "twitter", "facebook", "bio", "website", "company", "job"
            ]
        }

        this.adsList = [
            //{"name":"","href":"","img":""}
        ]
        this.taxNas = new BigNumber(0)
    },

    addCategory: function(category) {
        // {"slug":"qa","name":"é®ç­","admin":{},"onlyAdmin":true,homeTop:false}
        var fromUser = Blockchain.transaction.from,
            ts = Blockchain.transaction.timestamp;

        if (fromUser != this.adminAddress) {
            throw new Error("403")
        }

        var slug = category.slug
        var dbCategory = this.category.get(slug)
        if (dbCategory) {
            if (category.override) {
                dbCategory.name = category.name
                dbCategory.admin = category.admin
                dbCategory.onlyAdmin = category.onlyAdmin
                dbCategory.homeTop = category.homeTop
                dbCategory.isNav = category.isNav
                this.category.set(slug, dbCategory)
            } else {
                throw new Error("10010")
            }
            return
        }
        var index = this.categoryNums

        category.topicNums = 0
        category.index = index
        category.created = ts

        this.category.set(slug, category)
        this.categoryIndex.set(index, slug)
        this.categoryNums += 1
        return index
    },
    getCategory: function(slug) {
        var category = this.category.get(slug)
        return category
    },
    addBlackList: function(info) {
        // {"address":"","reason":"æ¶æè¯è®º"}
        var ts = Blockchain.transaction.timestamp
        this.blacklist.set(info.address, {
            created: ts,
            reason: info.reason
        })
    },
    checkBlackList: function(address) {
        return this.blacklist.get(address)
    },
    delBlackList: function(info) {
        this.blacklist.del(info.address)
    },
    _checkOperateNasAvailable: function(address) {
        if (!this.config.minNasCanPost) {
            return true
        }

        var userBalance = this.userBalance.get(address);
        if (!userBalance) {
            userBalance = new BigNumber(0)
        }
        var minNasCanPostValue = this.config.minNasCanPost * 1000000000000000000

        if (userBalance.gte(minNasCanPostValue)) {
            return true
        }

        if (!this.config.minDonateCanPost) {
            return true
        }

        // å¦æç¨æ·ææ¶å°æèµææèµè¿å«äººä¸å®ç NAS ä¹å¯ä»¥ç»§ç»­æä½
        var minDonateCanPostValue = this.config.minDonateCanPost * 1000000000000000000

        var userDonateNas = this.donateNas.get(address)
        if (userDonateNas && userDonateNas.gte(minDonateCanPostValue)) {
            return true
        }

        var userGetDonateNas = this.getDonateNas.get(address)
        if (userGetDonateNas && userGetDonateNas.gte(minDonateCanPostValue)) {
            return true
        }

        throw new Error("10023")
    },
    _checkUserAvailable: function(address) {
        // æ£æ¥ç¨æ·æ¯å¦å¯ä»¥è¿è¡æé¡¹æä½
        this._checkOperateNasAvailable(address)

        if (this.blacklist.get(address)) {
            throw new Error("10022")
        }
        if (!this.userAddressIndex.get(address)) {
            throw new Error("10005")
        }
    },
    addFavCategory: function(slug) {
        var fromUser = Blockchain.transaction.from;
        this._checkUserAvailable(fromUser)

        var k = fromUser + "." + slug,
            favCategoryMap = this.favCategoryMap.get(k);
        if (favCategoryMap != null) {
            throw new Error("10013")
        }
        var favCategoryIndex = this.favCategoryIndex.get(fromUser) * 1,
            favCategoryNums = this.favCategoryNums.get(fromUser) * 1;

        this.favCategoryMap.set(k, favCategoryIndex)

        this.favCategory.set(fromUser + "." + favCategoryIndex, slug)
        this.favCategoryIndex.set(fromUser, favCategoryIndex + 1)
        this.favCategoryNums.set(fromUser, favCategoryNums + 1)
    },
    delFavCategory: function(slug) {
        var fromUser = Blockchain.transaction.from,
            k = fromUser + "." + slug,
            favCategoryMap = this.favCategoryMap.get(k);
        if (favCategoryMap == null) {
            return
        }

        this.favCategoryMap.del(k)
        this.favCategory.del(fromUser + "." + favCategoryMap)

        var favCategoryNums = this.favCategoryNums.get(fromUser) * 1;
        this.favCategoryNums.set(fromUser, favCategoryNums - 1)
    },
    allFavCategory: function() {
        var result = {
                total: 0,
                category: []
            },
            fromUser = Blockchain.transaction.from;

        var favCategoryNums = this.favCategoryNums.get(fromUser) * 1,
            favCategoryIndex = this.favCategoryIndex.get(fromUser) * 1;

        result.total = favCategoryNums

        for (var i = favCategoryIndex - 1; i >= 0; i--) {
            var slug = this.favCategory.get(fromUser + "." + i)
            if (slug) {
                var category = this.category.get(slug)
                result.category.push(category)
            }
        }
        return result
    },
    categoryList: function() {
        var total = this.categoryNums
        var result = {
            total: total,
            category: []
        }
        for (var i = total; i--; i >= 0) {
            var slug = this.categoryIndex.get(i),
                category = this.category.get(slug);
            if (category) {
                result.category.push(category)
            }
        }
        return result
    },
    addTopic: function(topic) {
        var ts = Blockchain.transaction.timestamp,
            fromUser = Blockchain.transaction.from,
            txhash = Blockchain.transaction.hash;
        // æ£æ¥åæ°
        if (topic.title.length < 5) {
            throw new Error("10008")
        }
        if (!topic.category) {
            throw new Error("10009")
        }

        var category = this.category.get(topic.category)
        if (!category) {
            throw new Error("10001")
        }
        // {"slug":"qa","name":"é®ç­","admin":{},"onlyAdmin":true,homeTop:false}
        if (category.onlyAdmin) {
            var categoryAdmin = category.admin || {}
            if (!(fromUser == this.adminAddress || categoryAdmin[fromUser])) {
                throw new Error("10021")
            }
        }

        this._checkUserAvailable(fromUser)

        var detail = {
            hash: txhash,
            title: topic.title,
            created: ts,
            author: fromUser,
            category: topic.category,
            topicIndex: this.topicNums,
            openDonate: topic.openDonate
        }

        this.topic.set(txhash, detail)
        this.topicIndex.set(this.topicNums, txhash)
        this.topicNums += 1

        this.topicContent.set(txhash, topic.content)

        var userTopicNums = this.userTopicNums.get(fromUser) * 1
        this.userTopicNums.set(fromUser, userTopicNums + 1)
        this.userTopicIndex.set(fromUser + "." + userTopicNums, txhash)

        var categorySlug = category.slug
        this.categoryTopic.set(categorySlug + "." + category.topicNums, txhash)

        category.topicNums += 1 //å¢å æ ç®çä¸»é¢æ°
        this.category.set(categorySlug, category)

        var today = this._buildDay()
        var todayNums = this.dailyTopicNums.get(today) * 1
        this.dailyTopicNums.set(today, todayNums + 1)

        var result = {
            hash: txhash
        }
        return result
    },
    //æ·»å å¸å­è¡¥ååå®¹
    addTopicAdditional: function(info) {
        // {"topicHash":"",content:""}
        var ts = Blockchain.transaction.timestamp,
            fromUser = Blockchain.transaction.from,
            txhash = Blockchain.transaction.hash;
        var topicHash = info.topicHash
        if (!topicHash) {
            throw new Error("10015")
        }
        var content = info.content
        if (!content) {
            throw new Error("10016")
        }
        var topic = this.topic.get(info.topicHash);
        if (!topic) {
            throw new Error("10015")
        }
        if (topic.author != fromUser) {
            throw new Error("403")
        }
        if (!topic.additionalNums) {
            topic.additionalNums = 0
        }
        var additionalNums = topic.additionalNums * 1;

        this.topicAdditionalIndex.set(topicHash + "." + additionalNums, txhash)
        this.topicAdditional.set(txhash, {
            content: content,
            created: ts,
            hash: txhash
        })
        topic.additionalNums += 1

        this.topic.set(topicHash, topic)

    },
    addFavTopic: function(topicHash) {
        //æ¶èå¸å­
        var fromUser = Blockchain.transaction.from;
        this._checkUserAvailable(fromUser)
        var k = fromUser + "." + topicHash,
            favTopicMap = this.favTopicMap.get(k);

        if (favTopicMap != null) {
            throw new Error("10014")
        }

        var favTopicIndex = this.favTopicIndex.get(fromUser) * 1,
            favTopicNums = this.favTopicNums.get(fromUser) * 1,
            topicFavNums = this.topicFavNums.get(topicHash) * 1;

        this.favTopic.set(fromUser + "." + favTopicIndex, topicHash)
        this.favTopicMap.set(k, favTopicIndex)
        this.favTopicIndex.set(fromUser, favTopicIndex + 1)
        this.favTopicNums.set(fromUser, favTopicNums + 1)

        this.topicFavNums.set(topicHash, topicFavNums + 1)
        return [favTopicMap, k]
    },
    delFavTopic: function(topicHash) {
        var fromUser = Blockchain.transaction.from,
            k = fromUser + "." + topicHash,
            favTopicMap = this.favTopicMap.get(k);

        if (favTopicMap == null) {
            return
        }

        var favTopicNums = this.favTopicNums.get(fromUser) * 1;

        this.favTopic.del(fromUser + "." + favTopicMap)
        this.favTopicMap.del(k)
        this.favTopicNums.set(fromUser, favTopicNums - 1)
    },
    allFavTopic: function(limit, offset) {
        var fromUser = Blockchain.transaction.from,
            result = {
                total: 0,
                topic: [],
                nextIndex: 0,
            };
        var totalIndex = this.favTopicIndex.get(fromUser) * 1,
            favTopicNums = this.favTopicNums.get(fromUser) * 1;

        result.total = favTopicNums

        if (offset == -1) {
            offset = totalIndex - 1
        }
        var nums = 0,
            authorCache = {},
            categoryCache = {};

        var i

        for (i = offset; nums < limit; i--) {
            if (i < 0) {
                return result
            }
            var hash = this.favTopic.get(fromUser + "." + i)
            if (hash) {
                var topic = this.topic.get(hash)
                this._topicAttaInfo(topic, {
                    getContent: false
                }, authorCache, categoryCache)
                result.topic.push(topic)
                nums += 1
            }
        }
        result.nextIndex = i

        return result
    },
    getTopic: function(hash) {
        var topic = this.topic.get(hash),
            fromUser = Blockchain.transaction.from;
        if (!topic) {
            return
        }
        this._topicAttaInfo(topic, {
            getContent: true
        }, {}, {})

        // è·åå¸å­è¡¥åä¿¡æ¯
        var additionalNums = topic.additionalNums * 1;
        if (additionalNums) {
            topic.additional = []
            for (var i = 0; i < additionalNums; i++) {
                var addHash = this.topicAdditionalIndex.get(hash + "." + i)
                if (addHash) {
                    var addContent = this.topicAdditional.get(addHash)
                    topic.additional.push(addContent)
                }
            }
        }
        // è·åæèµä¿¡æ¯
        if (!topic.openDonate) {
            return topic
        }
        var donateNums = this.donateTopicNums.get(hash)
        topic.donateNums = donateNums

        if (fromUser != topic.author) {
            return topic
        }

        topic.donateNas = this.donateTopicNas.get(hash)
        topic.donateUser = []
        for (var i = donateNums * 1 - 1; i >= 0; i--) {
            var donateHash = this.donateTopicIndex.get(hash + "." + i)
            if (donateHash) {
                var donateDetail = this.donateInfo.get(donateHash)
                if (donateDetail) {
                    var fromAddress = donateDetail.from
                    topic.donateUser.push(donateDetail)
                }
            }
        }

        return topic
    },
    hotTopicList: function(limit, newNums) {
        // ç­é¨ä¸»é¢åè¡¨ï¼é¿åæ°æ®éå¤ªå¤§ï¼åªä»ææ°ç newNums éé¢æ¾
        if (!newNums) {
            newNums = 60
        }
        if (!limit) {
            limit = 6
        }
        var hotTopic = {
                lastUpdate: 0,
                topics: []
            },
            ts = Blockchain.transaction.timestamp;

        var total = this.topicNums,
            end = total - newNums,
            getNums = 0,
            hotHash = [];
        if (end < 0) {
            end = 0
        }
        for (var i = total - 1; i >= end; i--) {
            var topicHash = this.topicIndex.get(i),
                topicReplyNums = this.topicReplyNums.get(topicHash);
            if (!topicHash) {
                continue
            }
            if (!topicReplyNums) {
                topicReplyNums = 0
            }
            hotHash.push({
                hash: topicHash,
                replyNums: topicReplyNums
            })
        }
        var hotHashSorted = hotHash.sort(function(p, n) {
            return n.replyNums > p.replyNums
        }).slice(0, limit)

        for (var i = 0; i < hotHashSorted.length; i++) {
            var item = hotHashSorted[i],
                topic = this.topic.get(item.hash);
            if (!topic) {
                continue
            }
            var author = topic.author;
            topic.user = this.userInfo.get(author)
            topic.replyNums = item.ReplyNums
            hotTopic.topics.push(topic)
        }
        hotTopic.lastUpdate = ts
        return hotTopic
    },
    topicList: function(limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.topicNums) {
            throw new Error("10003");
        }
        if (offset == -1) {
            offset = this.topicNums
        }
        var result = {
            total: this.topicNums,
            topic: []
        }
        var authorCache = {},
            categoryCache = {};

        for (var i = 0; i < limit; i++) {
            var index = offset - i - 1;
            if (index < 0) {
                break
            }
            var hash = this.topicIndex.get(index);
            var topic = this.topic.get(hash);
            if (topic) {
                this._topicAttaInfo(topic, {}, authorCache, categoryCache)
                result.topic.push(topic)
            }
            if (index == 0) {
                break
            }
        }
        return result
    },
    categoryTopicList: function(slug, limit, offset) {
        //  æ ç®çå¸å­åè¡¨
        limit = parseInt(limit);
        offset = parseInt(offset);
        var category = this.category.get(slug)
        if (!category) {
            throw new Error("10001     ");
        }
        var topicNums = category.topicNums
        if (offset > topicNums) {
            throw new Error("10003");
        }
        if (offset == -1) {
            offset = topicNums
        }
        var result = {
            total: topicNums,
            topic: []
        }
        var authorCache = {},
            categoryCache = {
                slug: category
            };

        for (var i = 0; i < limit; i++) {
            var index = offset - i - 1;
            if (index < 0) {
                break
            }
            var hash = this.categoryTopic.get(slug + "." + index);
            var topic = this.topic.get(hash);
            if (topic) {
                this._topicAttaInfo(topic, {}, authorCache, categoryCache)
                result.topic.push(topic)
            }
            if (index == 0) {
                break
            }
        }
        return result
    },
    _topicAttaInfo: function(topic, config, authorCache, categoryCache) {
        // ä½èéè¦è¯»åä½èä¿¡æ¯
        var author = topic.author,
            hash = topic.hash,
            categorySlug = topic.category,
            user = authorCache[author],
            categoryDetail = categoryCache[categorySlug];
        if (!user) {
            user = this.userInfo.get(author)
            user.topicNums = this.userTopicNums.get(author) * 1
            authorCache[author] = user
        }
        // æ ç®éè¦è¯»åæ ç®ä¿¡æ¯
        if (!categoryDetail) {
            categoryDetail = this.category.get(categorySlug)
            categoryCache[categorySlug] = categoryDetail
        }

        // è·åè´´å­çåå¤æ°
        topic.replyNums = this.topicReplyNums.get(hash) * 1

        if (topic.lastUser) {
            var lastUserInfo = authorCache[topic.lastUser]
            if (!lastUserInfo) {
                lastUserInfo = this.userInfo.get(topic.lastUser)
            }
            topic.lastUserInfo = lastUserInfo
        }

        if (config.getContent) {
            topic.content = this.topicContent.get(hash)
        }

        topic.user = user
        topic.categoryDetail = categoryDetail
        topic.favNums = this.topicFavNums.get(hash) * 1;
    },
    userTopicList: function(address, limit, offset) {
        if (!address) {
            address = Blockchain.transaction.from
        }
        var total = this.userTopicNums.get(address) * 1
        var result = {
            total: total,
            topic: []
        }
        if (!total) {
            return result
        }
        if (offset == -1) {
            offset = total - 1
        }
        var authorCache = {},
            categoryCache = {};
        for (var i = 0; i < limit; i++) {
            var index = offset - i;
            if (index < 0) {
                break
            }
            var hash = this.userTopicIndex.get(address + "." + index),
                topic = this.topic.get(hash);
            if (topic) {
                this._topicAttaInfo(topic, {}, authorCache, categoryCache)
                result.topic.push(topic)
            }
        }
        return result
    },
    addReply: function(info) {
        // info:{"topicHash":"","content":""}

        var ts = Blockchain.transaction.timestamp,
            fromUser = Blockchain.transaction.from,
            txhash = Blockchain.transaction.hash,
            topicHash = info.topicHash;

        var topic = this.topic.get(topicHash)

        if (!topic) {
            throw new Error("404")
        }
        if (info.content.length < 5) {
            throw new Error("10011")
        }

        this._checkUserAvailable(fromUser)

        var topicReplyNums = this.topicReplyNums.get(topicHash) * 1

        var reply = {
            topicHash: topicHash,
            content: info.content,
            hash: txhash,
            created: ts,
            author: fromUser,
            replyIndex: topicReplyNums + 1,
        }

        this.reply.set(txhash, reply)

        //æ¯ä¸ªä¸»é¢çåå¤æ°
        var topicReplyNumsKey = topicHash + "." + topicReplyNums
        this.replyIndex.set(topicReplyNumsKey, txhash)

        this.topicReplyNums.set(topicHash, topicReplyNums + 1)

        //è®°å½ç¨æ·çåå¤åè¡¨
        var userReplyNums = this.userReplyNums.get(fromUser) * 1
        var userReplyIndexKey = fromUser + "." + userReplyNums
        this.userReplyIndex.set(userReplyIndexKey, txhash)
        this.userReplyNums.set(fromUser, userReplyNums + 1)

        topic.lastReply = ts
        topic.lastUser = fromUser

        this.topic.set(topicHash, topic)

        this.replyNums += 1

        var today = this._buildDay()
        var todayNums = this.dailyReplyNums.get(today) * 1
        this.dailyReplyNums.set(today, todayNums + 1)

    },
    // ç¨æ·åå¤åè¡¨
    userReplyList: function(limit, offset, userid) {
        if (!userid) {
            userid = Blockchain.transaction.from
        }
        var total = this.userReplyNums.get(userid) * 1,
            result = {
                total: total,
                reply: []
            },
            topicCache = {};
        if (!total) {
            return result
        }
        if (offset == -1) {
            offset = total - 1
        }

        for (var i = offset; i > offset - limit; i--) {
            var replyHashKey = userid + "." + i,
                replyHash = this.userReplyIndex.get(replyHashKey);
            if (!replyHash) {
                continue
            }
            var reply = this.reply.get(replyHash)
            if (!reply) {
                continue
            }
            var topicHash = reply.topicHash,
                topic = topicCache[topicHash];
            if (!topic) {
                topic = this.topic.get(topicHash)
                topicCache[topicHash] = topic
            }
            reply.topic = topic
            result.reply.push(reply)
        }
        return result
    },
    replyList: function(topicHash, limit, offset) {
        //åå¤åè¡¨ï¼ä»æ§å°æ°
        var total = this.topicReplyNums.get(topicHash) * 1,
            result = {
                total: total,
                reply: []
            },
            userCache = {};
        if (!total) {
            return result
        }

        for (var i = offset; i < offset + limit; i++) {
            var topicReplyNumsKey = topicHash + "." + i,
                replyHash = this.replyIndex.get(topicReplyNumsKey);
            this._replyDetail(result, replyHash, userCache)
        }
        return result
    },
    replyListByDesc: function(topicHash, limit, offset) {
        //åå¤åè¡¨ï¼ä»æ°å°æ§
        var total = this.topicReplyNums.get(topicHash) * 1,
            result = {
                total: total,
                reply: []
            },
            userCache = {};
        if (!total) {
            return result
        }

        if (offset == -1) {
            offset = total - 1
        }

        for (var i = offset; i > offset - limit; i--) {
            var topicReplyNumsKey = topicHash + "." + i,
                replyHash = this.replyIndex.get(topicReplyNumsKey);
            this._replyDetail(result, replyHash, userCache)
        }
        return result
    },
    _replyDetail: function(result, replyHash, userCache) {

        if (!replyHash) {
            return
        }
        var reply = this.reply.get(replyHash)
        if (!reply) {
            return
        }
        var author = reply.author,
            user = userCache[author];
        if (!user) {
            user = this.userInfo.get(author)
            userCache[author] = user
        }
        reply.user = user
        result.reply.push(reply)
    },
    setUser: function(userInfo) {
        var fromUser = Blockchain.transaction.from,
            ts = Blockchain.transaction.timestamp;

        userInfo.nickName = userInfo.nickName.trim();

        // æ£æ¥æµç§°æ¯å¦å²çª
        var nickNameAddress = this.nickNameIndex.get(userInfo.nickName)
        if (nickNameAddress && nickNameAddress != fromUser) {
            throw new Error("10019")
        }

        if (userInfo.nickName.length < 3) {
            throw new Error("10020")
        }

        var value = Blockchain.transaction.value
        if (value) {
            this.chargeNas(fromUser)
        }

        var user = this.userInfo.get(fromUser),
            userNotExist = !user;

        // å é¤ä¹åçæµç§°å ç¨
        if (user && user.nickName) {
            this.nickNameIndex.del(user.nickName)
        }
        this.nickNameIndex.set(userInfo.nickName, fromUser)

        if (userNotExist) {
            var addUserPayNas = this.config.addUserPayNas
            var transactionNas = Blockchain.transaction.value / 1000000000000000000
            if (addUserPayNas && transactionNas < addUserPayNas) {
                throw new Error("10006")
            }

            user = {
                address: fromUser,
                lastActive: 0,
                created: ts,
                weibo: "",
                twitter: "",
                id: this.userNums,
                website: "",
                transactionNas: transactionNas,
            }
            this.userNums += 1

            var today = this._buildDay()
            var todayNums = this.dailyUserNums.get(today) * 1
            this.dailyUserNums.set(today, todayNums + 1)
        }

        for (var i = 0; i < this.config.allowUserField.length; i++) {
            var field = this.config.allowUserField[i]
            user[field] = userInfo[field]
        }

        user.lastActive = ts



        this.userInfo.set(fromUser, user)

        if (userNotExist) {
            this.userAddressIndex.set(fromUser, "1")
        }

    },
    getUser: function(userid, less) {
        //è·åç¨æ·ä¿¡æ¯
        var user = this.userInfo.get(userid),
            fromUser = Blockchain.transaction.from;
        if (!user) {
            return null
        }
        user.topicNums = this.userTopicNums.get(userid) * 1
        if (less) {
            return user
        }
        user.fllowNums = this.userFllowNums.get(userid) * 1

        user.replyNums = this.userReplyNums.get(userid) * 1
        user.fllowNums = this.userFllowNums.get(userid) * 1
        user.fansNums = this.userFansNums.get(userid) * 1
        user.favCategoryNums = this.favCategoryNums.get(userid) * 1
        user.favTopicNums = this.favTopicNums.get(userid) * 1


        var isMySelf = fromUser == userid
        if (isMySelf) {
            user.donateNas = this.donateNas.get(fromUser)
            user.getDonateNas = this.getDonateNas.get(fromUser)
        }

        return user
    },
    fllow: function(userid) {
        var fromUser = Blockchain.transaction.from,
            ts = Blockchain.transaction.timestamp,
            userFllowNums = this.userFllowNums.get(fromUser) * 1;

        if (userid == fromUser) {
            throw new Error("10017")
        }

        //åæ£æ¥ç¨æ·æ¯å¦æå³æ³¨
        var userFllow = this.userFllow.get(fromUser)
        if (userFllow && userFllow[userid]) {
            throw new Error("10004")
        }
        if (!userFllow) {
            userFllow = {}
        }

        userFllow[userid] = {
            address: userid,
            created: ts
        }

        this.userFllow.set(fromUser, userFllow)

        var userFansNums = this.userFansNums.get(userid)
        this.userFansNums.set(userid, userFansNums + 1)

        this.userFllowNums.set(fromUser, userFllowNums + 1)
        return true
    },
    fllowList: function(userid) {
        if (!userid) {
            userid = Blockchain.transaction.from
        }
        //å³æ³¨åè¡¨
        var userFllowNums = this.userFllowNums.get(userid);
        var result = {
            total: userFllowNums,
            fllow: {}
        }
        var userFllow = this.userFllow.get(userid)
        for (var address in userFllow) {
            var item = userFllow[address]
            item.user = this.userInfo.get(address)
            if (item.user) {
                item.user.topicNums = this.userTopicNums.get(address)
            }
        }
        result.fllow = userFllow
        return result

    },
    unfllow: function(userid) {
        //åæ¶å³æ³¨
        var fromUser = Blockchain.transaction.from,
            userFllow = this.userFllow.get(fromUser),
            userFllowNums = this.userFllowNums.get(fromUser) * 1;
        if (!userFllow[userid]) {
            throw new Error("10018")
        }
        delete userFllow[userid]

        this.userFllow.set(fromUser, userFllow)
        this.userFllowNums.set(fromUser, userFllowNums - 1)

        var userFansNums = this.userFansNums.get(userid)
        this.userFansNums.set(userid, userFansNums - 1)
    },
    donate: function(info) { //æèµç¨æ·
        // {"address":"", "hash":"","source":"topic","sourceName":"ä¸»é¢",content:"è°¢è°¢åäº«"}
        var fromUser = Blockchain.transaction.from,
            ts = Blockchain.transaction.timestamp,
            txhash = Blockchain.transaction.hash,
            value = Blockchain.transaction.value;

        if (!value) {
            throw new Error("10012")
        }
        var transferValue = value * (1 - this.config.tax),
            toUser = info.address;
        var donateDetail = {
            source: info.source,
            sourceName: info.sourceName,
            from: fromUser,
            oriValue: value,
            transferValue: transferValue,
            to: toUser,
            oriHash: info.hash, //æèµåå®¹çhahsï¼å¦topicæè¯è®ºç
            txhash: txhash,
            content: info.content,
            created: ts,
        }

        this.donateInfo.set(txhash, donateDetail)

        // this.taxNas += value - transferValue
        this.taxNas = this.taxNas.plus(value - transferValue)

        // ææèµç
        var donateNums = this.donateNums.get(fromUser) * 1
        this.donateIndex.set(fromUser + "." + donateNums, txhash)
        this.donateNums.set(fromUser, donateNums + 1)
        var donateNas = this.donateNas.get(fromUser)
        if (!donateNas) {
            donateNas = new BigNumber(0)
        }
        this.donateNas.set(fromUser, donateNas.plus(value))

        // ææ¶å°çæèµ
        var getDonateNums = this.getDonateNums.get(toUser) * 1
        this.getDonateIndex.set(toUser + "." + getDonateNums, txhash)
        this.getDonateNums.set(toUser, getDonateNums + 1)
        var getDonateNas = this.getDonateNas.get(toUser)
        if (!getDonateNas) {
            getDonateNas = new BigNumber(0)
        }
        this.getDonateNas.set(toUser, getDonateNas.plus(transferValue))


        if (info.source == "topic") {
            var donateTopicNums = this.donateTopicNums.get(info.hash) * 1
            this.donateTopicIndex.set(info.hash + "." + donateTopicNums, txhash)
            this.donateTopicNums.set(info.hash, donateTopicNums + 1)
            var donateTopicNas = this.donateTopicNas.get(info.hash)
            if (!donateTopicNas) {
                donateTopicNas = new BigNumber(0)
            }
            this.donateTopicNas.set(info.hash, donateTopicNas.plus(transferValue))
        }
        var result = Blockchain.transfer(info.address, transferValue)
        return result

    },
    // ææèµçåè¡¨
    donateList: function(limit, offset) {
        var fromUser = Blockchain.transaction.from,
            total = this.donateNums.get(fromUser) * 1,
            result = {
                total: total,
                totalNas: 0,
                donate: []
            };
        if (!total) {
            return result
        }

        result.donateNas = this.donateNas.get(fromUser)

        if (offset == -1) {
            offset = total - 1
        }

        for (var i = offset; i > offset - limit; i--) {
            var txhash = this.donateIndex.get(fromUser + "." + i)
            var donateDetail = this.donateInfo.get(txhash)
            if (donateDetail) {
                donateDetail.toUserInfo = this.userInfo.get(donateDetail.to)
                this._donateObjInfo(donateDetail)
                result.donate.push(donateDetail)
            }
        }
        return result
    },
    _donateObjInfo: function(donateDetail) {
        if (donateDetail.source == "topic") {
            donateDetail.topic = this.topic.get(donateDetail.oriHash)
        } else if (donateDetail.source == "reply") {
            donateDetail.reply = this.reply.get(donateDetail.oriHash)
        }
    },
    // ææ¶å°çæèµåè¡¨
    getDonateList: function(limit, offset) {
        var fromUser = Blockchain.transaction.from
        var total = this.getDonateNums.get(fromUser) * 1,
            result = {
                total: total,
                donate: []
            };
        if (!total) {
            return result
        }
        result.getDonateNas = this.getDonateNas.get(fromUser)

        if (offset == -1) {
            offset = total - 1
        }

        for (var i = offset; i > offset - limit; i--) {
            var txhash = this.getDonateIndex.get(fromUser + "." + i)
            var donateDetail = this.donateInfo.get(txhash)
            if (donateDetail) {
                donateDetail.fromUserInfo = this.userInfo.get(donateDetail.from)
                this._donateObjInfo(donateDetail)
                result.donate.push(donateDetail)
            }
        }
        return result
    },
    // ç¨æ·åå¼
    chargeNas: function(fromUser) {
        if (!fromUser) {
            fromUser = Blockchain.transaction.from
        }
        var value = Blockchain.transaction.value;
        if (!value) {
            throw new Error("403")
        }
        var userBalance = this.userBalance.get(fromUser);

        if (!userBalance) {
            userBalance = new BigNumber(0)
        }
        // this.taxNas += value
        this.taxNas = this.taxNas.plus(value)

        this.userBalance.set(fromUser, userBalance.plus(value))
    },
    getUserBalance: function(fromUser) {
        if (!fromUser) {
            fromUser = Blockchain.transaction.from
        }
        var userBalance = this.userBalance.get(fromUser);
        return userBalance
    },
    withdraw: function(address, value) {
        //åé±
        var fromUser = Blockchain.transaction.from
        if (fromUser != this.adminAddress) {
            throw new Error("403")
        }

        var amount = new BigNumber(value * 1000000000000000000)
        var result = Blockchain.transfer(address, amount)
        return result
    },
    setConfig: function(config) {
        var fromUser = Blockchain.transaction.from
        if (fromUser != this.adminAddress) {
            throw new Error("403")
        }
        this.config = config
    },
    getConfig: function() {
        return this.config
    },
    getTaxNas: function() {
        var fromUser = Blockchain.transaction.from
        if (fromUser != this.adminAddress) {
            throw new Error("403")
        }
        return this.taxNas
    },
    setAds: function(ads) {
        var fromUser = Blockchain.transaction.from
        if (fromUser != this.adminAddress) {
            throw new Error("403")
        }
        this.adsList = ads
    },
    getAds: function() {
        return this.adsList
    },
    bbsStatus: function() {
        //è®ºåä¸äºè¿è¡æ°æ®
        var result = {
            userNums: this.userNums,
            topicNums: this.topicNums,
            replyNums: this.replyNums
        }
        return result
    },
    _buildDay: function() {
        var date = new Date();
        var year = date.getFullYear(),
            month = date.getMonth() + 1,
            date = date.getDate();
        return [year, month, date].join("")
    },
    getDailyUserNums: function(dateList) {
        var result = {
            data: []
        }
        for (var i = 0; i < dateList.length; i++) {
            var day = dateList[i],
                dayNums = this.dailyUserNums.get(day);
            result.data.push({
                day: day,
                nums: dayNums
            })
        }
        return result
    },
    getDailyTopicNums: function(dateList) {
        var result = {
            total: 0,
            data: []
        }
        for (var i = 0; i < dateList.length; i++) {
            var day = dateList[i],
                dayNums = this.dailyTopicNums.get(day) * 1;
            result.data.push({
                day: day,
                nums: dayNums
            })
        }
        return result
    },
    getDailyReplyNums: function(dateList) {
        var result = {
            total: 0,
            data: []
        }
        for (var i = 0; i < dateList.length; i++) {
            var day = dateList[i],
                dayNums = this.dailyReplyNums.get(day) * 1;
            result.data.push({
                day: day,
                nums: dayNums
            })
        }
        return result
    },

};

module.exports = BBSContract;