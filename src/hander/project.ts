import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { hexToU8a, u8aToString, hexToString } from "@polkadot/util";
import { Client } from "../client";
import { hexToss58, ss58ToHex } from "../utils/address";

export class Project {
    public base: Client;
  
    constructor(c: Client) {
      this.base = c; 
    }

    // DAO 成员列表
    public async project_list(dao_id: number): Promise<any[]> {
      // 构建请求
      const datas: any = await this.base.api!.query.weteeProject.daoProjects(dao_id) ?? [];
      let results: any[] = [];

      for(let i=0;i<datas.length;i++){
        let item = JSON.parse(JSON.stringify(datas[i]));
        results.push({
            "id": item.id,
            "name": hexToString(item.name),
            "daoAccountId": item.daoAccountId,
            "description": hexToString(item.description),
            "creator": ss58ToHex(item.creator),
            "status": item.status=="Active"?1:0,
        })
      }
      return results;
    }

    // DAO 成员列表
    public async member_list(dao_id: number,project_id:number): Promise<any[]> {
      // 构建请求
      const result: any = await this.base.api!.query.weteeOrg.projectMembers(dao_id,project_id) ?? [];
      return result.toHuman().map((v:string)=>ss58ToHex(v));
    }

    // DAO 任务列表
    public async task_list(project_id:number): Promise<any[]> {
       // 构建请求
       const datas: any = await this.base.api!.query.weteeProject.tasks(project_id) ?? [];
       let results: any[] = [];
       for(let i=0;i<datas.length;i++){
          let item = datas[i].toHuman()
          var transSkills = [];
          var skills = hexToU8a(item.skills);
          for (let i = 0; i < skills.byteLength; i++) {
            transSkills.push( {value:skills[i]})
          }
          results.push({
            id: parseInt(item.id),
            name: item.name,
            description: item.description,
            point: parseInt(item.point),
            priority: parseInt(item.priority),
            projectId: parseInt(item.projectId),
            creator: item.creator,
            rewards: item.rewards.map((v:any)=>{
                let jv = {
                    "assetId": parseInt(v[0]),
                    "amount": parseInt(v[1])
                }
                return jv
            }),
            maxAssignee: parseInt(item.maxAssignee),
            assignees: item.assignees,
            reviewers: item.reviewers,
            skills: transSkills,
            status: taskStatusMap[item.status],
          })
       }
       return results;
    }

