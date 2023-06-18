import { queryAccounts, sign } from "./hander/account";
import { Client } from "./client";
import { Balance } from "./hander/balance";
import { DAO } from "./hander/dao";
import { hexToss58 } from "./utils/address";
import { Gov } from "./hander/gov";
import { Project } from "./hander/project";
import { Guild } from "./hander/guild";

(<any>window).queryAccounts = async ()=>{
  return JSON.stringify(await queryAccounts());
};

(<any>window).signFromAddress = sign;

(<any>window).connect = async (url: string) => {
  let client = new Client([url])
  console.log(client.index)
  return client.index;
}

(<any>window).startClient = async (i: number) => {
  let client = Client.from_index(i);
  await client?.start()
}

(<any>window).pingClient = (i: number) => {
  let client = Client.from_index(i);
  if(client.api==null){
    throw "client is not start"
  }
  client.api!.genesisHash.toHex()
}

(<any>window).getBlockNumber = async (client_index: number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  const lastHeader = await client.api!.rpc.chain.getHeader();
  return lastHeader.number.toString()
}

(<any>window).nativeBalance = async (client_index: number,address: string) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let balance =  new Balance(client);
  let data =  await balance.balance(address);
  return JSON.stringify(data);
}

(<any>window).daoInfo = async (client_index: number,daoid: number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let balance =  new DAO(client);
  let data =  await balance.dao_info(daoid);
  return JSON.stringify(data);
}

(<any>window).daoMemberPoint = async (client:number,daoId:number,member:string) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let balance =  new DAO(c);
  return await balance.member_point(daoId,member);
}

(<any>window).daoRoadmap = async (client_index: number, daoid: number, year: number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let dao =  new DAO(client);
  let data =  await dao.roadmap_list(daoid,year);
  return JSON.stringify(data);
}

(<any>window).joinDao = async (from: string,client_index: number,daoId:number,shareExpect:number,value:number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let dao =  new DAO(client);
  let data =  await dao.join(from,daoId,shareExpect,value);
  return JSON.stringify(data);
}

(<any>window).daoCreateRoadmapTask = async (
     from: string,
     client_index: number,
     daoId: number,
     roadmapId: number,
     name: string,
     priority: number,
     tags: number[],
) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let dao =  new DAO(client);
  let data =  await dao.create_task(from,daoId,roadmapId,name,priority,tags);
  return data;
}


(<any>window).ss58 = (address: string,prefix: number) => {
  return hexToss58(address,prefix)
}

(<any>window).daoTotalIssuance = async (client_index: number,daoid: number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let balance =  new DAO(client);
  let data =  await balance.total_issuance(daoid);
  return data;
}

(<any>window).daoGovPendingReferendumList = async (client_index: number,daoid: number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let gov =  new Gov(client);
  let data =  await gov.pending_referendum_list(daoid);
  return JSON.stringify(data);
}

(<any>window).daoGovReferendumList = async (client_index: number,daoid: number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let gov =  new Gov(client);
  let data =  await gov.referendum_list(daoid);
  return JSON.stringify(data);
}

(<any>window).daoProjects = async (client_index: number,daoid: number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let p =  new Project(client);
  let data =  await p.project_list(daoid);
  return JSON.stringify(data);
}

(<any>window).daoProjectMemberList = async (client_index: number,daoid: number,project_id:number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let p =  new Project(client);
  let data =  await p.member_list(daoid,project_id);
  return data;
}

(<any>window).daoProjectTaskList = async (client_index: number,project_id:number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let p =  new Project(client);
  let data =  await p.task_list(project_id);
  return JSON.stringify(data);
}

(<any>window).daoGuilds = async (client_index: number,daoid: number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let p =  new Guild(client);
  let data =  await p.guild_list(daoid);
  return JSON.stringify(data);
}

(<any>window).daoGuildMemeberList = async (client_index: number,daoid: number,g_id:number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let p =  new Guild(client);
  let data =  await p.member_list(daoid,g_id);
  return data;
}

(<any>window).daoMemebers = async (client:number,daoId:number) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new DAO(c);
  return  await dao.member_list(daoId);
}

(<any>window).createProject = async (
  from:string,
  client:number,
  daoId:number,
  name:string,
  desc:string,
  ext:any,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Project(c);
  return await dao.create_project(from,daoId,name,desc,ext)
}

