"use strict";

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 


var	HttpRequest = nebulas.HttpRequest,
	Neb = nebulas.Neb;
var neb = new Neb();
	neb.setRequest(new HttpRequest(config.apiPrefix));
var nasApi = neb.api;
	

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


var itemNum = 3;
var BigNumber = 1000000000000000000;
$(function(){
	//[{"title":"cxp1","betOption":["one","two"],"optionNum":2}]
	$('#addNewgame').unbind('click').click(function(){
		var forms = document.getElementsByClassName('needs-validation');
	    var validation = Array.prototype.filter.call(forms, function(form) {
	        if (form.checkValidity() === false) {
	          event.preventDefault();
	          event.stopPropagation();
	        }else{
				var args = $('.needs-validation').serializeArray();
				mylog(args);
	        	var gametitle = "",starttime="",endtime=0;
				var opts = [];
				var optsNum = 0;
	        	$.each(args,function(index,item){
	        		if(item.name == "gametitle"){
	        			gametitle = item.value;
	        		}else if(item.name == "starttime"){
	        			starttime = item.value;
	        		}else if(item.name == "endtime"){
	        			endtime = item.value ==""?0:new Date(item.value).getTime()/1000;
	        		}else{
						//opts.push(item.name+'='+item.value);
						opts.push(item.value);
						optsNum +=1;
	        		}
				});
				
	        	//starttime = new Date(starttime).getTime();

				var gameInfo={
					"title":gametitle,
					"betOption":opts,
					"optionNum":optsNum,
					"endTime":endtime
				}
				mylog("gameInfo :",gameInfo);
				//addgame(gametitle,starttime,endtime,opts.join('@'));
				addgame(gameInfo);
	        }
	        form.classList.add('was-validated');
	    });
	});
	$('#addgameToOpts').unbind('click').click(function(){
		var args = $('.needs-validation1').serializeArray();
		//mylog("addgameToOpts" + args);
		if(args.length == 1){
			alert('请你至少选择一个选项进行投票。');
		}else{
	    	var opts = [],gameid='',betIndex = 0;
			$.each(args,function(index,item){
				mylog(item);
				if(item.name == 'gameid'){
					gameid = item.value;
				}else{
					//opts.push(item.index);
					betIndex = parseInt(item.value);
				}
			});

			var userBetInfo={
				"txhash":gameid,
				"index":betIndex
			};

			userBet(userBetInfo);
			
		}
	});

	$('#confirmGameResult').unbind('click').click(function(){
		var args = $('.needs-validation2').serializeArray();
		mylog("addgameToOpts" + args);
		if(args.length == 1){
			alert('请你至少选择一个选项进行投票。');
		}else{
	    	var opts = [],gameid='',resultIndex = 0;
			$.each(args,function(index,item){
				mylog(item);
				if(item.name == 'gameid'){
					gameid = item.value;
				}else if(item.name == 'gameResultIndex'){
					//opts.push(item.index);
					resultIndex = parseInt(item.value);
				}
			});

			var userResultInfo={
				"txhash":gameid,
				"index":resultIndex,
				"send":1
			};

			mylog("result",userResultInfo);
			confirmGameResult(userResultInfo);
			
		}
	});
	
	
	$('#additem').click(function(){
		var html = [];
		html.push('<div class="input-group mb-3">');
		html.push('<div class="input-group-prepend">');
		html.push('<span class="input-group-text" id="basic-addon1">选项</span>');
		html.push('</div>');
		html.push('<input type="text" class="form-control" name="item'+itemNum+'"  aria-label="选项" aria-describedby="basic-addon1" required>');
		html.push('<div class="input-group-append" style="cursor:pointer;">');
		html.push('<span class="input-group-text itemdel" id="basic-addon2">删除</span>');
		html.push('</div>');
		html.push(' <div class="invalid-feedback">请填写选项内容。</div>');
		html.push('</div>');
		$('#itemContainer').append(html.join(''));
		itemNum++;
		$('.itemdel').unbind('click').click(function(){
			$(this).parents('div.mb-3').remove();
			return false;
		});
		return false;
	});
	//getGameList()
	getGameList();
});

function mylog() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("luckyGame-->")
    console.log.apply(console, args);
};

(function getWallectInfo() {
    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");
    window.addEventListener('message', function (e) {
        if (e.data && e.data.data) {
            if (e.data.data.account) {//这就是当前钱包中的地址
							config.userAddress = e.data.data.account
							mylog(config.userAddress)
              //app.updateUserInfo() //小提示：获取钱包地址后，就可以调用对应的方法查询用户信息啦
            }
        }
    });
})();

