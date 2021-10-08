import Web3 from 'web3';
import axios from 'axios';
import {
    LimitOrderBuilder,
    PrivateKeyProviderConnector,
    LimitOrderProtocolFacade,
    LimitOrderPredicateBuilder
} from '@1inch/limit-order-protocol';

const makerAsset = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
const takerAsset = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f';
const makerAmt = '1000000';
const takerAmt = '1010000';
const orderLength = 60; // Seconds

const contractAddress = '0xb707d89D29c189421163515c59E42147371D6857';
const walletAddress = '0x7c0714297f15599E7430332FE45e45887d7Da341';
const chainId = 137;
const privateKey = process.env.PRIVATE_KEY;

const web3 = new Web3('https://rpc-mainnet.maticvigil.com/v1/67ee67f1d107231cfb13bd5e672685c15ed151c8');
const connector = new PrivateKeyProviderConnector(
    privateKey,
    web3
);

const limitOrderBuilder = new LimitOrderBuilder(
    contractAddress,
    chainId,
    connector
);

const limitOrderProtocolFacade = new LimitOrderProtocolFacade(
    contractAddress,
    connector
);

const limitOrderPredicateBuilder = new LimitOrderPredicateBuilder(
    limitOrderProtocolFacade
);

const {
    or,
    and,
    timestampBelow,
    nonceEquals,
    gt,
    lt,
    eq,
} = limitOrderPredicateBuilder;

const simplePredicate = and(
    timestampBelow(Math.round(Date.now() / 1000) + orderLength)
);

const limitOrder = limitOrderBuilder.buildLimitOrder({
    makerAssetAddress: makerAsset,
    takerAssetAddress: takerAsset,
    makerAddress: walletAddress,
    makerAmount: makerAmt,
    takerAmount: takerAmt,
    predicate: simplePredicate,
    permit: '0x0',
    interaction: '0x0',
});

const limitOrderTypedData = limitOrderBuilder.buildLimitOrderTypedData(
    limitOrder
);

const limitOrderSignature = await limitOrderBuilder.buildOrderSignature(
    walletAddress,
    limitOrderTypedData
);


const limitOrderHash = limitOrderBuilder.buildLimitOrderHash(
    limitOrderTypedData
);

const orderData = {
    "orderHash": limitOrderHash,
    "orderMaker": walletAddress,
    "createDateTime": Date.now().toString(),
    "signature": limitOrderSignature,
    "makerAmount": makerAmt,
    "takerAmount": takerAmt,
    "data": limitOrderTypedData['message']
}

const jso = JSON.stringify(orderData);
console.log(jso);


axios.post('https://limit-orders.1inch.exchange/v1.0/137/limit-order', orderData)
    .then(resp=>{
        console.log(resp.data);
    })
    .catch(error=> {
        console.log(error);
    });
