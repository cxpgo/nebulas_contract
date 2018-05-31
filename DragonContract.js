"use strict";
var DragonContract = function() {
    LocalContractStorage.defineMapProperty(this, "cd_map");
    LocalContractStorage.defineProperty(this, "cd_map_cnt");
    LocalContractStorage.defineProperty(this, "defence_cd", null);
    LocalContractStorage.defineProperty(this, "defence_cd_time", null);

    LocalContractStorage.defineMapProperty(this, "dragon_egg");
    LocalContractStorage.defineProperty(this, "dragon_egg_cnt", null);

    LocalContractStorage.defineMapProperty(this, "dragon_egg_free");
    LocalContractStorage.defineProperty(this, "dragon_egg_free_cnt", null);

    LocalContractStorage.defineMapProperty(this, "dragon");
    LocalContractStorage.defineProperty(this, "dragon_cnt", null);
    LocalContractStorage.defineProperty(this, "dragon_pay_cnt", null)

    LocalContractStorage.defineMapProperty(this, "dragon_log");

    LocalContractStorage.defineMapProperty(this, "user_dragon");
    LocalContractStorage.defineProperty(this, "user_cnt", null);

    LocalContractStorage.defineProperty(this, "egg_price", null);

    LocalContractStorage.defineProperty(this, "admin", null);
    LocalContractStorage.defineProperty(this, "co", null);
    LocalContractStorage.defineProperty(this, "rate", null);

    LocalContractStorage.defineMapProperty(this, "LOG");
    LocalContractStorage.defineProperty(this, "LOG_CNT", null);
    LocalContractStorage.defineProperty(this, "LOG_SWITCH", null);

    LocalContractStorage.defineProperty(this, "free_dragon_per_address", null);
    LocalContractStorage.defineProperty(this, "max_dragon", null);
    LocalContractStorage.defineProperty(this, "max_pay_dragon", null);
}