function openAddgameModal(){
	$('.txResult').remove();
	$('input').val('');
	$('#newgame').modal('show');
}
function addgameCallback(data){
	$('#newgame').modal('hide');
	window.location.reload();

}

function checkTransaction(queryConfig) {
    var serialNumber = queryConfig.serialNumber,
        //context = config.context,
        minInterval = 6,
        intervalTime = queryConfig.intervalTime || minInterval,//每多少秒查询一次
        timeOut = queryConfig.timeOut || 60; //60秒后超时
    if (intervalTime < minInterval) {
        intervalTime = minInterval
    }
    var timeOutId = 0
    var timerId = setInterval(function () {
        // 注意：这里使用了 neb.js 的 getTransactionReceipt 方法来查询交易结果
        nasApi.getTransactionReceipt({
            hash: queryConfig.txhash
        }).then(function (receipt) {
            // 交易状态结果： 0 failed失败, 1 success成功, 2 pending确认中.
            if (receipt.status === 1) {
                //清除定时器和关闭弹窗通知
                clearInterval(timerId)
                //config.transStateNotify.close()
                if (timeOutId) {
                    //清除超时定时器
                    clearTimeout(timeOutId)
                }
                //如果有配置成功消息，显示成功消息通知
                if (queryConfig.successMsg) {
                    queryConfig.$notify({
                        title: '操作成功',
                        message: queryConfig.successMsg,
                        type: 'success'
                    });
                }
                //如果有配置成功回调，执行成功回调
                if (queryConfig.successFunc) {
                    setTimeout(function () {
						queryConfig.successFunc(receipt)
						
                    }, 500)
                }
            }
        }).catch(function (err) {
			//context.$message.error("查询交易结果发生了错误！" + err)
			mylog("查询交易结果发生了错误！" + err);
        });
    }, intervalTime * 1000)
    //查询超时定时器
    timeOutId = setTimeout(function () {
        //queryConfig.transStateNotify.close()
        if (timerId) {
			//context.$message.error("查询超时！请稍后刷新页面查看最新内容！")
			mylog("查询超时！请稍后刷新页面查看最新内容！");
            clearInterval(timerId)
        }
    }, timeOut * 1000)
}

function addgame(gameInfo){

	var queryConfig = {},
        serialNumber = "";

	queryConfig.successFunc = addgameCallback;
	defaultOptions.listener = function (value) {
		queryConfig.serialNumber = serialNumber
		 //获取到交易生成后的  txhash，然后通过 txhash 去查询，而不是 queryPayInfo
		queryConfig.txhash = value.txhash
		checkTransaction(queryConfig);
		//addgameCallback(null);
	};
	var args = [gameInfo];
	serialNumber = nebPay.call(config.contractAddr,"0",config.createGame,JSON.stringify(args),defaultOptions);//to, value, func, args, options
}


function gameCallback(data){
	$('#gameModal').modal('hide');
	window.location.reload();
}

function confirmGameCallback(data){
	$('#gameConfirmModal').modal('hide');
	window.location.reload();
}
//[{"txhash":"dbfb2d32c31e3b41495ba367f558045db78332577253a81beb9ed68597dc82f0","index":1,"send":0}]
function userBet(userBetInfo){
	var queryConfig = {},
	serialNumber = "";
	queryConfig.successFunc = gameCallback;
	defaultOptions.listener = function (value) {
		queryConfig.serialNumber = serialNumber
		//获取到交易生成后的  txhash，然后通过 txhash 去查询，而不是 queryPayInfo
		queryConfig.txhash = value.txhash
		checkTransaction(queryConfig);
		//addgameCallback(null);
	};
	var args = [userBetInfo];
	nebPay.call(config.contractAddr,"0.1",config.userBet,JSON.stringify(args),defaultOptions);//to, value, func, args, options
}

function confirmGameResult(resultInfo){
	var queryConfig = {},
	serialNumber = "";
	queryConfig.successFunc = confirmGameCallback;
	defaultOptions.listener = function (value) {
		queryConfig.serialNumber = serialNumber
		//获取到交易生成后的  txhash，然后通过 txhash 去查询，而不是 queryPayInfo
		queryConfig.txhash = value.txhash
		checkTransaction(queryConfig);
		//addgameCallback(null);
	};
	var args = [resultInfo];
	nebPay.call(config.contractAddr,"0",config.confirmResult,JSON.stringify(args),defaultOptions);
}

