const TronWeb = require('tronweb')
// .default;

console.log('TronWeb type:', typeof TronWeb); // Should be 'function'

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  headers: { 'TRON-PRO-API-KEY': '06fc8416-cfb2-426b-8a1c-87cfadd586c3' }
});

const USDT_CONTRACT = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';

async function getUSDTBalance(address) {
  try {
    const contract = await tronWeb.contract().at(USDT_CONTRACT);
    const result = await contract.methods.balanceOf(address).call();

    console.log('Raw result:', result);

    // Handles various formats
    const rawBal = result.toString?.() || result._hex || result;
    const balance = parseFloat(rawBal) / 1e6;

    console.log(`✅ USDT Balance for ${address}: ${balance}`);
  } catch (error) {
    console.error('❌ Error fetching USDT balance:', error.message || error);
  }
}

// Mainnet address with confirmed USDT balance
const addressToCheck = 'TNG4NNARrhqvTmi1CzLnYfB11Gxc9mq7Rv';
getUSDTBalance(addressToCheck);
