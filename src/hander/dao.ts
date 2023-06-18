import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { hexToU8a, u8aToString, hexToString } from "@polkadot/util";
import { Client } from "../client";
import { hexToss58, ss58ToHex } from "../utils/address";

export class DAO {
    public base: Client;
  
    constructor(c: Client) {
      this.base = c; 
    }
  
    // 下一个 DAO ID
    public async next_dao_id(): Promise<number> {
      // 构建请求
      const result: any = await this.base.api!.query.WeteeDAO.next_dao_id()?? 5000;
      return result;
    }
  
    // 创建 DAO
    public async create_dao(
      from: string,
      name: string, 
      purpose: string,
      meta_data: string
    ): Promise<void> {
      const injector = await web3FromAddress(hexToss58(from,undefined));
      await this.base.api!.tx.weteeDAO.createDao(
        name,
        purpose,
        meta_data
      ).signAndSend(hexToss58(from,undefined), { signer: injector.signer }, (status) => {

       });
    }
  
    // DAO 成员列表
    public async member_list(dao_id: number): Promise<string[]> {
      // 构建请求
      const result: any = await this.base.api!.query.weteeDAO.members(dao_id) ?? [];
      return result.toHuman().map((v:string)=>ss58ToHex(v));
    }
  
     // DAO 成员积分
    public async member_point(
      dao_id: number, 
      member: string
    ): Promise<number> {
      // 构建请求
      const result: any = await this.base.api!.query.weteeDAO.memberPoint(dao_id, hexToss58(member,undefined))
        ?? 0;
      return parseInt(result.toString());
    }
  
    // DAO 信息
    public async dao_info(
      dao_id: number 
    ): Promise<any> {
      // 构建请求
      let result:any = await this.base.api!.query.weteeDAO.daos(dao_id);
      let data = JSON.parse(JSON.stringify(result));
      data.creator = ss58ToHex(data.creator)
      data.daoAccountId = ss58ToHex(data.daoAccountId)
      data.name = hexToString(data.name)
      data.purpose = hexToString(data.purpose)
      data.metaData = hexToString(data.metaData)
      data.status = undefined
      data.id = dao_id
      data.chainUnit = 1_000_000_000_000
      return data;
    }  
  
    // 加入 DAO
    public async join(
      from: string,
      dao_id: number,
      share_expect: number, 
      value: number
    ): Promise<boolean> {
      const extensions = await web3Enable('DTIM');
      if (extensions.length === 0) {
        throw new Error('no extension');
      }
      const injector = await web3FromAddress(hexToss58(from,undefined));
      return new Promise<boolean>((ok,no)=>{
        this.base.api!.tx.weteeAsset.joinRequest(
          dao_id,
          share_expect,
          value 
        ).signAndSend(hexToss58(from,undefined), { signer: injector.signer }, ({events = [],status}) => {
          if (status.isInBlock) {
            events.forEach(({ event: { data, method, section }, phase }) => {
              console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
              if(`${section}.${method}` == "system.ExtrinsicSuccess"){
                ok(true)
              }
            });
          } else if (status.isFinalized) {
            ok(true)
          }
        }).catch((error: any) => {
          no("transaction failed', "+error.toString())
        });
      })
    }

    // DAO 里程碑
    public async roadmap_list(
      dao_id: number,
      year: number,
    ):Promise<any[]>{
        let results: any[] = [];
        for (let quarter = 1;quarter< 5;quarter++) {
          let tasks: any = await this.base.api!.query.weteeDAO.roadMaps(dao_id,year * 100 + quarter);
          results.push({
              "year":year,
              "quarter":quarter,
              "tasks":tasks.map((v:any) => {
                var j = JSON.parse(JSON.stringify(v))
                var transTag = [];
                var tags = hexToU8a(j.tags);
                for (var i = 0; i < tags.byteLength; i++) {
                  transTag.push( {value:tags[i]})
                }
                return  {
                  id: j.id,
                  name: hexToString(j.name),
                  priority: j.priority,
                  creator: ss58ToHex(j.creator),
                  tags: transTag,
                  status: j.status,
                };
              }),
          });
        }
        return results;
    }
  
    //
    async create_task(
        from: string,
        dao_id: number,
        roadmap_id: number,
        name: string,
        priority: number,
        tags: number[]|undefined,
    ): Promise<boolean> {
        const extensions = await web3Enable('DTIM');
        if (extensions.length === 0) {
          throw new Error('no extension');
        }
        const injector = await web3FromAddress(hexToss58(from,undefined));
        return new Promise<boolean>((ok,no)=>{
          this.base.api!.tx.weteeAsset.joinRequest(
            dao_id,
            roadmap_id,
            name,
            priority,
            tags
          ).signAndSend(hexToss58(from,undefined), { signer: injector.signer }, ({events = [],status}) => {
            if (status.isInBlock) {
              events.forEach(({ event: { data, method, section }, phase }) => {
                console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                if(`${section}.${method}` == "system.ExtrinsicSuccess"){
                  ok(true)
                }
              });
            } else if (status.isFinalized) {
              ok(true)
            }
          }).catch((error: any) => {
            no("transaction failed', "+error.toString())
          });
        })
    }
  
      // DAO 发行货币总量
      async total_issuance(dao_id: number):Promise<string>{
        let result: any = await this.base.api!.query.tokens.totalIssuance(dao_id);
        return result.toString();
      }
  }