var gameList = [];
function getGameList(){
	var curTime = new Date().getTime();
	$('.gameContainer').html('<div class="alert alert-warning w-100" role="alert">正在从星云链上读取LuckyBet数据...</div>');
	query(config.getGameList,'[-1,-1]',function(data){
		if(typeof data.execute_err != 'undefined' && data.execute_err.length==0){
			if(data.execute_err.length > 0){
				alert("获取投票列表失败："+data.execute_err);
				return;
			}else{
				gameList = JSON.parse(data.result);
                //gameList.reverse();
  
				mylog(gameList);
				var games = [];
				$.each(gameList.games,function(index,game){
					games.push('<div class="col-md-4">');
					games.push('<div class="card mb-4 box-shadow">');
					games.push('<div class="card-body">');
					games.push('<div class="col-sm-12 gamebg"></div>');
					//tittl
					games.push('<div>');
					games.push('<p style="font-weight:bold" ><font size="4">'+game.title+'</font></p>');

					games.push('</div>');
					games.push('<table cellpadding="0" cellspacing="0">');
					games.push('<tr><th align="left" width="170"></th><th align="right"></th></tr>');
					//option
					$.each(game.betOption,function(index,option){
						  games.push('<tr>');
						  games.push('<td>' + option +'</td>');
						  games.push('<td>(<font color="red">' + game.betAmount[option]/BigNumber+'</font>/NAS <font color="red">'+game.betUserNums[option]+'</font>/人)</td>');
						  games.push('</tr>');
						
					});
					games.push('<tr><td>'+"创建时间 : "+new Date(game.createTime * 1000).Format("yy-M-d")+'</td><td>'+"结束时间 : "+(game.endTime==0?"无":new Date(game.endTime * 1000).Format("yy-M-d"))+'</td></tr>');
					games.push('</table>');
					games.push('<div class="d-flex justify-content-between align-items-center">');

					games.push('<div class="btn-group">');
					// games.push('<button type="button" class="btn btn-sm btn-outline-secondary gameResultbtn" gameid="'+game.hash+'">查看结果</button>');
					if(game.finish == 0){
						games.push('<button type="button" class="btn btn-sm btn-outline-secondary gamebtn" gamehash="'+game.hash+'">LuckyBet</button>');
						if(game.from == config.userAddress){
							games.push('<button type="button" class="btn btn-sm btn-outline-secondary gameConfirmbtn" gamehash="'+game.hash+'">输入结果</button>');
						}
						games.push('</div>');
						games.push('<small class="text-muted" style="font-weight:bold">进行中</small>');
					}else{
						games.push('</div>');
						games.push('<small class="text-muted" style="font-weight:bold">已结束</small>');
					}
					games.push('</div>');
					games.push('</div>');
					games.push('</div>');
					games.push('</div>');
				});
				$('.gameContainer').html('');
				$('.gameContainer').html(games.join(''));
				$('.gamebtn').unbind('click').click(function(){
					//console.log("gamebtn",game);
					gameOpts($(this).attr('gamehash'));
				});
				$('.gameResultbtn').unbind('click').click(function(){
					gameResult($(this).attr('gameid'));//gameResultContainer
				});
				$('.gameConfirmbtn').unbind('click').click(function(){
					gameConfirm($(this).attr('gamehash'));//gameResultContainer
				});
			}
		}else{
			alert(data.execute_err);
		}
	});
}
// function gameOpts(gameid){
// 	initgameOptsToModal(gameid);
// 	$('#gameModal').modal('show');
// }

function gameOpts(gamehash){
	initgameOptsToModal(gamehash);
	$('#gameModal').modal('show');
}