    public async create_project(
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
            this.base.api!.tx.weteeProject.createProject(
                daoId,
                name,
                desc,
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

    public async create_task(
        from:string,
        daoId:number,
        projectId:number,
        name:string,
        desc:string,
        priority:number,
        point:number,
        assignees:string[],
        reviewers:string[],
        skills:number[],
        maxAssignee:number,
        amount:number,
    ):Promise<boolean>{
        const extensions = await web3Enable('DTIM');
        if (extensions.length === 0) {
          throw new Error('no extension');
        }
        const injector = await web3FromAddress(hexToss58(from,undefined));
        return new Promise<boolean>((ok,no)=>{
          this.base.api!.tx.weteeProject.createTask(
            daoId,
            projectId,
            name,
            desc,
            point,
            priority,
            maxAssignee,
            skills,
            assignees,
            reviewers,
            amount,
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

    public async start_task(
        from:string,
        daoId:number,
        projectId:number,
        taskId:number,
    ):Promise<boolean>{
        const extensions = await web3Enable('DTIM');
        if (extensions.length === 0) {
          throw new Error('no extension');
        }
        const injector = await web3FromAddress(hexToss58(from,undefined));
        return new Promise<boolean>((ok,no)=>{
          this.base.api!.tx.weteeProject.startTask(
            daoId,
            projectId,
            taskId,
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

    public async request_review(
        from:string,
        daoId:number,
        projectId:number,
        taskId:number,
    ):Promise<boolean>{
        const extensions = await web3Enable('DTIM');
        if (extensions.length === 0) {
          throw new Error('no extension');
        }
        const injector = await web3FromAddress(hexToss58(from,undefined));
        return new Promise<boolean>((ok,no)=>{
          this.base.api!.tx.weteeProject.requestReview(
            daoId,
            projectId,
            taskId,
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

    public async task_done(
        from:string,
        daoId:number,
        projectId:number,
        taskId:number,
    ):Promise<boolean>{
        const extensions = await web3Enable('DTIM');
        if (extensions.length === 0) {
          throw new Error('no extension');
        }
        const injector = await web3FromAddress(hexToss58(from,undefined));
        return new Promise<boolean>((ok,no)=>{
          this.base.api!.tx.weteeProject.taskDone(
            daoId,
            projectId,
            taskId,
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

    public async join_task(
        from:string,
        daoId:number,
        projectId:number,
        taskId:number,
    ):Promise<boolean>{
        const extensions = await web3Enable('DTIM');
        if (extensions.length === 0) {
          throw new Error('no extension');
        }
        const injector = await web3FromAddress(hexToss58(from,undefined));
        return new Promise<boolean>((ok,no)=>{
          this.base.api!.tx.weteeProject.joinTask(
            daoId,
            projectId,
            taskId,
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

    public async leave_task(
        from:string,
        daoId:number,
        projectId:number,
        taskId:number,
    ):Promise<boolean>{
        const extensions = await web3Enable('DTIM');
        if (extensions.length === 0) {
          throw new Error('no extension');
        }
        const injector = await web3FromAddress(hexToss58(from,undefined));
        return new Promise<boolean>((ok,no)=>{
          this.base.api!.tx.weteeProject.leaveTask(
            daoId,
            projectId,
            taskId,
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

    public async join_task_review(
        from:string,
        daoId:number,
        projectId:number,
        taskId:number,
    ):Promise<boolean>{
        const extensions = await web3Enable('DTIM');
        if (extensions.length === 0) {
          throw new Error('no extension');
        }
        const injector = await web3FromAddress(hexToss58(from,undefined));
        return new Promise<boolean>((ok,no)=>{
          this.base.api!.tx.weteeProject.joinTaskReview(
            daoId,
            projectId,
            taskId,
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

    public async leave_task_review(
        from:string,
        daoId:number,
        projectId:number,
        taskId:number,
    ):Promise<boolean>{
        const extensions = await web3Enable('DTIM');
        if (extensions.length === 0) {
          throw new Error('no extension');
        }
        const injector = await web3FromAddress(hexToss58(from,undefined));
        return new Promise<boolean>((ok,no)=>{
          this.base.api!.tx.weteeProject.leaveTaskReview(
            daoId,
            projectId,
            taskId,
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

    public async make_review(
        from:string,
        daoId:number,
        projectId:number,
        taskId:number,
        approve:boolean,
        meta:string,
    ):Promise<boolean>{
        const extensions = await web3Enable('DTIM');
        if (extensions.length === 0) {
          throw new Error('no extension');
        }
        const injector = await web3FromAddress(hexToss58(from,undefined));
        let approveP = this.base.api!.createType("Opinion",approve?"YES":"NO")
        return new Promise<boolean>((ok,no)=>{
          this.base.api!.tx.weteeProject.makeReview(
            daoId,
            projectId,
            taskId,
            approveP,
            meta,
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

    public async project_join_request(
        from:string,
        daoId:number,
        rojectId:number,
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
            this.base.api!.tx.weteeProject.projectJoinRequest(
                daoId,
                rojectId,
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


    public async apply_project_funds(
        from:string,
        daoId:number,
        projectId:number,
        amount:number,
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
            this.base.api!.tx.weteeProject.applyProjectFunds(
                daoId,
                projectId,
                amount
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

const taskStatusMap:any = {
    "ToDo": 0,
    "InProgress": 1,
    "InReview":2,
    "Done": 3,
}