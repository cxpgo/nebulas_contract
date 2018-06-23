'use strict';

var callFunction = "initGame";
    var callArgs = "[\"\"]";
    var value = "0";
    var contract = {
        "function": callFunction,
        "args": callArgs
    };
    sendTransaction(contract, value);
}

function sendTransaction(_contract, _value) {
    try {
        gAccount = Account.NewAccount().fromKey(Config.keyjson, "nasWang6755980");
        var from = gAccount.getAddressString();
        var to = "n1KAoEKbdgiEvTeMyK96ULdd3LXp2DgM9xD";
        var value = _value;
        var gasprice = "1000000";
        var gaslimit = "2000000";
        neb.api.getAccountState(gAccount.getAddressString()).then((resp)=> {
            gTx = new Transaction({
              chainID: Config.chainId, 
              from: gAccount, 
              to:to, 
              value:Unit.nasToBasic(Utils.toBigNumber(_value)), 
              nonce:parseInt(resp.nonce)+1, 
              gasPrice:gasprice, 
              gasLimit:gaslimit, 
              contract:_contract
            });
            gTx.signTransaction();
            return  neb.api.sendRawTransaction(gTx.toProtoString());
        }).then((resp)=>{
            console.log(resp);
            processingHash = resp.txhash;
            var task = setInterval(()=>{
                transactionCallback(processingHash, function(resp){
                    if (resp.data.result.status === 1) {
                        console.log("===============成功=============");
                        processingHash = "";
                        clearInterval(task);
                    } 
                    else if (resp.data.result.status === 0) {
                        console.log("===============失败=============");
                        processingHash = "";
                        clearInterval(task);
                    };
                })
            }, 5000);
        }).catch(err=>{
            console.log(err.message);
        });
    } catch(e) {
        console.log(e);
    }   
}

module.exports = Football;