function initgameOptsToModal(gamehash){
	$('.txResult').remove();
	$('.needs-validation1').html('');
	var game = {};
	$.each(gameList.games,function(index,gameInfo){
		if(gameInfo.hash == gamehash){
			game = gameInfo;
		}
	});

	//console.log("game ",game);
	$('.needs-validation1').append('<input type="hidden" name="gameid" value='+game.hash+'>');
	$('.needs-validation1').append('<p class="text-primary">'+game.title+'</p>');
	var html = [],gamenum=0;
	
	for(var opt in game.betAmount){
		gamenum += parseInt(game.betAmount[opt]);
	}
	
	console.log("gamenum : ",gamenum);

    var betIndex = 0;
	for(var opt in game.betAmount){
		var num = parseInt(game.betAmount[opt]),per=0;
		if(gamenum > 0 ){
			per = num / gamenum * 100;
			per = per.toFixed(2);
		}

		console.log("opt "+opt+"per :"+per);
		html.push('<div class="custom-control custom-checkbox" style="margin-top:10px;">');
		html.push('<input type="radio" class="custom-control-input" name="gameBet" id="'+opt+'" value="'+betIndex+'">');
		html.push('<label class="custom-control-label" for="'+opt+'">'+opt+'</label>');
		html.push('<div class="progress">');
		html.push('<div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: '+per+'%;color:#000;" aria-valuenow="'+per+'" aria-valuemin="0" aria-valuemax="100">'+num/BigNumber+' NAS，占比 '+per+' %</div>');
		html.push('</div>');
        html.push('</div>');
        
        betIndex += 1;
		
	}
	
	$('.needs-validation1').append(html.join(''));
}
function gameResult(gameid){
	initgameResultToModal(gameid);
	$('#gameresultModal').modal('show');
}
function initgameResultToModal(gameid){
	$('.txResult').remove();
	$('#gameResultContainer').html('');
	var game = {};
	for(var i=0;i<gameList.length;i++){
		if(gameList[i].id === gameid){
			game = gameList[i];
			break;
		}
	}
	$('#gameResultContainer').append('<p class="text-primary">'+game.title+'</p>');
	var html = [],gamenum=0;
	
	for(var i=0;i<game.options.length;i++){
		gamenum += parseInt(game.options[i].gamenum);
	}
	
	for(var i=0;i<game.options.length;i++){
		var num = parseInt(game.options[i].gamenum),per=0;
		if(gamenum > 0 ){
			per = num / gamenum * 100;
			per = per.toFixed(2);
		}
		html.push('<div class="custom-control custom-checkbox" style="margin-top:10px;">');
		html.push('<input type="checkbox" class="custom-control-input" id="'+game.options[i].key+'" name="'+game.options[i].key+'">');
		html.push('<label class="custom-control-label" for="'+game.options[i].key+'">'+game.options[i].title+'</label>');
		html.push('<div class="progress">');
		html.push('<div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: '+per+'%;color:#000;" aria-valuenow="'+per+'" aria-valuemin="0" aria-valuemax="100">'+num+'票，占比 '+per+'%</div>');
		html.push('</div>');
		html.push('</div>');
		
	}

	$('#gameResultContainer').append(html.join(''));
}

function gameConfirm(gamehase){
	initgameConfirmToModal(gamehase);
	$('#gameConfirmModal').modal('show');
}

function initgameConfirmToModal(gamehash){
	$('.txResult').remove();
	$('.needs-validation2').html('');
	var game = {};
	$.each(gameList.games,function(index,gameInfo){
		if(gameInfo.hash == gamehash){
			game = gameInfo;
		}
	});

	//console.log("game ",game);
	$('.needs-validation2').append('<input type="hidden" name="gameid" value='+game.hash+'>');
	$('.needs-validation2').append('<p class="text-primary">'+game.title+'</p>');
	var html = [],gamenum=0;
	
	for(var opt in game.betAmount){
		gamenum += parseInt(game.betAmount[opt]);
	}
	
	console.log("gamenum : ",gamenum);

	var betIndex = 0;
	var resultArr=[];
	for(var opt in game.betAmount){
		var num = parseInt(game.betAmount[opt]),per=0;
		if(gamenum > 0 ){
			per = num / gamenum * 100;
			per = per.toFixed(2);
		}

		console.log("opt "+opt+"per :"+per);
		html.push('<div class="custom-control custom-checkbox" style="margin-top:10px;">');
		//html.push('<input type="radio" class="custom-control-input" name="gameBet" id="'+opt+'" value="'+betIndex+'">');
		html.push('<label class="custom-control-label" for="'+opt+'">'+opt+'</label>');
		html.push('<div class="progress">');
		html.push('<div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: '+per+'%;color:#000;" aria-valuenow="'+per+'" aria-valuemin="0" aria-valuemax="100">'+num/BigNumber+' NAS，占比 '+per+' %</div>');
		html.push('</div>');
		html.push('</div>');
		
		resultArr.push('<option value ="'+betIndex+'">'+opt+'</option>');
        
        betIndex += 1;
		
	}

	//mylog(resultArr);
	html.push('<div class="align-center">');

	html.push('<br>');
	html.push('<label>请选择正确的结果</label>');
	html.push('<select name="gameResultIndex">')
	for(var i = 0;i<resultArr.length;i++){
		html.push(resultArr[i]);
	}
	html.push('</select>')
	html.push('</div>');

	
	$('.needs-validation2').append(html.join(''));
}


// Example starter JavaScript for disabling form submissions if there are invalid fields
(function() {
  'use strict';
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();