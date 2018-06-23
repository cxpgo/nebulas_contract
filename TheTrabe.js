var TradeItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.postmark = obj.postmark;
        this.alipay = obj.alipay;
        this.mail = obj.mail;
        this.status = obj.status;
        this.amount = obj.amount;
        this.price = obj.price;
        this.date = obj.date;
        this.author = obj.author;
    }
};

TradeItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var TheTrade = function() {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function(text) {
            return new TradeItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

TheTrade.prototype = {
    init: function() {
        this.size = 0;
    },

    release: function(postmark, alipay, mail, amount, price, date) {
        if (!postmark) {
            return "empty postmark";
        }
        if (!alipay) {
            return "empty alipay";
        }
        if (!mail) {
            return "empty mail";
        }
        if (!amount) {
            return "empty amount";
        }
        if (!price) {
            return "empty price";
        }
        if (!date) {
            return "empty date";
        }

        var from = Blockchain.transaction.from;

        if (this.data.get(postmark)) {
            var tradeItem = this.data.get(postmark);
            if (tradeItem.author != from) {
                return "illegal operation";
            }
            tradeItem.postmark = postmark;
            tradeItem.alipay = alipay;
            tradeItem.mail = mail;
            tradeItem.amount = amount;
            tradeItem.price = price;
            tradeItem.status = 0;
            tradeItem.author = from;
            tradeItem.date = date;
            this.data.put(postmark, tradeItem);
        } else {
            tradeItem = new TradeItem();
            tradeItem.postmark = postmark;
            tradeItem.alipay = alipay;
            tradeItem.mail = mail;
            tradeItem.amount = amount;
            tradeItem.price = price;
            tradeItem.status = 0;
            tradeItem.author = from;
            tradeItem.date = date;

            var index = this.size;
            this.dataMap.set(index, postmark);
            this.data.put(postmark, tradeItem);
            this.size += 1;
        }
        return "success";
    },

    depute: function(postmark) {
        if (!postmark) {
            return "empty postmark";
        }

        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        value = new BigNumber(value);

        tradeItem = this.data.get(postmark);

        if (tradeItem.author != from) {
            return "illegal operation";
        }
        var amount = tradeItem.amount * 1e18;
        if (value != amount) {
            return "no same amount" + value + ":" + amount;
        }

        tradeItem.status = 1;
        this.data.put(postmark, tradeItem);
        return "success";
    },

    takeout: function(value) {
        var from = Blockchain.transaction.from;
        var amount = new BigNumber(value);

        if (from != "n1a7z3ctVm4wTvYuujPwyH2JUQfMJLYLQNi" && from != "n1EcduLZQfwZvHiMQjAqd84w5qJazvXe24V") {
            return "no valid account";
        }

        var result = Blockchain.transfer(from, amount);
        if (!result) {
            return "transfer failed";
        } else {
            return "success";
        }

        Event.Trigger("data", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: amount.toString()
            }
        });
    },

    revoke: function(postmark) {
        if (!postmark) {
            return "empty postmark";
        }

        var from = Blockchain.transaction.from;

        tradeItem = this.data.get(postmark);
        if (tradeItem.author != from) {
            throw new Error("illegal operation");
        }
        tradeItem.status = -1;
        this.data.put(postmark, tradeItem);
        return "success";
    },

    update: function(postmark, status) {
        if (!postmark) {
            return "empty postmark";
        }

        if (!status) {
            return "empty status";
        }

        var from = Blockchain.transaction.from;

        if (from == "n1a7z3ctVm4wTvYuujPwyH2JUQfMJLYLQNi" || from == "n1EcduLZQfwZvHiMQjAqd84w5qJazvXe24V") {

            tradeItem = this.data.get(postmark);
            tradeItem.status = status;
            this.data.put(postmark, tradeItem);
            return "success";
        } else {
            return "no valid account";
        }
    },

    verifyAddress: function(address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    },

    get: function(postmark) {
        if (!postmark) {
            return "empty postmark";
        }
        return this.data.get(postmark);
    },

    sizeLength: function() {
        return this.size;
    },

    GetAll: function() {
        var result = '[';
        for (var i = 0; i < this.size; i++) {
            var key = this.dataMap.get(i);
            var object = this.data.get(key);
            if (i == this.size - 1)
                result += object + "";
            else
                result += object + ",";
        }
        return result + "]";
    },

    forEach: function(limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            return "offset is not valid";
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = "";
        for (var i = offset; i < number; i++) {
            var key = this.dataMap.get(i);
            var object = this.data.get(key);
            result += object + "_";
        }
        return result;
    }
}

module.exports = TheTrade;