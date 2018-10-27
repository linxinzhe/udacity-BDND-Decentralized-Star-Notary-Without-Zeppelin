const StarNotary = artifacts.require('StarNotary');

contract('StarNotary', accounts => {

    const user1 = accounts[1];
    const user2 = accounts[2];

    const starName = "Star";
    const starStory = "Superstar";
    const starRa = "ra111";
    const starDec = "dec222";
    const starMag = "mag333";
    const starCent = "cent444";
    const starId = "0xf3f9ffc7a3388c455d8b27b6d44552edad3a6e12637a87fa78df61fe29a831aa";

    beforeEach(async function () {
        this.contract = await StarNotary.new({from: accounts[0]});
    });

    describe('can create a star', () => {
        it('Test createStar() and tokenIdToStarInfo(): can create a star and get its name', async function () {
            await this.contract.createStar(starName, starStory, starRa, starDec, starMag, starCent, starId, {from: user1});

            const starInfo = await this.contract.tokenIdToStarInfo(starId);
            assert.equal(starInfo[0], starName);
        });
    });

    describe('buying and selling stars', () => {
        let starPrice = web3.toWei(.01, "ether");

        beforeEach(async function () {
            await this.contract.createStar(starName, starStory, starRa, starDec, starMag, starCent, starId, {from: user1});
        });

        it('Test ownerOf(): user1 should owe a star', async function () {
            assert.equal(await this.contract.ownerOf(starId), user1);
        });

        it('Test putStarUpForSale() and starsForSale(): user1 can put up their star for sale', async function () {
            assert.equal(await this.contract.ownerOf(starId), user1);
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1});

            assert.equal(await this.contract.starsForSale(starId), starPrice)
        });


        describe('user2 can buy a star that was put up for sale', () => {
            beforeEach(async function () {
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1});
            });

            it('Test buyStar(): user2 is the owner of the star after they buy it', async function () {
                await this.contract.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0});
                assert.equal(await this.contract.ownerOf(starId), user2);
            });

            it('Test buyStar(): user2 ether balance changed correctly', async function () {
                let overpaidAmount = web3.toWei(.05, 'ether');
                const balanceBeforeTransaction = web3.eth.getBalance(user2);
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice: 0});
                const balanceAfterTransaction = web3.eth.getBalance(user2);

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice);
            })
        });
    });

    describe('user can check if star exist', () => {
        beforeEach(async function () {
            await this.contract.createStar(starName, starStory, starRa, starDec, starMag, starCent, starId, {from: user1});
        });

        it('Test checkIfStarExist(): user can check if star exist', async function () {
            const result = await this.contract.checkIfStarExist(starId);
            assert.equal(result, true);
        });
    });

});