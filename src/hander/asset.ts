import { Client } from "../client";
import { hexToss58 } from "../utils/address";

export class Asset {
    public base: Client;
  
    constructor(c: Client) {
        this.base = c; 
    }
  
    async balance(dao_id: number,address:string):Promise<any> {
        const res:any = await this.base.api!.query.tokens.accounts(hexToss58(address,undefined),dao_id);
        let item = res.toHuman();
        return {
            "free": parseInt(item.free.replace(",","")),
            "frozen": parseInt(item.frozen.replace(",","")),
            "reserved": parseInt(item.reserved.replace(",","")),
        }
    }
  }