const StarNotary = artifacts.require('StarNotary');

contract('StarNotary', accounts => {

    beforeEach(async function () {
        this.contract = await StarNotary.new({from: accounts[0]});
    });

    describe('can create a star', () => {
        it('Test createStar() and tokenIdToStarInfo(): can create a star and get its name', async function () {
            const tokenId = 1001;
            await this.contract.createStar("Star power 103!", "I love my wonderful star", "ra_032.155", "dec_121.874", "mag_245.978", "", tokenId, {from: accounts[0]});

            const starInfo = await this.contract.tokenIdToStarInfo(tokenId);
            assert.equal(starInfo[0], 'Star power 103!');
        });
    });

    describe('buying and selling stars', () => {
        let user1 = accounts[1];
        let user2 = accounts[2];
        let randomMaliciousUser = accounts[3];

        let starId = 1001;
        let starPrice = web3.toWei(.01, "ether");

        beforeEach(async function () {
            await this.contract.createStar("Star power 103!", "I love my wonderful star", "ra_032.155", "dec_121.874", "mag_245.978", "", starId, {from: user1});
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
        let user1 = accounts[1];
        let starId = 1001;

        beforeEach(async function () {
            await this.contract.createStar("Star power 103!", "I love my wonderful star", "ra_032.155", "dec_121.874", "mag_245.978", "", starId, {from: user1});
        });

        it('Test checkIfStarExist(): user can check if star exist', async function () {
            const result = await this.contract.checkIfStarExist(starId);
            assert.equal(result, true);
        });
    });

});