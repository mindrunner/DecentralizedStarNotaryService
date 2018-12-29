// Allows us to use ES6 in our migrations and tests.
require('babel-register');
const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
    networks: {
        ganache: {
            host: '127.0.0.1',
            port: 7545,
            network_id: '*' // Match any network id
        },
        rinkeby: {
            provider: function () {
                return new HDWalletProvider("depend taste baby vote decorate legal rich bomb roast unveil shiver wide", "https://rinkeby.infura.io/v3/02d023d163e443ee99bdfad59df5c635")
            },
            network_id: '4',
            gas: 4500000,
            gasPrice: 10000000000,
        }
    }
};
