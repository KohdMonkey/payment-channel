var Tx = require('ethereumjs-tx')
var Util = require('ethereumjs-util')
var abi = require('ethereumjs-abi')
const Web3 = require('web3')
const web3 = new Web3("ws://localhost:8546")

var conf = require("./config.json")
const account1 = conf.PUB1 
const account2 = conf.PUB2 

const privKey1 = "0x" + conf.PRIV1 


const contractAddress = conf.CONTRACT_ADDR 

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



var contract = new web3.eth.Contract(conf.CONTRACT_ABI, contractAddress)


//get contract balance
web3.eth.getBalance(contractAddress).then(console.log)


//var amount = web3.utils.toWei('' + conf.PAYMENT_AMOUNT, 'ether')
var amount = 10000

rawmsg = contractAddress + amount
hashedmsg = web3.utils.sha3(rawmsg)

message = constructPaymentMessage(contractAddress, amount)
signed = signMessage(hashedmsg, privKey1)
signed.amount = amount

fs = require('fs')
paymentData = JSON.stringify(signed)


fs.writeFile('./payment.json', paymentData, 'utf-8', function (err) {
  if(err) {
    return console.log('could not write to file: ' + err)
  }
})

/*
 *
v = web3.utils.hexToNumber(signed.v)
r = web3.utils.hexToBytes(signed.r)
s = web3.utils.hexToBytes(signed.s)

console.log('v' + v)
console.log('r' + r)
console.log('s' + s)

pref = prefixed(hashedmsg)	
pub3 = Util.ecrecover(pref, v, r, s)
signer2 = Util.pubToAddress(pub3).toString("hex")
console.log("signer2: " + signer2)
*/


//console.log("message hash: " + message)
//console.log("signature: " + signed.signature)
//signer = web3.eth.accounts.recover(hashedmsg, signed.signature)
//console.log("signer: " + signer)


