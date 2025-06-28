// src/app/services/tron.service.ts
import { Injectable } from '@angular/core';
// import TronWeb from 'tronweb';
import * as TronWebLib from 'tronweb';


@Injectable({
  providedIn: 'root'
})
export class TronService {
  private tronWeb:any;
  private USDT_CONTRACT = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';
  private API_KEY = '06fc8416-cfb2-426b-8a1c-87cfadd586c3'; // Optional but recommended

  constructor() {
    this.tronWeb = new TronWebLib.TronWeb({
      fullHost: 'https://api.trongrid.io',
      headers: { 'TRON-PRO-API-KEY': this.API_KEY }
    });
  }

  async getUSDTBalance(address: string): Promise<number> {
  try {
    const hexAddress = this.tronWeb.address.toHex(address);
    const contract = await this.tronWeb.contract().at(this.USDT_CONTRACT);
    const result = await contract.methods.balanceOf(hexAddress).call();
    const humanBal = parseFloat(result.toString()) / 1e6;
    console.log(`[✅] USDT Balance for ${address}: ${humanBal}`);
    return humanBal;
  } catch (err) {
    console.error('[🚨 ERROR] Failed to fetch USDT balance:', err);
    return 0;
  }
}



  async transferUSDT(fromAddress: string, privateKey: string, toAddress: string, amount: number): Promise<string> {
    const contract = await this.tronWeb.contract().at(this.USDT_CONTRACT);
    const amountInSun = Math.floor(amount * 1e6);

    const tx = await contract.methods.transfer(toAddress, amountInSun)
      .send({ feeLimit: 5_000_000 }, fromAddress, privateKey);

    return tx;
  }
}