(<any>window).createGuild = async (
  from:string,
  client:number,
  daoId:number,
  name:string,
  desc:string,
  ext:any,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Guild(c);
  return await dao.create_guild(from,daoId,name,desc,ext)
}

(<any>window).daoGovStartReferendum  = async (
  from:string, client:number, daoId:number, index:number
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let gov =  new Gov(c);
  let data =  await gov.start_referendum(from,daoId,index);
  return data;
}

(<any>window).daoGovVoteForReferendum = async (
  from:string,
  client_index:number,
  daoId:number,
  index:number,
  vote:number,
  approve:boolean,
) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let gov =  new Gov(client);
  let data =  await gov.vote_for_referendum(
    from,
    daoId,
    index,
    vote,
    approve,
  );
  return data;
}

(<any>window).daoGovVotesOfUser = async (from:string, client_index: number,daoid: number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let gov =  new Gov(client);
  let data =  await gov.votes_of_user(from,daoid);
  return JSON.stringify(data);
}

(<any>window).daoGovRunProposal = async (from:string, client_index: number,daoid: number,id: number) => {
  let client = Client.from_index(client_index);
  if(client.api==null){
    throw "client is not start"
  }
  let gov =  new Gov(client);
  let data =  await gov.run_proposal(from,daoid,id);
  return data;
}


(<any>window).daoProjectCreateTask = async (
  from:string,
  client:number,
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
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Project(c);
  return await dao.create_task(
    from,
    daoId,
    projectId,
    name,
    desc,
    priority,
    point,
    assignees,
    reviewers,
    skills,
    maxAssignee,
    amount,
  )
}

(<any>window).daoProjectStartTask = async (
  from:string,
  client:number,
  daoId:number,
  projectId:number,
  taskId:number,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Project(c);
  return await dao.start_task(from,daoId,projectId,taskId)
}

(<any>window).daoProjectRequestReview = async (
  from:string,
  client:number,
  daoId:number,
  projectId:number,
  taskId:number,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Project(c);
  return await dao.start_task(from,daoId,projectId,taskId)
}

(<any>window).daoProjectTaskDone = async (
  from:string,
  client:number,
  daoId:number,
  projectId:number,
  taskId:number,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Project(c);
  return await dao.task_done(from,daoId,projectId,taskId)
}

(<any>window).daoProjectJoinTask = async (
  from:string,
  client:number,
  daoId:number,
  projectId:number,
  taskId:number,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Project(c);
  return await dao.join_task(from,daoId,projectId,taskId)
}

(<any>window).daoProjectLeaveTask = async (
  from:string,
  client:number,
  daoId:number,
  projectId:number,
  taskId:number,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Project(c);
  return await dao.leave_task(from,daoId,projectId,taskId)
}

(<any>window).daoProjectJoinTaskReview = async (
  from:string,
  client:number,
  daoId:number,
  projectId:number,
  taskId:number,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Project(c);
  return await dao.join_task_review(from,daoId,projectId,taskId)
}

(<any>window).daoProjectLeaveTaskReview = async (
  from:string,
  client:number,
  daoId:number,
  projectId:number,
  taskId:number,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Project(c);
  return await dao.leave_task_review(from,daoId,projectId,taskId)
}

(<any>window).daoProjectMakeReview = async (
  from:string,
  client:number,
  daoId:number,
  projectId:number,
  taskId:number,
  approve:boolean,
  meta:string,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Project(c);
  return await dao.make_review(
    from,
    daoId,
    projectId,
    taskId,
    approve,
    meta,
  )
}

(<any>window).daoProjectJoinRequest = async (
  from:string,
  client:number,
  daoId:number,
  projectId:number,
  ext:any,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Project(c);
  return await dao.project_join_request(
    from,
    daoId,
    projectId,
    ext,
  )
}

(<any>window).daoApplyProjectFunds = async (
  from:string,
  client:number,
  daoId:number,
  projectId:number,
  amount:number,
  ext:any,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Project(c);
  return await dao.apply_project_funds(
    from,
    daoId,
    projectId,
    amount,
    ext,
  )
}


(<any>window).daoGuildJoinRequest = async (
  from:string,
  client:number,
  daoId:number,
  gid:number,
  ext:any,
) => {
  let c = Client.from_index(client);
  if(c.api==null){
    throw "client is not start"
  }
  let dao =  new Guild(c);
  return await dao.guild_join_request(
    from,
    daoId,
    gid,
    ext,
  )
}

// daoProjectJoinRequestWithRootFunc

// daoApplyProjectFundsFunc