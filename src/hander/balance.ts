import { Client } from "../client";
import { hexToss58 } from "../utils/address";

export class Balance {
    public base: Client;
  
    constructor(c: Client) {
        this.base = c; 
    }
  
    async balance(address:string):Promise<any> {
        const res:any = await this.base.api!.query.system.account(hexToss58(address,undefined));
        return {
            "free": parseInt(res.data.free.toString()),
            "frozen": parseInt(res.data.feeFrozen.toString()),
            "reserved": parseInt(res.data.reserved.toString()),
        }
    }
  }