"use strict";
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
	        	var gametitle = "",starttime="",endtime="";
				var opts = [];
				var optsNum = 0;
	        	$.each(args,function(index,item){
	        		if(item.name == "gametitle"){
	        			gametitle = item.value;
	        		}else if(item.name == "starttime"){
	        			starttime = item.value;
	        		}else if(item.name == "endtime"){
	        			endtime = item.value;
	        		}else{
						//opts.push(item.name+'='+item.value);
						opts.push(item.value);
						optsNum +=1;
	        		}
				});
				
	        	starttime = new Date(starttime).getTime();
				endtime = new Date(endtime).getTime();

				var gameInfo={
					"title":gametitle,
					"betOption":opts,
					"optionNum":optsNum
				}
				//mylog("gameInfo :",gameInfo);
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
}
function addgame(gameInfo){
	defaultOptions.listener = addgameCallback;
	var args = [gameInfo];
	nebPay.call(config.contractAddr,"0",config.createGame,JSON.stringify(args),defaultOptions);//to, value, func, args, options
}
function gameCallback(data){
	$('#gameModal').modal('hide');
}
//[{"txhash":"dbfb2d32c31e3b41495ba367f558045db78332577253a81beb9ed68597dc82f0","index":1,"send":0}]
function userBet(userBetInfo){
	defaultOptions.listener = gameCallback;
	var args = [userBetInfo];

	nebPay.call(config.contractAddr,"0.1",config.userBet,JSON.stringify(args),defaultOptions);//to, value, func, args, options
	//nebPay.call(config.contractAddr,"0",config.userBet,'["'+id+'","'+opts+'"]',defaultOptions);//to, value, func, args, options

}

var gameList = [];
function getGameList(){
	var curTime = new Date().getTime();
	$('.gameContainer').html('<div class="alert alert-warning w-100" role="alert">正在从星云链上读取投票数据...</div>');
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
					games.push('<div class="d-flex justify-content-between align-items-center">');
					games.push('<p class="d-flex justify-content-between align-items-center">'+game.title+'</p>');
					games.push('</div>');
					//option
					$.each(game.betOption,function(index,option){
						games.push('<p class="card-text gametitle">'+ option + "当前下注金额 : " + game.betAmount[option]/BigNumber+" NAS 当前下注人数 : "+game.betUserNums[option]+'</p>');
					});
					games.push('<div class="d-flex justify-content-between align-items-center">');

					games.push('<div class="btn-group">');
					games.push('<button type="button" class="btn btn-sm btn-outline-secondary gameResultbtn" gameid="'+game.hash+'">查看结果</button>');
					if(game.finish == 0){
						games.push('<button type="button" class="btn btn-sm btn-outline-secondary gamebtn" gamehash="'+game.hash+'">参与投票</button>');
						games.push('</div>');
						games.push('<small class="text-muted">进行中</small>');
					}else{
						games.push('</div>');
						games.push('<small class="text-muted">已结束</small>');
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