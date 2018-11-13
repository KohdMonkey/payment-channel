var Tx = require('ethereumjs-tx')
var Util = require('ethereumjs-util')
var abi = require('ethereumjs-abi')
const Web3 = require('web3')
const web3 = new Web3("ws://localhost:8546")

var conf = require("./config.json")
const account1 = conf.PUB1 
const account2 = conf.PUB2 
const privKey2 = Buffer.from(conf.PRIV2, 'hex')




function constructPaymentMessage(contractAddress, amount) {
		var toHash = contractAddress.toString() + amount.toString()
		//var toHash = contractAddress.toString() + amount.toString() + nonce.toString()
		var paymentHash = web3.utils.sha3(toHash)
		//console.log('to hash: ' + toHash)
		//console.log('payment hash: ' + paymentHash)
		return paymentHash		
}

function signMessage(message, key) {
		var signedMessage = web3.eth.accounts.sign(message, key)
		//console.log('signature: ' + signedMessage.signature)
    console.log(signedMessage)
		return signedMessage
}



function prefixed(hash) {
    return abi.soliditySHA3(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", hash]
    );
}



const contractAddress = conf.CONTRACT_ADDR 
var contract = new web3.eth.Contract(conf.CONTRACT_ABI, contractAddress)


paymentData = require('./payment.json')
console.log(paymentData)

var amount = parseInt(paymentData.amount, 10)
rawmsg = contractAddress + amount
hashedmsg = web3.utils.sha3(rawmsg)


v = web3.utils.hexToNumber(paymentData.v)
r = web3.utils.hexToBytes(paymentData.r)
s = web3.utils.hexToBytes(paymentData.s)

console.log('v' + v)
console.log('r' + r)
console.log('s' + s)

pref = prefixed(hashedmsg)
pub3 = Util.ecrecover(pref, v, r, s)
signer = Util.pubToAddress(pub3).toString("hex")
console.log("signer: " + signer)

contract.methods.channelSender().call((err, result) => {console.log('sender: ' + result)})
contract.methods.channelRecipient().call((err, result) => {console.log('recipient: ' + result)})
console.log('ACCOUNT2: ' + account2)

issame = signer.toLowerCase() == Util.stripHexPrefix(account1).toLowerCase()
console.log('ISSAME: ' + issame)

/*
contract.methods.CloseChannel(pref, v, r, s, paymentData.amount).call({from: account2}, function(error, result){
  console.log('error: ' + error)
  console.log('result: ' + result)
}); 
*/



web3.eth.getTransactionCount(account2, (err, count) => {

  const txObject = {
    nonce: web3.utils.toHex(count),
    gasLimit: web3.utils.toHex(16000000),
    gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
    to: contractAddress,
    data: contract.methods.CloseChannel(pref, v, r, s, paymentData.amount).encodeABI() 
  }


  const tx = new Tx(txObject)
  tx.sign(privKey2)


  const serializedTxn = tx.serialize()
  const raw = '0x' + serializedTxn.toString('hex')


  web3.eth.sendSignedTransaction(raw, (err, txHash) => {
    console.log('txHash: ', txHash)

    if(err) {
      console.log(err)
    }
  }) 

})



