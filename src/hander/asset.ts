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
            "free": parseInt(res.free),
            "frozen": parseInt(res.frozen),
            "reserved": parseInt(res.reserved),
        }
    }
  }