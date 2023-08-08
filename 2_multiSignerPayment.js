const {
    accounts: { alice, bob, cincinati },
    serverUrl
} = require('./config.json');

const { Server, Networks, Asset, TransactionBuilder, Keypair, Operation } = require('stellar-sdk');
const server = new Server(serverUrl);

const multiSigningPayment = async() => {
    const cincinatiAccount = await server.loadAccount(cincinati.publicKey);


    const txOptions = {
        fee: await server.fetchBaseFee(),
        networkPassphrase: Networks.TESTNET
    }

    const paymentOpt1 = {
        asset: Asset.native(),
        destination: bob.publicKey,
        amount: "100",
        source: cincinati.publicKey
    }
    const paymentOpt2 = {
        asset: Asset.native(),
        destination: cincinati.publicKey,
        amount: "50",
        source: bob.publicKey
    }

    const transaction = new TransactionBuilder(cincinatiAccount, txOptions)
        .addOperation(Operation.payment(paymentOpt1))
        .addOperation(Operation.payment(paymentOpt2))
        .setTimeout(0)
        .build();

    transaction.sign(Keypair.fromSecret(cincinati.secret), Keypair.fromSecret(bob.secret));

    await server.submitTransaction(transaction);
}

multiSigningPayment()
    .then(console.log("Successfully Completed the transaction"))
    .catch(e => {
        console.log("ErrorAgain: ", e.response.data.extras.result_codes);
        throw e;
    })