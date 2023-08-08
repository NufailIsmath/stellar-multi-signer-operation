const {
    accounts: { alice, bob },
    serverUrl
} = require('./config.json');

const { Server, Networks, Asset, TransactionBuilder, Keypair, Operation } = require('stellar-sdk');
const server = new Server(serverUrl);

const multiSignOnAliceAccount = async () => {

    const extraSigner = {
        signer: {
            ed25519PublicKey: bob.publicKey,
            weight: 1
        }
    }

    // To make both Aice's and Bob's to sign as madatory for a transaction 
    /* const thresholds = {
        masterWeight: 2, // master (alice) respresnts the accounts private key weight
        lowThreshold: 2, // Alice (not bob) can sign
        medThreshold: 3, // Alice and Bob need to sign for payments or change of trustlines
        highThreshold: 3, // same for acocunt merges and other options
    } */

    const thresholds = {
        lowThreshold: 2,
        medThreshold: 0,
        highThreshold: 0,
    }

    const aliceAccount = await server.loadAccount(alice.publicKey);


    const txOptions = {
        fee: await server.fetchBaseFee(),
        networkPassphrase: Networks.TESTNET
    }

    const multiSignTx = new TransactionBuilder(aliceAccount, txOptions)
        .addOperation(Operation.setOptions(thresholds))
        .addOperation(Operation.setOptions(extraSigner))
        .setTimeout(0)
        .build();

    multiSignTx.sign(Keypair.fromSecret(alice.secret));

    await server.submitTransaction(multiSignTx);

}

multiSignOnAliceAccount()
    .then(console.log("Successfully added signer to Alice account"))
    .catch(e => {
        console.log("ErrorAgain: ", e.response.data.extras.result_codes);
        throw e;
    })