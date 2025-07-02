const tron = require('tronweb').default;

const TronWeb = tron.TronWeb;

// const tronWeb = new TronWeb({
//   // fullHost: 'https://api.trongrid.io',
//   fullHost: 'https://api.shasta.trongrid.io', // ✅ Use this for testnet'
//   // headers: { 'TRON-PRO-API-KEY': '06fc8416-cfb2-426b-8a1c-87cfadd586c3' }
// });

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  headers: {
    'TRON-PRO-API-KEY': '06fc8416-cfb2-426b-8a1c-87cfadd586c3'
  }
});

const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const addressToCheck = 'TZCkKfWD3FG3GZ9UUTg2qZokfdwWdBwkYA';

(async () => {
  try {
    // ✅ Set default address (necessary even for read-only calls)
    tronWeb.setAddress(addressToCheck);

    const contract = await tronWeb.contract().at(USDT_CONTRACT);

    const result = await contract.methods.balanceOf(addressToCheck).call();
    const balance = parseFloat(result) / 1e6;

    console.log(`✅ USDT Balance: ${balance} USDT`);
  } catch (err) {
    console.error('❌ Error:', err.message || err);
  }
})();

// const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
//
// const USDT_ABI = [
//   {
//     constant: true,
//     inputs: [{ name: '_owner', type: 'address' }],
//     name: 'balanceOf',
//     outputs: [{ name: 'balance', type: 'uint256' }],
//     payable: false,
//     stateMutability: 'view',
//     type: 'function'
//   }
// ];
//
// const addressToCheck = 'TNG4NNARrhqvTmi1CzLnYfB11Gxc9mq7Rv';
//
// (async () => {
//   try {
//     tronWeb.defaultAddress = {
//       hex: tronWeb.address.toHex(addressToCheck),
//       base58: addressToCheck
//     };
//
//     console.log('🔍 Connecting to USDT contract on Mainnet...');
//     const contract = await tronWeb.contract(USDT_ABI, USDT_CONTRACT);
//
//     const hexAddress = tronWeb.address.toHex(addressToCheck); // 🔥 FIX HERE
//     console.log('🔍 Fetching USDT balance...');
//     const result = await contract.methods.balanceOf(hexAddress).call();
//
//     const balance = tronWeb.toBigNumber(result)
//       .div(1e6)
//       .toNumber();
//
//     console.log(`✅ Your USDT Balance: ${balance} USDT`);
//   } catch (err) {
//     console.error('❌ Error:', err.message || err);
//   }
// })();
