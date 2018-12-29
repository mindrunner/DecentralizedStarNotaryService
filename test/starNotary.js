//import 'babel-polyfill';
const StarNotary = artifacts.require('StarNotary');

let instance;
let accounts;

contract('StarNotary', async (accs) => {
    accounts = accs;
    instance = await StarNotary.deployed();
});

it('can Create a Star', async () => {
    let tokenId = 1;
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]});
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async () => {
    let user1 = accounts[1]
    let starId = 2;
    let starPrice = web3.toWei(.01, "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice)
});

it('lets user1 get the funds after the sale', async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.toWei(.01, "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: starPrice});
    let balanceOfUser1AfterTransaction = web3.eth.getBalance(user1);
    assert.equal(balanceOfUser1BeforeTransaction.add(starPrice).toNumber(), balanceOfUser1AfterTransaction.toNumber());
});

it('lets user2 buy a star, if it is put up for sale', async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.toWei(.01, "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: starPrice});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.toWei(.01, "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0});
    const balanceAfterUser2BuysStar = web3.eth.getBalance(user2);
    assert.equal(balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar), starPrice);
});

it('has a name', async function () {
    const name = await instance.name();
    assert.equal(name, 'Star Notary Service');
});

it('has a symbol', async function () {
    const symbol = await instance.symbol();
    assert.equal(symbol, "SNS");
});

it('exchange two stars', async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId1 = 2133;
    let starId2 = 2432;
    await instance.createStar('awesome star from user 1', starId1, {from: user1});
    await instance.createStar('awesome star from user 2', starId2, {from: user2});


    assert.equal(await instance.ownerOf.call(starId1), user1);
    assert.equal(await instance.ownerOf.call(starId2), user2);

    assert.equal(await instance.starsForExchange.call(starId1), 0);
    assert.equal(await instance.starsForExchange.call(starId2), 0);

    await instance.exchangeStars(starId1, starId2, {from: user1});

    assert.equal(await instance.starsForExchange.call(starId1), starId2);

    assert.equal(await instance.ownerOf.call(starId1), user1);
    assert.equal(await instance.ownerOf.call(starId2), user2);


    await instance.exchangeStars(starId2, starId1, {from: user2});

    assert.equal(await instance.starsForExchange.call(starId1), 0);
    assert.equal(await instance.starsForExchange.call(starId2), 0);

    assert.equal(await instance.ownerOf.call(starId2), user1);
    assert.equal(await instance.ownerOf.call(starId1), user2);
});

it('transfer a star to another address', async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId1 = 5433;
    await instance.createStar('transferrable star', starId1, {from: user1});
    assert.equal(await instance.ownerOf.call(starId1), user1);
    await instance.transferStar(starId1, user2, {from: user1});
    assert.equal(await instance.ownerOf.call(starId1), user2);
});