const {
    accounts: { alice, bob },
    serverUrl
} = require('./config.json');

const { Server, Networks, Asset, TransactionBuilder, Keypair, Operation } = require('stellar-sdk');
const server = new Server(serverUrl);

const multiSigningPayment = async() => {
    const aliceAccount = await server.loadAccount(alice.publicKey);


    const txOptions = {
        fee: await server.fetchBaseFee(),
        networkPassphrase: Networks.TESTNET
    }

    const paymentOpt1 = {
        asset: Asset.native(),
        destination: bob.publicKey,
        amount: "100",
        source: alice.publicKey
    }

    const transaction = new TransactionBuilder(aliceAccount, txOptions)
        .addOperation(Operation.payment(paymentOpt1))
        .setTimeout(0)
        .build();

    transaction.sign(Keypair.fromSecret(alice.secret), Keypair.fromSecret(bob.secret));

    await server.submitTransaction(transaction);
}

multiSigningPayment()
    .then(console.log("Successfully Completed the transaction"))
    .catch(e => {
        console.log("ErrorAgain: ", e.response.data.extras.result_codes);
        throw e;
    })