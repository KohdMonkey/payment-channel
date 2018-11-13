var Tx = require('ethereumjs-tx')
const Web3 = require('web3')
const web3 = new Web3("ws://localhost:8546")

var conf = require('./config.json')
const account1 = conf.PUB1 
const account2 = conf.PUB2 
const privKey1 = Buffer.from(conf.PRIV1, 'hex')


web3.eth.getTransactionCount(account1, (err, count) => {
  txCount = count

  var contract = new web3.eth.Contract(conf.CONTRACT_ABI)

  //set the arguments and bytecode
  var deploy = contract.deploy({
        data: conf.CONTRACT_BYTECODE, 
        arguments: [account2, conf.CHANNEL_DURATION]
  }).encodeABI()

  
  //construct transaction object
  const txObject = {
    nonce: web3.utils.toHex(txCount),
    gasLimit: web3.utils.toHex(1000000),
    gasPrice: web3.utils.toHex(web3.utils.toWei('50', 'gwei')),
    value: web3.utils.toHex(web3.utils.toWei('' + conf.CHANNEL_AMOUNT, 'ether')),
    data: deploy 
  }


  //sign transaction and serialize
  const tx = new Tx(txObject)
  tx.sign(privKey1)


  const serializedTxn = tx.serialize()
  const raw = '0x' + serializedTxn.toString('hex')


  //send transaction
  web3.eth.sendSignedTransaction(raw, (err, txHash) => {
    console.log('txHash: ', txHash)
  })
})

