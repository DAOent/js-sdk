import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { Client } from "../client";
import { hexToss58 } from "../utils/address";

export class Treasury {
    public base: Client;
  
    constructor(c: Client) {
        this.base = c; 
    }
  
    async proposals(orgId:number):Promise<any> {
        const datas:any = await this.base.api!.query.weteeTreasury.proposals.entries(orgId) ?? [];
        let results: any[] = [];
        // @ts-ignore
        datas.forEach(([key, data]) => {
            let item = data.toHuman();
            let ks = key.toHuman();
            item.dao_id = parseInt(ks[0])
            item.proposal_index = parseInt(ks[0])
            results.push(item)
        })
        return results;
    }

    async createTreasuryProposal(
         from:string,
         daoId: number,
         beneficiary:string,
         value: number,
    ) : Promise<number> {
        const extensions = await web3Enable('DTIM');
        if (extensions.length === 0) {
          throw new Error('no extension');
        }
        const injector = await web3FromAddress(hexToss58(from,undefined));
        return new Promise<number>((ok,no)=>{
            let id = 0;
            this.base.api!.tx.weteeTreasury.proposeSpend(daoId,value,hexToss58(beneficiary,undefined))
            .signAndSend(hexToss58(from,undefined), { signer: injector.signer }, ({events = [],status}) => {
            if (status.isInBlock) {
                events.forEach(({ event: { data, method, section }, phase }) => {
                console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                if(`${section}.${method}` == "weteeTreasury.Proposed"){
                    console.log(data.toHuman())
                    // @ts-ignore
                    id = parseInt(data.toHuman().proposalIndex);
                }
                console.log(data)
                if(`${section}.${method}` == "system.ExtrinsicSuccess"){
                    ok(id)
                }});
            } else if (status.isFinalized) {
                ok(id)
            }
            }).catch((error: any) => {
                no("transaction failed', "+error.toString())
            });
        })
    }

    public async gov_proposal(
        from:string,
        daoId:number,
        proposalId: number,
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
            this.base.api!.tx.weteeTreasury.govProposal(
                daoId,
                proposalId
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