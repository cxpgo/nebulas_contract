"use strict";//799e38c2942d01c890340762a0438a89bedfaa8f67e730e5b5c075cbe49c5cc2
var config = {
		chainId:1,
		
		//apiPrefix:"https://testnet.nebulas.io",
		//contractAddr:"n1up5HhtJbhEd2zGWoYte2RhZ6EhSrgYrHL",
		//address :"n1VmVAnAL3WA69HSrpMTCfn9VpZ9AXJ4kiN",
//
		apiPrefix:"https://mainnet.nebulas.io",
		contractAddr:"n1yFSccukJYKLaXikpcSv9FrT9tyRxxKKzR",
		address :"n1HH4bfu2w1ZC22MfSKH7YjNqtyoNHHHrY3",
		//txhash:8dd3c1569bd642ae7092162836a060a08cb79643cbac3c71946fd0b9c9ce46ca
		userAddress :"",
		gaslimit : 2000000,
		gasprice : 1000000,
		vote:"vote",
		addVote:"addVote",
		removeVote:"removeVote",
		getVoteInfo:"getVoteInfo",
		getVoteList:"getVoteList",
		checkTxhash:"https://explorer.nebulas.io/#/tx/",

		//n1yFSccukJYKLaXikpcSv9FrT9tyRxxKKzR

		createGame:"createGame",//[{"title":"cxp1","betOption":["one","two"],"optionNum":2}]
		userBet:"userBet",//[{"txhash":"dbfb2d32c31e3b41495ba367f558045db78332577253a81beb9ed68597dc82f0","index":1,"send":0}]
		confirmResult:"confirmResult",//[{"txhash":"dbfb2d32c31e3b41495ba367f558045db78332577253a81beb9ed68597dc82f0","index":1,"send":0}]
		getGameList:"getGameList",//[-1,-1]
		getGameByHash:"getGameByHash",//["eb3c70b40251a7812516f8142f3ed246fc583fa7532d87da6e383fd578a57b42"]
		getCreateGameByUser:"getCreateGameByUser",//[-1,-1]
		getUserBetList:"getUserBetList",//[-1,-1]
		t_userBet:"t_userBet"
};
var nebulas = require("nebulas"),
neb = new nebulas.Neb(),
nonce = 0;

var NebPay = require("nebpay");
var nebPay = new NebPay();    
var serialNumber;
var defaultOptions = {
		goods: {        //Dapp端对当前交易商品的描述信息，app暂时不展示
			name: "",       //商品名称
			desc: "",       //描述信息
			orderId: "",    //订单ID
			ext: ""         //扩展字段
		},
		qrcode: {
			showQRCode: false,      //是否显示二维码信息
			container: undefined    //指定显示二维码的canvas容器，不指定则生成一个默认canvas
		},
		// callback 是记录交易返回信息的交易查询服务器地址，不指定则使用默认地址
		callback: undefined,
		// listener: 指定一个listener函数来处理交易返回信息（仅用于浏览器插件，App钱包不支持listener）
		listener: undefined,
		// if use nrc20pay ,should input nrc20 params like name, address, symbol, decimals
		nrc20: undefined
};
function query(method,args,callback){
	if(typeof method != "undefined"){ 
		try{
			console.log("start query" + method);
			neb.setRequest(new nebulas.HttpRequest(config.apiPrefix));
			neb.api.getAccountState(config.address).then(function (resp) {
				nonce = parseInt(resp.nonce || 0) + 1;
				neb.api.call({
					from: config.address,
					to: config.contractAddr,
					value: 0,
					nonce: nonce,
					gasPrice: config.gasprice,
					gasLimit: config.gaslimit,
					contract: {
						"function": method,
						"args": args
					}
				}).then(function (resp) {
					callback(resp);
				}).catch(function (err) {
					callback(err);
					console.log(err);
				});
			}).catch(function (e) {
				callback(e);
				console.log(e);
			});
		}catch(e){
			callback(e);
		}
	}
}


Date.prototype.toLocaleString = function() {
    return this.getFullYear() + "/" + (this.getMonth() + 1) + "/" + this.getDate() + " " + this.getHours() + ":" + this.getMinutes();
};
