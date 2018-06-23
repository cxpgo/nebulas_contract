

      var toastBot = {
        init: function init() {
          this.bindUIActions();
        },
        bindUIActions: function bindUIActions() {
          toastr.options.positionClass = 'toast-top-right';
          toastr.options.closeButton = true;
          toastr.options.progressBar = true;
          toastr.options.extendedTimeOut = 0; //1000
          toastr.options.timeOut = 3000;
          toastr.options.fadeOut = 250;
          toastr.options.fadeIn = 250;
        },
        showToast: function showToast(type, msg, position) {
          if(position === '' || position == null)
            position = 'toast-top-right';
          toastr.options.positionClass = position;
          toastr[type](msg);
        }
      };
      toastBot.init();

      'use strict';

      var Nebulas = require("nebulas");
      var Account = Nebulas.Account;
      var Transaction = Nebulas.Transaction;
      var Utils = Nebulas.Utils;
      var Unit = Nebulas.Unit;

//      var rpcURL = "https://testnet.nebulas.io";
//      var dappAddress = 'n1zNr21Y4jzFGgeYnAe5aXjfTHq1cNxjUex';
//      var chainId = 1001;
//      var rpcURL = "http://localhost:8685";
      var rpcURL = "https://mainnet.nebulas.io";
      var chainId = 1;
      var dappAddress = 'n1kVKK53C85Cu6PBkgE8Qvch9ym5GxnDSWr';

      if(chainId == 1){
        $("#contract").prop('href','https://explorer.nebulas.io/#/address/'+ dappAddress +'#/').prop('target', '_blank_');
      } else {
        $("#contract").prop('href','https://explorer.nebulas.io/#/testnet/address/'+ dappAddress +'#/').prop('target', '_blank_');
      }

      var neb = new Nebulas.Neb();
      neb.setRequest(new Nebulas.HttpRequest(rpcURL));

      var needCheckNASWallet = localStorage.getItem('needCheckNASWallet') || '1';
      needCheckNASWallet = parseInt(needCheckNASWallet);
      var invoker = null;

      function checkNASWallet(_invoker) {
        invoker = _invoker;
        //to check if the extension is installed
        //if the extension is installed, var "webExtensionWallet" will be injected in to web page
        if (needCheckNASWallet && (typeof (webExtensionWallet) === "undefined")) {
          $(document).ready(function () {
            if(window.mobileAndTabletcheck()){
              toastBot.showToast('warning', "在移动端请安装使用NAS nano!");
              disableCheckNASWallet();
              return true;
            } else{
              toastBot.showToast('warning', "未检测到星云钱包插件, 请安装星云钱包插件!");
            }
            return false;
          });
        }
        return true;
      }

      function disableCheckNASWallet() {
        needCheckNASWallet = false;
        localStorage.setItem('needCheckNASWallet', 0);
        if(invoker != null){
          invoker.click();
        }
      }

      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      var receiptGot = [];

      function getTransactionReceipt(hash, callback){
        $.post(rpcURL + '/v1/user/getTransactionReceipt', JSON.stringify({
          "hash": hash
        }), function (resp) {
          callback && callback(resp)
        })
      }

      function recheckTransactionReceipt(hash, callback) {
        var retry = 8;
        var retry2 = 32;
        var task = setInterval(function () {
          getTransactionReceipt(hash, function (resp) {
            retry --;
            if(retry < 0){

              try{
                neb.api.getTransactionReceipt({hash: hash}).then(function(receipt){
                  if (receipt.status == 0) //not in pending
                  {
                    clearInterval(task);
                    toastBot.showToast('error', "交易失败!");
                  } else if (receipt.status == 2) {
                    retry2 --;
                    if(retry2 < 0){
                      clearInterval(task);
                      toastBot.showToast('error', "查询交易状态超时, 请您手动查询交易!");
                    }
                  } else {
                    clearInterval(task);
                    callback && callback(resp.result);
                  }
                });
              } catch(err){
                console.log(err);
              }
            }
            var status = resp.result.status;
            if(status == 1){
              clearInterval(task);
              if(!receiptGot.includes(resp.result.hash)){
                receiptGot.push(resp.result.hash);
                callback && callback(resp.result);
              }
            }
          })
        }, 5000);
      }

      function innerCall(fun, args, value, callback, to) {
        let params = {};
        var account = Account.NewAccount();
        account.setPrivateKey(faucets[getRandomInt(0, 100)]);
        params.from = account;
        params.to = dappAddress;
        if(Account.isValidAddress(to)){
          params.to = to;
        }
        params.gasPrice = Utils.toBigNumber(1000000);
        params.gasLimit = Utils.toBigNumber(20000000);
        params.value = value;
        // prepare contract
        params.contract = {
          "function": fun,
          "args": JSON.stringify(args)
        };
        console.log(params.from.getAddressString() + ' call ' + params.to + ' @ ' + fun + ": " + JSON.stringify(args) + ' with value: ' + value);
        callback(params);
      }

      window.mobileAndTabletcheck = function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
      };

      function refresh(){
        toastBot.showToast('info', "交易数据将在几秒内自动更新");
        address = localStorage.getItem('address') || '';
        closeTransfer();
        checkWallet();
        loadHolderAccount();
      }


      function getMobileTransactionReceipt(serialNumber, callback){
        $.get("https://pay.nebulas.io/api/mainnet/pay/query?payId=" + serialNumber, function (resp) {
          callback && callback(resp)
        })
      }

      var retryQueryTime = 10;

      function recheckMobileTransactionReceipt(serialNumber, callback) {
        retryQueryTime --;
        getMobileTransactionReceipt(serialNumber, function (resp) {
          if(resp instanceof Object){
            if(retryQueryTime <= 0){
              clearInterval(intervalQuery);
              if(resp.code == 1){
                clearInterval(intervalQuery);
                toastBot.showToast('error', "查询交易状态超时, 请您手动查询交易!");
                return;
              }
            }
            if (resp.code == 0 && (resp.data.status == 1 || resp.data.status == 0)) {
              clearInterval(intervalQuery);
              if(!receiptGot.includes(resp.data.hash)){
                receiptGot.push(resp.data.hash);
                callback && callback(resp.data);
              }
            }
          }

        })
      }

      var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
      var nebPay = new NebPay();
      var intervalQuery;

      function callNebPay(fun, args, value, callback, to) {

        if(isWx){
          toastBot.showToast('error', "微信浏览器可能不支持NAS nano调用!");
        }

        var wait;
        function clearWait() {
          clearInterval(wait);
          refresh();
        }

        var inQuery = false;
        toastBot.showToast('info', "正在调用钱包!");
        var serialNumber;
        innerCall(fun, args, value, function (params) {
          serialNumber = nebPay.call(params.to, params.value, params.contract.function, params.contract.args, {
            qrcode: {
              showQRCode: false
            },
            callback:"https://pay.nebulas.io/api/mainnet/pay",
            listener: function (resp) {
              if(window.mobileAndTabletcheck()){
                if(!inQuery){
                  inQuery = true;
                  retryQueryTime = 10;
                  toastBot.showToast('info', "正在查询交易状态!");
                  intervalQuery = setInterval(function () {
                    recheckMobileTransactionReceipt(serialNumber, function(resp){
                      if(resp.status == 1){
                        toastBot.showToast('success', "交易成功!");
                        callback && callback(resp);
                      } else if(resp.status == 0){
                        toastBot.showToast('error', "交易失败! 错误提示: " + resp.execute_error);
                        wait = setInterval(clearWait, 2000);
                      }
                    });
                  }, 5000);
                }
                return;
              }
              if (resp !== 'Error: Transaction rejected by user') {
                toastBot.showToast('info', "交易已提交, 正在为您查询交易状态, 请等待约15秒钟!");
                var hash = resp.txhash;
                recheckTransactionReceipt(hash, function (resp) {
                  toastBot.showToast('success', "交易成功!");
                  callback && callback(resp);
                })
              } else {
                toastBot.showToast('warning', "您已取消!");
              }

            }
          });

          var wait2;
          function clearWait2() {
            clearInterval(wait2);
            if(window.mobileAndTabletcheck() && !inQuery){
              inQuery = true;
              retryQueryTime = 15;
              toastBot.showToast('info', "正在查询交易状态!");
              intervalQuery = setInterval(function () {
                recheckMobileTransactionReceipt(serialNumber, function(resp){
                  if(resp.status == 1){
                    toastBot.showToast('success', "交易成功!");
                    callback && callback(resp);
                  } else if(resp.status == 0){
                    toastBot.showToast('error', "交易失败! 错误提示: " + resp.execute_error);
                    wait = setInterval(clearWait, 2000);
                  }
                });
              }, 5000);
            }
          }
          wait2 = setInterval(clearWait2, 10000);

          var wait3;

          function clearWait3() {
            clearInterval(wait3);
            if (window.mobileAndTabletcheck() && inQuery) {
              toastBot.showToast('info', "正在查询交易状态!");
            }
          }

          wait3 = setInterval(clearWait3, 18000);

        }, to);
      }


      function checkWallet(){
        if (typeof (webExtensionWallet) === "undefined") {
          $(document).ready(function () {
            if(window.mobileAndTabletcheck()){
              if(Account.isValidAddress(address)){
                $(".network-state").html('已使用NAS nano登陆');
              } else{
                $(".network-state").removeClass('badge-success').addClass('badge-warning').html('请安装NAS nano');
              }
            } else{
              $(".network-state").removeClass('badge-success').addClass('badge-warning').html('未检测到星云插件钱包');
            }
          });
          return false;
        }
        $(".network-state").html('已安装星云插件钱包');
        return true;
      }

      var address = localStorage.getItem('address') || '';
      var addressWallet = '';
      var nasBalance = -1;
      var nttBalance = -1;

      function loadHolderAccount(){
        window.addEventListener('message', function (e) {
          if (e.data.data && !!e.data.data.account) {
            addressWallet = e.data.data.account;
            if(checkWallet()){
              address = addressWallet;
              localStorage.setItem('address', address);
            }
          }

          if(Account.isValidAddress(address)){
            try {
              neb.api.getAccountState(address).then(function(accstate){
                $(".accountBalance").html(' ' + Unit.fromBasic(accstate.balance, "nas").toFixed(2) + ' NAS');
                nasBalance = Unit.fromBasic(accstate.balance, "nas").toFixed(2);
                var fun = 'balanceOf';
                var args = [];

                args.push(address);
                innerCall(fun, args, 0, function(params){
                  neb.api.call(address, params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
                    var result = resp.result;
                    if(result === 'null' || result === '""'){
                      return;
                    }
                    try{
                      var balance = JSON.parse(result);
                      $(".accountTokenBalance").html(' ' + Unit.fromBasic(balance, "nas").toFixed(2) + ' NTT');
                      nttBalance = Unit.fromBasic(balance, "nas").toFixed(2);
                      var fun = 'getHolder';
                      var args = [];
                      args.push(address);
                      innerCall(fun, args, 0, function(params){
                        neb.api.call(address, params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
                          var result = resp.result;
                          console.log(result);
                          if(result === 'null' || result === '""'){
                            return;
                          }

                          try{
                            var holder = JSON.parse(result);
                            if(holder.account !== ''){
                              if(holder.holderId >= 0){
                                $(".avatarImg").prop('src', "assets/images/avatars/uifaces" + holder.holderId % 20 + ".jpg");
                                $(".user-name").html('幸运用户 #' + holder.holderId);
                                $("#ownToken").html(holder.tokens.length);
                                //TODO calculate captital
                                $("#capital").html(0);
                              } else{
                                $(".avatarImg").prop('src', "assets/images/avatars/uifaces0.jpg");
                                $(".user-name").html('新幸运用户');
                              }

                            } else {
                              $(".user-name").html('新幸运用户');
                            }
                          }catch (err){
                            //result is the error message
                            console.log("error:" + err.message)
                          }
                        }).catch(function (err) {
                          console.log("error:" + err.message)
                        });

                      });

                    }catch (err){
                      //result is the error message
                      console.log("error:" + err.message)
                    }
                  }).catch(function (err) {
                    console.log("error:" + err.message)
                  });

                });

              })
            } catch (err){
              console.log(err);
            }
          }
        });
        window.postMessage({
          "target": "contentscript",
          "data": {},
          "method": "getAccount"
        }, "*");
      }

      var tokens = [];


      function loadHolderNum(){
        var fun = 'holderNum';
        var args = [];
        innerCall(fun, args, 0, function(params){
          neb.api.call(address, params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
              return;
            }
            try{
                var holderNum = JSON.parse(result);
                $("#holderNum").html(holderNum);
            }catch (err){
              //result is the error message
              console.log("error:" + err.message)
            }
          }).catch(function (err) {
            console.log("error:" + err.message)
          });

        });
      }

      function loadTokenNum(){
        var fun = 'tokenNum';
        var args = [];
        innerCall(fun, args, 0, function(params){
          neb.api.call(address, params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
              return;
            }
            try{
              var tokenNum = JSON.parse(result);
              $("#tokenNum").html(tokenNum);
            }catch (err){
              //result is the error message
              console.log("error:" + err.message)
            }
          }).catch(function (err) {
            console.log("error:" + err.message)
          });

        });
      }

      function loadTokens(){
        var fun = 'getTokens';
        var args = [];
        args.push(0);
        args.push(2);
        innerCall(fun, args, 0, function(params){
          neb.api.call(address, params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
              return;
            }
            try{
              var _tokens = JSON.parse(result);
              tokens.concat(_tokens);

              console.log(tokens);
            }catch (err){
              //result is the error message
              console.log("error:" + err.message)
            }
          }).catch(function (err) {
            console.log("error:" + err.message)
          });

        });
      }

      function closeAuth(){
        selectedToken = '';
        $("#authAccount").val('');
        $("#authAmount").val('');
        $("#confirmAuth").attr('disabled', true);
      }

      function closePop(){
        selectedToken = '';
        $("#popAccount").val('');
        $("#popAmount").val('');
        $("#confirmPop").attr('disabled', true);
      }

      function closeTransfer(){
        selectedToken = '';
        $("#receiverAccount").val('');
        $("#transferAmount").val('');
      }

      var selectedToken = '';

      function authDialog(_address){
        selectedToken = _address;
        $("#form-auth").modal('show');
        $("#token").html('站台');

        var fun = 'authority';
        var args = [];
        args.push(address);
        args.push(selectedToken);
        innerCall(fun, args, 0, function(params){
          neb.api.call(address, params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
              return;
            }
            try{
              var authority = JSON.parse(result);
              $("#authAmount").val(Unit.fromBasic(authority).toFixed(6));
              $("#confirmAuth").attr('disabled', false);
            }catch (err){
              //result is the error message
              console.log("error:" + err.message)
            }
          }).catch(function (err) {
            console.log("error:" + err.message)
          });

        });

      }

      function popDialog(_address){
        selectedToken = _address;
        $("#form-pop").modal('show');
        $("#token").html('站台');
        var fun = 'popularity';
        var args = [];
        args.push(address);
        args.push(selectedToken);
        innerCall(fun, args, 0, function(params){
          neb.api.call(address, params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
              return;
            }
            try{
              var popularity = JSON.parse(result);
              $("#popAmount").val(Unit.fromBasic(popularity).toFixed(6));
              $("#confirmPop").attr('disabled', false);
            }catch (err){
              //result is the error message
              console.log("error:" + err.message)
            }
          }).catch(function (err) {
            console.log("error:" + err.message)
          });

        });
      }

      function transferDialog(_address){
        selectedToken = _address;
        $("#form-transfer").modal('show');
        $("#token").html('转账');
      }

      function auth(){
        if (checkNASWallet()) {
          var amount = $("#authAmount").val();
          // TODO get decimals from token info
          var decimals = 18;
          amount = new BigNumber(amount);

          if(amount < 0){
            toastBot.showToast('warning', "您输入的数量, 请重新输入!");
            return;
          }

          $("#form-auth").modal('hide');
          var fun = 'authorize';
          var args = [];
          args.push(selectedToken);
          args.push(amount);
          callNebPay(fun, args, 0, function (resp) {
            localStorage.setItem('address', resp.from);
            var wait;
            function clearWait() {
              clearInterval(wait);
              refresh();
            }
            wait = setInterval(clearWait, 2000);
          });
        }
      }

      function pop(){
        if (checkNASWallet()) {
          var amount = $("#popAmount").val();
          // TODO get decimals from token info
          var decimals = 18;
          amount = new BigNumber(amount);

          if(amount < 0){
            toastBot.showToast('warning', "您输入的数量, 请重新输入!");
            return;
          }

          $("#form-pop").modal('hide');
          var fun = 'popularize';
          var args = [];
          args.push(selectedToken);
          args.push(amount);
          callNebPay(fun, args, 0, function (resp) {
            localStorage.setItem('address', resp.from);
            var wait;
            function clearWait() {
              clearInterval(wait);
              refresh();
            }
            wait = setInterval(clearWait, 2000);
          });
        }
      }


      function transfer(){
        if (checkNASWallet()) {
          var receiver = $("#receiverAccount").val();
          var amount = $("#transferAmount").val();
          // TODO get decimals from token info
          var decimals = 18;
          amount = new BigNumber(amount).mul(new BigNumber(10).pow(decimals));

          if(amount < 0){
            toastBot.showToast('warning', "您输入的数量, 请重新输入!");
            return;
          }
          if(!Account.isValidAddress(receiver)){
            toastBot.showToast('warning', "您输入的账户地址有误, 请重新输入!");
            return;
          }
          $("#form-transfer").modal('hide');
          var fun = 'transfer';
          var args = [];
          args.push(receiver);
          args.push(amount);
          callNebPay(fun, args, 0, function (resp) {
            localStorage.setItem('address', resp.from);
            var wait;
            function clearWait() {
              clearInterval(wait);
              refresh();
            }
            wait = setInterval(clearWait, 2000);
          }, selectedToken);
        }
      }

      function setLoginAccount(){
        if(Account.isValidAddress($("#loginAccountAddress").val())){
          loadHolderAccount();
          address = $("#loginAccountAddress").val();
          localStorage.setItem('address', address);
          $("#form-login").modal('hide');
          toastBot.showToast('success', "您的幸运账户登陆成功!");
        } else{
          toastBot.showToast('warning', "您输入的账户地址有误, 请重新输入!");
        }
      }

      function login(){
        if(!checkWallet()){
          $("#form-login").modal('show');
          $("#loginAccountAddress").val(address);
        } else {
          if (checkNASWallet()) {
            var fun = 'login';
            var args = [];
            callNebPay(fun, args, 0, function (resp) {
              localStorage.setItem('address', resp.from);
              var wait;
              function clearWait() {
                clearInterval(wait);
                refresh();
              }
              wait = setInterval(clearWait, 2000);
            });
          }
        }
      }

      var isWx = Boolean(navigator.userAgent.match(/MicroMessenger/ig));
      if(isWx){
        toastBot.init();
        toastBot.showToast('warning', "微信浏览器可能不支持NAS nano调用!");
      }

      function load(){
        checkWallet();
        loadHolderAccount();
        loadTokens();
        loadHolderNum();
        loadTokenNum();
      }

      load();