DragonContract.prototype = {
    init: function() {
        this.admin = Blockchain.transaction.from;

        this.dragon_egg_cnt = 0;
        this.dragon_egg_free_cnt = 0;

        this.dragon_cnt = 0;
        this.dragon_pay_cnt = 0;

        this.user_cnt = 0;

        this.egg_price = 0.01 * this._nasToWei();

        this.rate = 0.9;

        this.defence_cd = 60 * 4;
        this.defence_cd_time = 3600;

        this.LOG_CNT = 0;
        this.LOG_SWITCH = 1;

        this.free_dragon_per_address = 5;

        this.co = "xxx";

        this.max_dragon = 10000000;
        this.max_pay_dragon = 1000000;
        this._set_init();
    },


    a: function() {
        return {
            "cd_map_cnt": this.cd_map_cnt,
            "defence_cd": this.defence_cd,
            "defence_cd_time": this.defence_cd_time,
            "dragon_egg_cnt": this.dragon_egg_cnt,
            "dragon_egg_free_cnt": this.dragon_egg_free_cnt,
            "dragon_cnt": this.dragon_cnt,
            "dragon_pay_cnt": this.dragon_pay_cnt,
            "user_cnt": this.user_cnt,
            "egg_price": this.egg_price / this._nasToWei(),
            "admin": this.admin,
            "rate": this.rate,
            "LOG_CNT": this.LOG_CNT,
            "LOG_SWITCH": this.LOG_SWITCH,
            "free_dragon_per_address": this.free_dragon_per_address,
            "max_dragon": this.max_dragon,
            "max_pay_dragon": this.max_pay_dragon,
        };
    },

    _nasToWei: function() {
        return 1000000000000000000;
    },

    setMaxDragon: function(max_dragon, max_pay_dragon) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            this.max_dragon = max_dragon;
            this.max_pay_dragon = max_pay_dragon;
        }
        return true;
    },

    setDefenceCDTime: function(CD) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            this.defence_cd_time = parseInt(CD);
        }
        return true;
    },

    setCDMap: function(id, value, cnt) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            this.cd_map.set(id, parseInt(value));
            this.cd_map_cnt = parseInt(cnt);
        }
        return true;
    },

    getCDMap: function(id) {
        return this.cd_map.get(id);
    },

    _set_init() {
        this.cd_map.set(0, 12 * 3600);
        this.cd_map.set(1, 11 * 3600);
        this.cd_map.set(2, 10 * 3600);
        this.cd_map.set(3, 9 * 3600);
        this.cd_map.set(4, 8 * 3600);
        this.cd_map.set(5, 7 * 3600);
        this.cd_map.set(6, 6 * 3600);
        this.cd_map.set(7, 5 * 3600);
        this.cd_map.set(8, 4 * 3600);
        this.cd_map.set(9, 3 * 3600);
        this.cd_map.set(10, 120 * 60);
        this.cd_map.set(11, 90 * 60);
        this.cd_map.set(12, 75 * 60);
        this.cd_map.set(13, 60 * 60);
        this.cd_map.set(14, 50 * 60);
        this.cd_map.set(15, 40 * 60);
        this.cd_map.set(16, 30 * 60);
        this.cd_map.set(17, 20 * 60);
        this.cd_map.set(18, 10 * 60);
        this.cd_map.set(19, 5 * 60);
        this.cd_map_cnt = 20;
        this._initFreeDragon();
        this._initPayDragon();
    },

    _initFreeDragon: function() {
        this._addDragonEgg({
            "speed": 1,
            "power": 1,
            "flex": 0,
            "weight": 5,
            "max": 18,
            "min": 3,
            "name": "Saurolophus"
        }, "free");
        this._addDragonEgg({
            "speed": 1,
            "power": 0,
            "flex": 2,
            "weight": 5,
            "max": 17,
            "min": 2,
            "name": "Parasaurolophus"
        }, "free");
        this._addDragonEgg({
            "speed": 1,
            "power": 1,
            "flex": 1,
            "weight": 5,
            "max": 17,
            "min": 2,
            "name": "Lambeosaurus"
        }, "free");
        this._addDragonEgg({
            "speed": 1,
            "power": 4,
            "flex": 0,
            "weight": 5,
            "max": 45,
            "min": 16,
            "name": "Apatosaurus"
        }, "free");
        this._addDragonEgg({
            "speed": 2,
            "power": 3,
            "flex": 1,
            "weight": 5,
            "max": 44,
            "min": 15,
            "name": "Brachiosaurus"
        }, "free");

        this._addDragonEgg({
            "speed": 4,
            "power": 6,
            "flex": 4,
            "weight": 5,
            "max": 71,
            "min": 37,
            "name": "Styracosaurus"
        }, "free");

        this._addDragonEgg({
            "speed": 1,
            "power": 1,
            "flex": 0,
            "weight": 5,
            "max": 18,
            "min": 3,
            "name": "Saurolophus"
        }, "free");
        this._addDragonEgg({
            "speed": 1,
            "power": 0,
            "flex": 2,
            "weight": 5,
            "max": 17,
            "min": 2,
            "name": "Parasaurolophus"
        }, "free");
        this._addDragonEgg({
            "speed": 1,
            "power": 1,
            "flex": 1,
            "weight": 5,
            "max": 17,
            "min": 2,
            "name": "Lambeosaurus"
        }, "free");
        this._addDragonEgg({
            "speed": 1,
            "power": 4,
            "flex": 0,
            "weight": 5,
            "max": 45,
            "min": 16,
            "name": "Apatosaurus"
        }, "free");
        this._addDragonEgg({
            "speed": 2,
            "power": 3,
            "flex": 1,
            "weight": 5,
            "max": 44,
            "min": 15,
            "name": "Brachiosaurus"
        }, "free");

        this._addDragonEgg({
            "speed": 1,
            "power": 1,
            "flex": 0,
            "weight": 5,
            "max": 18,
            "min": 3,
            "name": "Saurolophus"
        }, "free");
        this._addDragonEgg({
            "speed": 1,
            "power": 0,
            "flex": 2,
            "weight": 5,
            "max": 17,
            "min": 2,
            "name": "Parasaurolophus"
        }, "free");
        this._addDragonEgg({
            "speed": 1,
            "power": 1,
            "flex": 1,
            "weight": 5,
            "max": 17,
            "min": 2,
            "name": "Lambeosaurus"
        }, "free");
        this._addDragonEgg({
            "speed": 1,
            "power": 4,
            "flex": 0,
            "weight": 5,
            "max": 45,
            "min": 16,
            "name": "Apatosaurus"
        }, "free");
        this._addDragonEgg({
            "speed": 2,
            "power": 3,
            "flex": 1,
            "weight": 5,
            "max": 44,
            "min": 15,
            "name": "Brachiosaurus"
        }, "free");

        this._addDragonEgg({
            "speed": 1,
            "power": 1,
            "flex": 0,
            "weight": 5,
            "max": 18,
            "min": 3,
            "name": "Saurolophus"
        }, "free");
        this._addDragonEgg({
            "speed": 1,
            "power": 0,
            "flex": 2,
            "weight": 5,
            "max": 17,
            "min": 2,
            "name": "Parasaurolophus"
        }, "free");
        this._addDragonEgg({
            "speed": 1,
            "power": 1,
            "flex": 1,
            "weight": 5,
            "max": 17,
            "min": 2,
            "name": "Lambeosaurus"
        }, "free");
        this._addDragonEgg({
            "speed": 1,
            "power": 4,
            "flex": 0,
            "weight": 5,
            "max": 45,
            "min": 16,
            "name": "Apatosaurus"
        }, "free");
        this._addDragonEgg({
            "speed": 2,
            "power": 3,
            "flex": 1,
            "weight": 5,
            "max": 44,
            "min": 15,
            "name": "Brachiosaurus"
        }, "free");
    },

    _initPayDragon: function() {

        this._addDragonEgg({
            "speed": 1,
            "power": 1,
            "flex": 1,
            "weight": 5,
            "max": 17,
            "min": 2,
            "name": "Lambeosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 1,
            "power": 1,
            "flex": 1,
            "weight": 5,
            "max": 17,
            "min": 2,
            "name": "Lambeosaurus"
        }, "pay");



        this._addDragonEgg({
            "speed": 2,
            "power": 3,
            "flex": 1,
            "weight": 5,
            "max": 44,
            "min": 15,
            "name": "Brachiosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 3,
            "power": 2,
            "flex": 3,
            "weight": 5,
            "max": 42,
            "min": 13,
            "name": "plesiosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 3,
            "power": 2,
            "flex": 2,
            "weight": 5,
            "max": 43,
            "min": 14,
            "name": "Triceratops"
        }, "pay");
        this._addDragonEgg({
            "speed": 3,
            "power": 3,
            "flex": 1,
            "weight": 5,
            "max": 43,
            "min": 14,
            "name": "Euoplocephalus"
        }, "pay");
        this._addDragonEgg({
            "speed": 2,
            "power": 3,
            "flex": 1,
            "weight": 5,
            "max": 44,
            "min": 15,
            "name": "Brachiosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 3,
            "power": 2,
            "flex": 3,
            "weight": 5,
            "max": 42,
            "min": 13,
            "name": "plesiosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 3,
            "power": 2,
            "flex": 2,
            "weight": 5,
            "max": 43,
            "min": 14,
            "name": "Triceratops"
        }, "pay");
        this._addDragonEgg({
            "speed": 3,
            "power": 3,
            "flex": 1,
            "weight": 5,
            "max": 43,
            "min": 14,
            "name": "Euoplocephalus"
        }, "pay");
        this._addDragonEgg({
            "speed": 2,
            "power": 3,
            "flex": 1,
            "weight": 5,
            "max": 44,
            "min": 15,
            "name": "Brachiosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 3,
            "power": 2,
            "flex": 3,
            "weight": 5,
            "max": 42,
            "min": 13,
            "name": "plesiosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 3,
            "power": 2,
            "flex": 2,
            "weight": 5,
            "max": 43,
            "min": 14,
            "name": "Triceratops"
        }, "pay");
        this._addDragonEgg({
            "speed": 3,
            "power": 3,
            "flex": 1,
            "weight": 5,
            "max": 43,
            "min": 14,
            "name": "Euoplocephalus"
        }, "pay");


        this._addDragonEgg({
            "speed": 4,
            "power": 6,
            "flex": 4,
            "weight": 5,
            "max": 71,
            "min": 37,
            "name": "Styracosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 5,
            "power": 6,
            "flex": 3,
            "weight": 5,
            "max": 71,
            "min": 37,
            "name": "Stegosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 6,
            "power": 5,
            "flex": 5,
            "weight": 5,
            "max": 69,
            "min": 35,
            "name": "Ouranosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 4,
            "power": 6,
            "flex": 7,
            "weight": 5,
            "max": 68,
            "min": 34,
            "name": "Gigantspinosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 6,
            "power": 5,
            "flex": 7,
            "weight": 5,
            "max": 67,
            "min": 33,
            "name": "Corythosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 5,
            "power": 7,
            "flex": 4,
            "weight": 5,
            "max": 69,
            "min": 35,
            "name": "monolophosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 8,
            "power": 5,
            "flex": 7,
            "weight": 5,
            "max": 65,
            "min": 31,
            "name": "Suchomimus"
        }, "pay");
        this._addDragonEgg({
            "speed": 4,
            "power": 6,
            "flex": 4,
            "weight": 5,
            "max": 71,
            "min": 37,
            "name": "Styracosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 5,
            "power": 6,
            "flex": 3,
            "weight": 5,
            "max": 71,
            "min": 37,
            "name": "Stegosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 6,
            "power": 5,
            "flex": 5,
            "weight": 5,
            "max": 69,
            "min": 35,
            "name": "Ouranosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 4,
            "power": 6,
            "flex": 7,
            "weight": 5,
            "max": 68,
            "min": 34,
            "name": "Gigantspinosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 6,
            "power": 5,
            "flex": 7,
            "weight": 5,
            "max": 67,
            "min": 33,
            "name": "Corythosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 5,
            "power": 7,
            "flex": 4,
            "weight": 5,
            "max": 69,
            "min": 35,
            "name": "monolophosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 8,
            "power": 5,
            "flex": 7,
            "weight": 5,
            "max": 65,
            "min": 31,
            "name": "Suchomimus"
        }, "pay");
        this._addDragonEgg({
            "speed": 4,
            "power": 6,
            "flex": 4,
            "weight": 5,
            "max": 71,
            "min": 37,
            "name": "Styracosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 5,
            "power": 6,
            "flex": 3,
            "weight": 5,
            "max": 71,
            "min": 37,
            "name": "Stegosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 6,
            "power": 5,
            "flex": 5,
            "weight": 5,
            "max": 69,
            "min": 35,
            "name": "Ouranosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 4,
            "power": 6,
            "flex": 7,
            "weight": 5,
            "max": 68,
            "min": 34,
            "name": "Gigantspinosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 6,
            "power": 5,
            "flex": 7,
            "weight": 5,
            "max": 67,
            "min": 33,
            "name": "Corythosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 5,
            "power": 7,
            "flex": 4,
            "weight": 5,
            "max": 69,
            "min": 35,
            "name": "monolophosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 8,
            "power": 5,
            "flex": 7,
            "weight": 5,
            "max": 65,
            "min": 31,
            "name": "Suchomimus"
        }, "pay");



        this._addDragonEgg({
            "speed": 11,
            "power": 16,
            "flex": 11,
            "weight": 5,
            "max": 77,
            "min": 48,
            "name": "Allosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 10,
            "power": 15,
            "flex": 14,
            "weight": 5,
            "max": 76,
            "min": 47,
            "name": "Dilophosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 9,
            "power": 13,
            "flex": 14,
            "weight": 5,
            "max": 79,
            "min": 50,
            "name": "Compsognathus"
        }, "pay");
        this._addDragonEgg({
            "speed": 11,
            "power": 16,
            "flex": 11,
            "weight": 5,
            "max": 77,
            "min": 48,
            "name": "Allosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 10,
            "power": 15,
            "flex": 14,
            "weight": 5,
            "max": 76,
            "min": 47,
            "name": "Dilophosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 9,
            "power": 13,
            "flex": 14,
            "weight": 5,
            "max": 79,
            "min": 50,
            "name": "Compsognathus"
        }, "pay");
        this._addDragonEgg({
            "speed": 11,
            "power": 16,
            "flex": 11,
            "weight": 5,
            "max": 77,
            "min": 48,
            "name": "Allosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 10,
            "power": 15,
            "flex": 14,
            "weight": 5,
            "max": 76,
            "min": 47,
            "name": "Dilophosaurus"
        }, "pay");
        this._addDragonEgg({
            "speed": 9,
            "power": 13,
            "flex": 14,
            "weight": 5,
            "max": 79,
            "min": 50,
            "name": "Compsognathus"
        }, "pay");






        this._addDragonEgg({
            "speed": 14,
            "power": 20,
            "flex": 28,
            "weight": 5,
            "max": 88,
            "min": 54,
            "name": "Velociraptor"
        }, "pay");
        this._addDragonEgg({
            "speed": 12,
            "power": 35,
            "flex": 10,
            "weight": 5,
            "max": 93,
            "min": 59,
            "name": "Tyrannosaurus Rex"
        }, "pay");


    },


    out: function(value) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var result = Blockchain.transfer(this.admin, value * this._nasToWei());
            return result;
        }
        return true;
    },

    toUser: function(address, value) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var result = Blockchain.transfer(address, value * this._nasToWei());
            return result;
        }
        return true;
    },

    setEggPrice: function(value) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            this.egg_price = parseInt(value) * this._nasToWei();
        }
        return true;
    },

    getEggPrice: function() {
        return this.egg_price / this._nasToWei();
    },

    setFreeDragonPerAddress: function(limit) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            this.free_dragon_per_address = parseInt(limit);
        }
        return true;
    },

    SETLOGSWITCH: function(value) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            this.LOG_SWITCH = parseInt(value);
        }
        return true;
    },

    _ADDLOG: function(msg) {
        if (this.LOG_SWITCH) {
            this.LOG.set(this.LOG_CNT, msg);
            this.LOG_CNT += 1;
        }
        return true;
    },

    GETLOG: function(id) {
        return this.LOG.get(id);
    },

    GETLOGCNT: function() {
        return this.LOG_CNT;
    },

    _randomFeature: function(min, max) {
        var min_max = Math.random() * (max - min) + min;
        var v1 = Math.random();
        var v2 = Math.random();
        var v3 = Math.random();
        var total = v1 + v2 + v3;
        v1 = min_max * v1 / total;
        v2 = min_max * v2 / total;
        v3 = min_max * v3 / total;
        return [v1, v2, v3];
    },

    _addDragonEgg: function(egg_info, pay) {
        if (pay === "pay") {
            this.dragon_egg.set(this.dragon_egg_cnt, egg_info);
            this.dragon_egg_cnt += 1;
        } else {
            this.dragon_egg_free.set(this.dragon_egg_free_cnt, egg_info);
            this.dragon_egg_free_cnt += 1;
        }
        return true;
    },

    _setDragonEgg: function(id, egg_info, pay) {
        if (pay === "pay") {
            if (id < this.dragon_egg_cnt) {
                this.dragon_egg.set(id, egg_info);
            }
        } else {
            if (id < this.dragon_egg_free_cnt) {
                this.dragon_egg_free.set(id, egg_info);
            }
        }
        return true;
    },

    setDragonEgg: function(id, egg, pay) {
        var from = Blockchain.transaction.from;
        if (from !== this.admin) {
            return false;
        }
        var egg_info = JSON.parse(egg);
        this._setDragonEgg(id, egg_info, pay);
        return true;
    },

    addDragonEgg: function(eggs, pay) {
        var from = Blockchain.transaction.from;
        if (from !== this.admin) {
            return false;
        }
        var eggs_info = JSON.parse(eggs);
        for (var one in eggs_info) {
            this._addDragonEgg(eggs_info[one], pay);
        }
        return true;
    },

    _getRandom: function() {
        var random = Math.random();
        var value = random.toString();
        var arr = value.split(".");
        var decimal = arr[1];
        return parseInt(decimal, 10);
    },

    _hatchDragon: function(dragon) {
        var arr = this._randomFeature(dragon["min"], dragon["max"]);
        dragon["power"] = dragon["power"] + arr[0];
        dragon["flex"] = dragon["flex"] + arr[1];
        dragon["speed"] = parseInt(dragon["speed"] + arr[2]);
        return true;
    },

    _bornDragon: function(pay) {
        var rand = this._getRandom();
        var aim = 0;
        var dragon = {};
        if (pay === "pay") {
            aim = rand % this.dragon_egg_cnt;
            dragon = this.dragon_egg.get(aim);
            dragon = dragon;
            dragon["t"] = "pay";
        } else {
            aim = rand % this.dragon_egg_free_cnt;
            dragon = this.dragon_egg_free.get(aim);
            dragon["t"] = "free";
        }
        this._hatchDragon(dragon);
        return dragon;
    },

    _getTimeBySec: function() {
        var time = new Date();
        return time.getTime() / 1000;
    },

    _initBornDragon(dragon) {
        dragon["owner"] = Blockchain.transaction.from;
        dragon["sale"] = 0;
        dragon["fight"] = 1;
        dragon["born_height"] = Blockchain.block.height;
        var time = this._getTimeBySec();
        dragon["born_time"] = time;
        dragon["attack_time"] = 1;
        dragon["defence_time"] = 1;
        return dragon;
    },

    getEgg: function(name) {
        return this._buyEgg(name, "pay");
    },

    giveEgg: function(name) {
        return this._buyEgg(name, "free");
    },


    _buyEgg: function(name, pay) {
        if (pay === "free") {
            if (this.max_dragon < this.dragon_cnt) {
                return {
                    "mas": "max_dragon," + this.max_dragon + "," + this.dragon_cnt
                };
            }
        } else {
            if (this.max_pay_dragon < this.dragon_pay_cnt) {
                return {
                    "mas": "max pay dragon," + this.max_pay_dragon + "," + this.dragon_pay_cnt
                };
            }
        }
        var value = new BigNumber(Blockchain.transaction.value);

        if (value.lt(this.egg_price) && "pay" === pay) {
            return {
                "msg": "not enough pay!"
            };
        }

        var user_add = Blockchain.transaction.from;
        var dragon_id = this.dragon_cnt;

        var new_user_flag = 0;
        var user_info = this.user_dragon.get(user_add);
        if (!user_info) {
            user_info = {
                "user_free": 0
            };
            new_user_flag = 1;
        }

        if (pay === "free") {
            if (this.free_dragon_per_address < user_info["user_free"]) {
                return {
                    "msg": "max free !" + user_info["user_free"]
                };
            }
        }

        var intime = this._getTimeBySec();
        user_info[dragon_id] = {
            "name": name,
            "intime": intime
        };

        var dragon = this._bornDragon(pay);

        this._initBornDragon(dragon);

        this.dragon_cnt += 1;
        if (dragon["t"] === "pay") {
            this.dragon_pay_cnt += 1;
        } else {
            user_info["user_free"] += 1;
        }
        this.dragon.set(dragon_id, dragon);
        this.user_dragon.set(user_add, user_info);
        if (new_user_flag) {
            this.user_cnt += 1;
        }
        return true;
    },

    _trans: function(to, value) {
        var result = Blockchain.transfer(to, value);
        return result;
    },

    _transDragon: function(id, owner, new_owner) {
        var user_old = this.user_dragon.get(owner);
        delete user_old[id];
        this.user_dragon.set(owner, user_old);

        var new_user_flag = 0;
        var user_new = this.user_dragon.get(new_owner);
        if (!user_new) {
            user_new = {
                "user_free": 0
            };
            new_user_flag = 1;
        }

        var intime = new Date();
        intime = intime.getTime() / 1000;
        user_new[id] = {
            "name": "no name",
            "intime": intime
        };
        this.user_dragon.set(new_owner, user_new);
        if (new_user_flag) {
            this.user_cnt += 1;
        }
        return true;
    },

    tradeDragon: function(id) {
        var value = new BigNumber(Blockchain.transaction.value);
        var from = Blockchain.transaction.from;
        var dragon = this.dragon.get(id);
        if (!dragon) {
            this._trans(from, value);
            return false;
        }
        if (!dragon["sale"]) {
            this._trans(from, value);
            return false;
        }

        var sale_price = new BigNumber(dragon["price"]);
        if (value.lt(sale_price)) {
            return false;
        }

        var owner = dragon["owner"];

        dragon["owner"] = from;
        dragon["sale"] = 0;
        dragon["fight"] = 1;

        this.dragon.set(id, dragon);

        this._transDragon(id, owner, from);
        this._trans(owner, sale_price);
        return true;
    },

    _setDragonSale: function(id, on_off, price) {
        var dragon = this.dragon.get(id);
        if (!dragon) {
            return false;
        }
        dragon['sale'] = on_off;
        if (price) {
            price = this._nasToWei() * price;
            dragon['price'] = price;
        }
        this.dragon.set(id, dragon);
    },

    _checkDragonOwner: function(id) {
        var from = Blockchain.transaction.from;
        var user_dragon_list = this.user_dragon.get(from);
        var user_dragon = user_dragon_list[id];
        if (!user_dragon) {
            return false;
        }
        var dragon = this.dragon.get(id);
        if (dragon["owner"] !== from) {
            return false;
        }
        return true;
    },

    setDragonOnMarket: function(id, price) {
        if (this._checkDragonOwner(id)) {
            this._setDragonSale(id, 1, price);
            return true;
        }
        return false;
    },

    setDragonOffMarket: function(id) {
        if (this._checkDragonOwner(id)) {
            this._setDragonSale(id, 0, 0);
            return true;
        }
        return false;
    },

    _setDragonFight: function(id, on_off) {
        var dragon = this.dragon.get(id);
        if (!dragon) {
            return false;
        }
        dragon['fight'] = on_off;
        this.dragon.set(id, dragon);
    },

    setDragonFight: function(id) {
        if (this._checkDragonOwner(id)) {
            this._setDragonFight(id, 1);
            return true;
        }
        return false;
    },

    setDragonRest: function(id) {
        if (this._checkDragonOwner(id)) {
            this._setDragonFight(id, 0);
            return true;
        }
        return false;
    },

    setDragonName: function(id, name) {
        if (this._checkDragonOwner(id)) {
            var dragon = this.dragon.get(id);
            if (!dragon) {
                return false;
            }
            dragon['name'] = name;
            this.dragon.set(id, dragon);
            return true;
        }
        return false;
    },

    _checkCDByTime: function(dragon, code_type) {
        var time = this._getTimeBySec();
        var cd_time = 0;
        if (code_type === "defence_time") {
            cd_time = this.defence_cd_time;
        } else {
            var speed = parseInt(dragon["speed"] / 5);

            if (speed + 1 > this.cd_map_cnt) {
                speed = this.cd_map_cnt - 1;
            }
            var cd_time = this.cd_map.get(speed);
            if (!cd_time) {
                this._ADDLOG("ERR: no speed! " + speed + "," + dragon["speed"]);
                return false;
            }
        }
        if (cd_time + dragon[code_type] > time) {
            this._ADDLOG("ERR: code!" + cd_time + "," + code_type + "," + time + "," + Blockchain.transaction.hash);
            return false;
        }
        return true;
    },

    _checkCD: function(dragon, code_type) {
        var bk_height = new BigNumber(Blockchain.block.height);

        var cd_height = 0;
        if (code_type === "defence_height") {
            cd_height = this.defence_cd;
        } else {
            var speed = parseInt(dragon["speed"] / 5);

            if (speed + 1 > this.cd_map_cnt) {
                speed = this.cd_map_cnt - 1;
            }
            var cd_height = this.cd_map.get(speed);
            if (!cd_height) {
                this._ADDLOG("ERR: no speed! " + speed);
                return false;
            }
        }
        var last_height = new BigNumber(dragon[code_type]);
        var dest_height = last_height.plus(cd_height);
        if (dest_height.gt(bk_height)) {
            this._ADDLOG("ERR: CD! " + code_type + "|" + dest_height + "|" + bk_height);
            return false;
        }
        return true;
    },

    _checkWeight: function(dragon) {
        if (dragon["weight"] < 0.1) {
            return false;
        }
        return true;
    },

    _checkAttacker: function(dragon, attacker_id) {
        var from = Blockchain.transaction.from;
        if (dragon["owner"] !== from) {
            this._ADDLOG("ERR: not owner! " + dragon["owner"] + "|" + from);
            return false;
        }
        if (dragon["fight"] !== 1) {
            this._ADDLOG("ERR: rest now! " + attacker_id);
            return false;
        }

        if (false === this._checkCDByTime(dragon, "attack_time")) {
            return false;
        }
        if (false === this._checkWeight(dragon)) {
            return false;
        }
        return true;
    },

    _checkDefender: function(dragon, defender_id) {
        if (false === this._checkCDByTime(dragon, "defence_time")) {
            return false;
        }
        if (dragon["fight"] !== 1) {
            this._ADDLOG("ERR: rest now! " + defender_id);
            return false;
        }
        if (false === this._checkWeight(dragon)) {
            return false;
        }
        return true;
    },

    _logfight: function(attacker, attacker_id, defender, defender_id, random, win) {
        var msg = attacker_id + "|" + attacker["power"] + "|" + attacker["flex"] + "|" + attacker["weight"];
        msg += "|" + defender_id + "|" + defender["power"] + "|" + defender["flex"] + "|" + defender["weight"];
        msg += "|" + random + "|" + Blockchain.block.height + '|' + win;
        return msg;
    },

    _addLog: function(id, msg) {
        var dragon_log = this.dragon_log.get(id);
        if (!dragon_log) {
            dragon_log = {
                "cnt": 0,
                "log": {}
            };
        }

        var log = dragon_log["log"];
        log[dragon_log["cnt"]] = msg;
        if (dragon_log["cnt"] > 300) {
            dragon_log["cnt"] = 0;
        }
        dragon_log["cnt"] += 1;
        dragon_log["log"] = log;
        this.dragon_log.set(id, dragon_log);
    },

    _fight: function(attacker_id, attacker, defender_id, defender) {
        var af = (attacker["power"] * 3 + attacker["flex"] * 2) * attacker["weight"];
        var df = (defender["power"] * 2 + defender["flex"] * 3) * defender["weight"];
        var max = df;
        if (af > df) {
            max = af;
        }
        var result = (max + af - df) / max * 0.5;
        var random = Math.random();
        var msg = '';
        if (result > random) {
            msg = this._logfight(attacker, attacker_id, defender, defender_id, random, "a");

            attacker["weight"] = attacker["weight"] + 0.2 * defender["weight"];
            defender["weight"] = 0.8 * defender["weight"];
        } else {
            msg = this._logfight(attacker, attacker_id, defender, defender_id, random, "d");
            defender["weight"] = defender["weight"] + 0.2 * attacker["weight"];
            attacker["weight"] = 0.8 * attacker["weight"];
        }
        return msg;
    },

    fight: function(attacker_id, defender_id) {
        var attacker = this.dragon.get(attacker_id);
        if (!attacker) {
            return {
                "msg": "no such attacker"
            };
        }
        if (false === this._checkAttacker(attacker, attacker_id)) {
            return {
                "msg": "attacker check fail"
            };
        }
        var defender = this.dragon.get(defender_id, defender_id);
        if (!defender) {
            return {
                "msg": "no such defender"
            };
        }
        if (false === this._checkDefender(defender, defender_id)) {
            return {
                "msg": "defender check fail"
            };
        }
        if (defender["owner"] === attacker["owner"]) {
            return {
                "msg": "Same owner;"
            };
        }
        var msg = this._fight(attacker_id, attacker, defender_id, defender);
        //	attacker["attack_height"] = Blockchain.block.height;
        //	defender["defence_height"] = Blockchain.block.height;
        var time = this._getTimeBySec();
        attacker["attack_time"] = time;
        defender["defence_time"] = time;

        this.dragon.set(attacker_id, attacker);
        this.dragon.set(defender_id, defender);
        this._addLog(attacker_id, msg);
        this._addLog(defender_id, msg);
        return true;
    },

    getEggsInfo: function() {
        var free = [];
        var pay = [];
        for (var i = 0; i < this.dragon_egg_cnt; i++) {
            var dragon_egg = this.dragon_egg.get(i);
            pay.push(dragon_egg);
        }
        for (var i = 0; i < this.dragon_egg_free_cnt; i++) {
            var dragon_egg = this.dragon_egg_free.get(i);
            free.push(dragon_egg);
        }
        return {
            "pay": pay,
            "free": free
        };
    },

    getSelfDragon: function(adress) {
        return this.user_dragon.get(adress);
    },

    getDragonIdList: function(id_list) {
        var dragon = {};
        for (var i = 0; i < id_list.length; i++) {

            var id = id_list[i];
            var info = this.dragon.get(id);
            if (!info) {
                continue;
            }
            dragon[id] = info;
        }
        return {
            "ret": 0,
            "data": dragon
        };
    },

    getDragonIdList2: function(id_list, key_array) {
        var dragon = {};
        for (var i = 0; i < id_list.length; i++) {
            var id = id_list[i];
            var one = this.dragon.get(id);
            if (!one) {
                continue;
            }
            var one_out = {};

            for (var j in key_array) {
                var key = key_array[j];
                one_out[key] = one[key];
            }
            dragon[id] = one_out;
        }
        return {
            "ret": 0,
            "data": dragon
        };
    },

    getDragonInfo: function(id) {
        return this.dragon.get(id);
    },

    getDragonList: function(start, num) {
        var ret_msg = [];
        var end = start + num;
        if (end > this.dragon_cnt) {
            end = this.dragon_cnt;
        }

        var dragon = {};
        for (var i = start; i < end; i++) {
            dragon[i] = this.dragon.get(i);
        }
        return {
            "ret": 0,
            "data": dragon
        };
    },

    getDragonList2: function(start, num, key_array) {
        var end = start + num;
        if (end > this.dragon_cnt) {
            end = this.dragon_cnt;
        }
        var dragon = {};
        for (var i = start; i < end; i++) {
            var one = this.dragon.get(i);
            var one_out = {};

            for (var j in key_array) {
                var key = key_array[j];
                one_out[key] = one[key];
            }
            dragon[i] = one_out;
        }
        return {
            "ret": 0,
            "data": dragon
        };
    },

    getDragonCnt: function() {
        return [this.dragon_cnt, this.dragon_pay_cnt];
    },

    getFightLog: function(id) {
        return this.dragon_log.get(id);
    },

    me: function() {
        return Blockchain.transaction.from;
    },

}

module.exports = DragonContract