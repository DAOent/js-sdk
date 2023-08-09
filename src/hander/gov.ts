import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { hexToU8a, u8aToString } from "@polkadot/util";
import { Client } from "../client";
import { hexToss58, ss58ToHex } from "../utils/address";
import { strToInt, tryHexToString } from "../utils/trans";

const member_group_map:any = {
  "GLOBAL": 1,
  "GUILD": 2,
  "PROJECT": 3,
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
        let item = datas[i].toHuman();
        let keys = typeof(item[3])=='string'?["GLOBAL"]:Object.keys(item[3]);
        
        console.log(item)
        results.push({
          "index": strToInt(item[0]),
          "hash": item[1],
          "runtimeCall": JSON.stringify(item[2]),
          "memberGroup": {
            "scope": member_group_map[keys[0]],
            "id": keys[0]=="GLOBAL" ? 0 : strToInt(item[3][keys[0]])
          },
          "account": ss58ToHex(item[4]),
          "period": {
            "name": item[5]["name"],
            "preparePeriod": strToInt(item[5]["preparePeriod"]),
            "maxDeciding": strToInt(item[5]["maxDeciding"]),
            "confirmPeriod": strToInt(item[5]["confirmPeriod"]),
            "decisionPeriod": strToInt(item[5]["decisionPeriod"]),
            "minEnactmentPeriod": strToInt(item[5]["minEnactmentPeriod"]),
            "decisionDeposit": strToInt(item[5]["decisionDeposit"]),
            "minApproval": strToInt(item[5]["minApproval"]),
            "minSupport": strToInt(item[5]["minSupport"]),
          },
        })
      }
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
        console.log(item)
        results.push({
          "id": parseInt(item.id),
          "delay": 0,
          "hash": "",
          "memberGroup": {
            "scope": item.memberData=="GLOBAL"?1:member_group_map[keys[0].toLocaleLowerCase()],
            "id": keys[0].toLocaleLowerCase()=="global" ? 0 : parseInt(item.memberData[keys[0]].replace(",",""))
          },
          // "account": ss58ToHex(item[4]),
          "end": 0,
          "proposal": JSON.stringify(item.proposal),
          "tally": {
            "yes": parseInt(item.tally.yes.replace(",","")),
            "no": parseInt(item.tally.no.replace(",","")),
          },
          "status": referendumStatusMap[item.status],
          "period": {
            "name": item["period"]["name"],
            "preparePeriod": strToInt(item["period"]["preparePeriod"]),
            "maxDeciding": strToInt(item["period"]["maxDeciding"]),
            "confirmPeriod": strToInt(item["period"]["confirmPeriod"]),
            "decisionPeriod": strToInt(item["period"]["decisionPeriod"]),
            "minEnactmentPeriod": strToInt(item["period"]["minEnactmentPeriod"]),
            "decisionDeposit": strToInt(item["period"]["decisionDeposit"]),
            "minApproval": strToInt(item["period"]["minApproval"]),
            "minSupport": strToInt(item["period"]["minSupport"]),
          },
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
      eposit: number,
    ): Promise<boolean> {
      const extensions = await web3Enable('DTIM');
      if (extensions.length === 0) {
        throw new Error('no extension');
      }
      const injector = await web3FromAddress(hexToss58(from,undefined));
      return new Promise<boolean>((ok,no)=>{
        this.base.api!.tx.weteeGov.startReferendum(
          dao_id,
          id,
          eposit
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

    public async periods(orgId:number): Promise<any[]> {
      // 构建请求
      const datas: any = await this.base.api!.query.weteeGov.periods(orgId) ?? [];
      console.log(datas.toHuman())
      let items = datas.toHuman().map((v:any)=>{
        return {
          "name": tryHexToString(v.name),
          "preparePeriod": strToInt(v.preparePeriod),
          "maxDeciding": strToInt(v.maxDeciding),
          "confirmPeriod": strToInt(v.confirmPeriod),
          "decisionPeriod": strToInt(v.decisionPeriod),
          "minEnactmentPeriod": strToInt(v.minEnactmentPeriod),
          "decisionDeposit": strToInt(v.decisionDeposit),
          "minApproval": strToInt(v.minApproval),
          "minSupport": strToInt(v.minSupport),
        }
      })
      return items;
    }
}
