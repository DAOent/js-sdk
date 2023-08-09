import { Client } from "../client";
import { hexToss58 } from "../utils/address";

export class Balance {
    public base: Client;
  
    constructor(c: Client) {
        this.base = c; 
    }
  
    async balance(address:string):Promise<any> {
        const res:any = await this.base.api!.query.system.account(hexToss58(address,undefined));
        let item = res.toHuman();
        return {
            "free": parseInt(item.data.free.replace(",",""))*1_000_000_000_000,
            "frozen": parseInt(item.data.frozen.replace(",",""))*1_000_000_000_000,
            "reserved": parseInt(item.data.reserved.replace(",",""))*1_000_000_000_000,
        }
    }
  }