'use strict';

var SampleContract = function () {
};

SampleContract.prototype = {
    init: function () {
    },
    set: function (name, value) {
        // 存储字符串
        LocalContractStorage.set("name",name);
        // 存储数字
        LocalContractStorage.set("value", value);
        // 存储对象
        LocalContractStorage.set("obj", {name:name,value:value});
    },
    get: function () {
        var name = LocalContractStorage.get("name");
        console.log("name:"+name)
        var value = LocalContractStorage.get("value");
        console.log("value:"+value)
        var obj = LocalContractStorage.get("obj");
        console.log("obj:"+JSON.stringify(obj))
    },
    del: function () {
        var result = LocalContractStorage.del("name");
        console.log("del result:"+result)
    }
};

module.exports = SampleContract;

var SampleContract = function () {
    // SampleContract的`size`属性为存储属性，对`size`的读写会存储到链上，
    // 此处的`descriptor`设置为null，将使用默认的JSON.stringify()和JSON.parse()
    LocalContractStorage.defineMapProperty(this, "size", null);

    // SampleContract的`value`属性为存储属性，对`value`的读写会存储到链上，
    // 此处的`descriptor`自定义实现，存储时直接转为字符串，读取时获得Bignumber对象
    LocalContractStorage.defineMapProperty(this, "value", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });
    // SampleContract的多个属性批量设置为存储属性，对应的descriptor默认使用JSON序列化
    LocalContractStorage.defineProperties(this, {
        name: null,
        count: null
    });
};
module.exports = SampleContract;
//然后，我们可以如下在合约里直接读写这些属性。
SampleContract.prototype = {
    // 合约部署时调用，部署后无法二次调用
    init: function (name, count, size, value) {
        // 在部署合约时将数据存储到链上
        this.name = name;
        this.count = count;
        this.size = size;
        this.value = value;
    },
    testStorage: function (balance) {
        // 使用value时会从存储中读取链上数据，并根据descriptor设置自动转换为Bignumber
        var amount = this.value.plus(new BigNumber(2));
        if (amount.lessThan(new BigNumber(balance))) {
            return 0
        }
    }
};