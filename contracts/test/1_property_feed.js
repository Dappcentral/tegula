const expect = require('expect');
const web3util = require('web3-utils');

const PropertyFeedContract = artifacts.require('../contracts/PropertyFeed.sol');

contract('PropertyFeed', (accounts) => {
    let propertyFeed;

    const [owner, account1] = accounts;
    const propertyAddress = '123 Apple St, NY, NY';
    const upi = 'some-upi-string';

    it('should deploy a new PropertyFeed Contract', async () => {
        propertyFeed = await PropertyFeedContract.new({ from: owner });
    });

    it('should be able to add a new UPI + property address combo', async () => {
        await propertyFeed.setProperty(upi, propertyAddress);
    });

    it('should be able to read a property address from the UPI', async () => {
        const value = await propertyFeed.getPropertyAddress(upi);
        expect(value).toBe(propertyAddress);
    });

    it('should be able to return the total number of UPIs', async () => {
        const count = await propertyFeed.countProperties();
        expect(count * 1).toBe(1);
    });
});
