import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { hexToU8a, u8aToString, hexToString } from "@polkadot/util";
import { Client } from "../client";
import { hexToss58, ss58ToHex } from "../utils/address";

export class Guild {
    public base: Client;
  
    constructor(c: Client) {
      this.base = c; 
    }

    // DAO 成员列表
    public async guild_list(dao_id: number): Promise<any[]> {
      // 构建请求
      const datas: any = await this.base.api!.query.weteeOrg.guilds(dao_id) ?? [];
      let results: any[] = [];

      for(let i=0;i<datas.length;i++){
        let item = JSON.parse(JSON.stringify(datas[i]));
        results.push({
            "id": item.id,
            "name": hexToString(item.name),
            "desc": hexToString(item.desc),
            "metaData": hexToString(item.metaData),
            "daoAccountId": item.daoAccountId,
            "startBlock": item.startBlock,
            "creator": ss58ToHex(item.creator),
            "status": item.status=="Active"?1:0,
        })
      }
      return results;
    }

    // DAO 成员列表
    public async member_list(dao_id: number,project_id:number): Promise<string[]> {
      // 构建请求
      const result: any = await this.base.api!.query.weteeOrg.guildMembers(dao_id,project_id) ?? [];
      return result.toHuman().map((v:string)=>ss58ToHex(v));
    }

    public async create_guild(
      from:string,
      daoId:number,
      name:string,
      desc:string,
      ext:any,
    ):Promise<boolean>{
      const extensions = await web3Enable('DTIM');
      if (extensions.length === 0) {
        throw new Error('no extension');
      }
      const injector = await web3FromAddress(hexToss58(from,undefined));
      return new Promise<boolean>((ok,no)=>{
        this.base.weteeGovCall(
          daoId,
          ext,
          this.base.api!.tx.weteeGuild.createGuild(
              daoId,
              name,
              desc,
              "{}",
              hexToss58(from,undefined)
            )
        ).signAndSend(hexToss58(from,undefined), { signer: injector.signer }, ({events = [],status}:any) => {
          if (status.isInBlock) {
            events.forEach(({ event: { data, method, section }, phase }:any) => {
              console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
              if(`${section}.${method}` == "system.ExtrinsicSuccess"){
                ok(true)
              }
            });
          } else if (status.isFinalized) {
            ok(true)
          }
        }).catch((error: any) => {
          console.log(error)
          no("transaction failed', "+error.toString())
        });
      })     
  }


  public async guild_join_request(
    from:string,
    daoId:number,
    gid:number,
    ext:any,
  ):Promise<boolean>{
    const extensions = await web3Enable('DTIM');
    if (extensions.length === 0) {
      throw new Error('no extension');
    }
    const injector = await web3FromAddress(hexToss58(from,undefined));
    return new Promise<boolean>((ok,no)=>{
      this.base.weteeGovCall(
        daoId,
        ext,
        this.base.api!.tx.weteeGuild.guildJoinRequest(
            daoId,
            gid,
            hexToss58(from,undefined)
          )
      ).signAndSend(hexToss58(from,undefined), { signer: injector.signer }, ({events = [],status}:any) => {
        if (status.isInBlock) {
          events.forEach(({ event: { data, method, section }, phase }:any) => {
            console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
            if(`${section}.${method}` == "system.ExtrinsicSuccess"){
              ok(true)
            }
          });
        } else if (status.isFinalized) {
          ok(true)
        }
      }).catch((error: any) => {
        console.log(error)
        no("transaction failed', "+error.toString())
      });
    })     
}
}