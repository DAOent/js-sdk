import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { hexToU8a, u8aToString } from "@polkadot/util";
import { Client } from "../client";
import { hexToss58, ss58ToHex } from "../utils/address";

const member_group_map:any = {
  "global": 1,
  "guild": 2,
  "project": 3,
}

const referendumStatusMap:any = {
  "Ongoing": 0,
  "Approved": 1,
  "Rejected": 2,
}

const voteOpinionMap:any = {
  "YES": 1,
  "NO": 0,
}

export class Gov {
    public base: Client;
  
    constructor(c: Client) {
      this.base = c; 
    }

    // DAO 成员列表
    public async pending_referendum_list(dao_id: number): Promise<any[]> {
      // 构建请求
      const datas: any = await this.base.api!.query.weteeGov.publicProps(dao_id) ?? [];
      
      let results: any[] = [];
      for(let i=0;i<datas.length;i++){
        let itemh = datas[i].toHuman();
        let item = JSON.parse(JSON.stringify(datas[i]));
        let keys = Object.keys(item[3]);
        results.push({
          "index": item[0],
          "hash": item[1],
          "runtimeCall": itemh[2].section+"/"+itemh[2].method,
          "memberGroup": {
            "scope": member_group_map[keys[0]],
            "id": keys[0]=="global" ? 0 : item[3][keys[0]]
          },
          "account": ss58ToHex(item[4]),
        })
      }
      // console.log(JSON.parse(JSON.stringify(results)))
      return results;
    }

    // DAO 成员列表
    public async referendum_list(dao_id: number): Promise<any[]> {
      // 构建请求
      const datas: any = await this.base.api!.query.weteeGov.referendumInfoOf.entries(dao_id) ?? [];
      let results: any[] = [];
      // @ts-ignore
      datas.forEach(([key, data]) => {
        let item = data.toHuman();
        let keys = item.memberData=="GLOBAL"?["GLOBAL"]:Object.keys(item.memberData) ;
        results.push({
          "id": parseInt(item.id),
          "delay": parseInt(item.delay.replace(",","")),
          "hash": "",
          "memberGroup": {
            "scope": item.memberData=="GLOBAL"?1:member_group_map[keys[0].toLocaleLowerCase()],
            "id": keys[0].toLocaleLowerCase()=="global" ? 0 : parseInt(item.memberData[keys[0]].replace(",",""))
          },
          // "account": ss58ToHex(item[4]),
          "end": parseInt(item.end.replace(",","")) ,
          "proposal": "",
          "tally": {
            "yes": parseInt(item.tally.yes.replace(",","")),
            "no": parseInt(item.tally.no.replace(",","")),
          },
          "status": referendumStatusMap[item.status]
        })
      });
      return results;
    }

    public async votes_of_user(from: string,dao_id: number): Promise<any[]> {
      // 构建请求
      const datas: any = await this.base.api!.query.weteeGov.votesOf(hexToss58(from,undefined)) ?? [];
      
      let results: any[] = [];
      // @ts-ignore
      datas.forEach((data) => {
        let item = data.toHuman();
        results.push({
          "daoId": parseInt(item.daoId.replace(",","")),
          "pledge": parseInt(item.pledge.FungToken.replace(",","")),
          "opinion": voteOpinionMap[item.opinion],
          "voteWeight": parseInt(item.voteWeight.replace(",","")),
          "unlockBlock": parseInt(item.unlockBlock.replace(",","")),
          "referendumIndex": parseInt(item.referendumIndex.replace(",","")),
        })
      });
      return results;
    }

    public async start_referendum(
      from: string,
      dao_id: number,
      id: number,
    ): Promise<boolean> {
      const extensions = await web3Enable('DTIM');
      if (extensions.length === 0) {
        throw new Error('no extension');
      }
      const injector = await web3FromAddress(hexToss58(from,undefined));
      return new Promise<boolean>((ok,no)=>{
        this.base.api!.tx.weteeGov.startReferendum(
          dao_id,
          id
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

    public async run_proposal(
      from: string,
      dao_id: number,
      id: number,
    ): Promise<boolean> {
      const extensions = await web3Enable('DTIM');
      if (extensions.length === 0) {
        throw new Error('no extension');
      }
      const injector = await web3FromAddress(hexToss58(from,undefined));
      return new Promise<boolean>((ok,no)=>{
        this.base.api!.tx.weteeGov.runProposal(
          dao_id,
          id
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

    public async vote_for_referendum(
      from:string,
      daoId:number,
      index:number,
      vote:number,
      approve:boolean,
    ): Promise<boolean> {
      const extensions = await web3Enable('DTIM');
      if (extensions.length === 0) {
        throw new Error('no extension');
      }
      const injector = await web3FromAddress(hexToss58(from,undefined));
      let voteP = this.base.api!.createType("Pledge",{"FungToken":vote})
      let approveP = this.base.api!.createType("Opinion",approve?"YES":"NO")
      return new Promise<boolean>((ok,no)=>{
        this.base.api!.tx.weteeGov.voteForReferendum(
          daoId,
          index,
          voteP,
          approveP,
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
}
