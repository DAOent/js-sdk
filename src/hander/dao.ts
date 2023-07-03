import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { hexToU8a, u8aToString } from "@polkadot/util";
import { Client } from "../client";
import { hexToss58, ss58ToHex } from "../utils/address";
import { tryHexToString } from "../utils/trans";

export class DAO {
  public base: Client;

  constructor(c: Client) {
    this.base = c;
  }

  // 下一个 DAO ID
  public async next_dao_id(): Promise<number> {
    // 构建请求
    const result: any = await this.base.api!.query.WeteeDAO.next_dao_id() ?? 5000;
    return result;
  }

  // 创建 DAO
  public async create_dao(
    from: string,
    name: string,
    purpose: string,
    metaData: string,
    desc: string,
    imApi: string,
    bg: string,
    logo: string,
    img: string,
    homeUrl: string,
  ): Promise<void> {
    const injector = await web3FromAddress(hexToss58(from, undefined));
    return new Promise<void>((ok, no) => {
      this.base.api!.tx.weteeOrg.createOrg(
        from,
        name,
        purpose,
        metaData,
        desc,
        imApi,
        bg,
        logo,
        img,
        homeUrl,
      ).signAndSend(hexToss58(from, undefined), { signer: injector.signer }, ({ events = [], status }) => {
        if (status.isInBlock) {
          events.forEach(({ event: { data, method, section }, phase }) => {
            console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
            if (`${section}.${method}` == "system.ExtrinsicSuccess") {
              ok()
            }
          });
        } else if (status.isFinalized) {
          ok()
        }
      }).catch((error: any) => {
        no("transaction failed', " + error.toString())
      });
    })
  }

  // DAO 成员列表
  public async member_list(dao_id: number): Promise<string[]> {
    // 构建请求
    const result: any = await this.base.api!.query.weteeOrg.members(dao_id) ?? [];
    return result.toHuman().map((v: string) => ss58ToHex(v));
  }

  // DAO 成员积分
  public async member_point(
    dao_id: number,
    member: string
  ): Promise<number> {
    // 构建请求
    const result: any = await this.base.api!.query.weteeOrg.memberPoint(dao_id, hexToss58(member, undefined))
      ?? 0;
    return parseInt(result.toString().replace(",", ""));
  }

  // DAO 信息
  public async dao_info(
    dao_id: number
  ): Promise<any> {
    // 构建请求
    let result: any = await this.base.api!.query.weteeOrg.daos(dao_id);
    let item = result.toHuman();
    let data: any = {};
    data.creator = ss58ToHex(item.creator)
    data.daoAccountId = ss58ToHex(item.daoAccountId)
    data.name = tryHexToString(item.name)
    data.desc = tryHexToString(item.desc)
    data.startBlock = parseInt(item.startBlock.replace(",", ""))
    data.purpose = item.purpose
    data.metaData = item.metaData
    data.status = 0
    data.id = dao_id
    data.imApi = item.imApi
    data.bg = item.bg
    data.logo = item.logo
    data.img = item.img
    data.homeUrl = item.homeUrl
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
    const injector = await web3FromAddress(hexToss58(from, undefined));
    return new Promise<boolean>((ok, no) => {
      this.base.api!.tx.weteeAsset.joinRequest(
        dao_id,
        share_expect,
        value
      ).signAndSend(hexToss58(from, undefined), { signer: injector.signer }, ({ events = [], status }) => {
        if (status.isInBlock) {
          events.forEach(({ event: { data, method, section }, phase }) => {
            console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
            if (`${section}.${method}` == "system.ExtrinsicSuccess") {
              ok(true)
            }
          });
        } else if (status.isFinalized) {
          ok(true)
        }
      }).catch((error: any) => {
        no("transaction failed', " + error.toString())
      });
    })
  }

  // DAO 里程碑
  public async roadmap_list(
    dao_id: number,
    year: number,
  ): Promise<any[]> {
    let results: any[] = [];
    for (let quarter = 1; quarter < 5; quarter++) {
      let tasks: any = await this.base.api!.query.weteeOrg.roadMaps(dao_id, year * 100 + quarter);
      results.push({
        "year": year,
        "quarter": quarter,
        "tasks": tasks.map((v: any) => {
          var j = JSON.parse(JSON.stringify(v))
          var transTag = [];
          var tags = hexToU8a(j.tags);
          for (var i = 0; i < tags.byteLength; i++) {
            transTag.push({ value: tags[i] })
          }
          return {
            id: j.id,
            name: tryHexToString(j.name),
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
    tags: number[] | undefined,
  ): Promise<boolean> {
    const extensions = await web3Enable('DTIM');
    if (extensions.length === 0) {
      throw new Error('no extension');
    }
    const injector = await web3FromAddress(hexToss58(from, undefined));
    return new Promise<boolean>((ok, no) => {
      this.base.api!.tx.weteeAsset.joinRequest(
        dao_id,
        roadmap_id,
        name,
        priority,
        tags
      ).signAndSend(hexToss58(from, undefined), { signer: injector.signer }, ({ events = [], status }) => {
        if (status.isInBlock) {
          events.forEach(({ event: { data, method, section }, phase }) => {
            console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
            if (`${section}.${method}` == "system.ExtrinsicSuccess") {
              ok(true)
            }
          });
        } else if (status.isFinalized) {
          ok(true)
        }
      }).catch((error: any) => {
        no("transaction failed', " + error.toString())
      });
    })
  }

  // DAO 发行货币总量
  async total_issuance(dao_id: number): Promise<string> {
    let result: any = await this.base.api!.query.tokens.totalIssuance(dao_id);
    return result.toString();
  }

  // DAO 成员列表
  public async daos(): Promise<any[]> {
    // 构建请求
    const datas: any = await this.base.api!.query.weteeOrg.daos.entries() ?? [];
    const results: any[] = [];
    // @ts-ignore
    datas.forEach(([key, data]) => {
      console.log(key.toHuman(), data.toHuman());
      let item = data.toHuman();
      let tdata: any = {};
      tdata.creator = ss58ToHex(item.creator)
      tdata.daoAccountId = ss58ToHex(item.daoAccountId)
      tdata.name = tryHexToString(item.name)
      tdata.desc = tryHexToString(item.name)
      tdata.startBlock = parseInt(item.startBlock.replace(",", ""))
      tdata.purpose = item.purpose
      tdata.metaData = item.metaData
      tdata.status = 0
      tdata.id = parseInt(item.id.replace(",", ""))
      tdata.imApi = item.imApi
      tdata.bg = item.bg
      tdata.logo = item.logo
      tdata.img = item.img
      tdata.homeUrl = item.homeUrl
      tdata.chainUnit = 1_000_000_000_000

      results.push(tdata)
    })
    return results;
  }

  public async appHubs(): Promise<any[]> {
    // 构建请求
    const datas: any = await this.base.api!.query.weteeOrg.appHubs.entries() ?? [];
    const results: any[] = [];
    // @ts-ignore
    datas.forEach(([key, data]) => {
      let item = data.toHuman();
      let tdata: any = {};
      tdata.id = parseInt(item.id.replace(",", ""))
      tdata.creator = ss58ToHex(item.creator)
      tdata.name = tryHexToString(item.name)
      tdata.desc = tryHexToString(item.desc)
      tdata.url = tryHexToString(item.url)
      tdata.icon = item.icon
      tdata.status = 0

      results.push(tdata)
    })
    console.log("appHubs", results)
    return results;
  }

  public async orgApps(dao_id: number): Promise<any[]> {
    // 构建请求
    const datas: any = await this.base.api!.query.weteeOrg.orgApps(dao_id) ?? [];

    const results: any[] = [];
    // @ts-ignore
    for (let i = 0; i < datas.length; i++) {
      let item = datas[i].toHuman();
      let tdata: any = {};
      tdata.id = parseInt(item.id.replace(",", ""))
      tdata.appId = parseInt(item.appId.replace(",", ""))
      tdata.name = tryHexToString(item.name)
      tdata.desc = tryHexToString(item.name)
      tdata.startBlock = parseInt(item.startBlock.replace(",", ""))
      tdata.icon = item.icon
      tdata.url = tryHexToString(item.url)
      tdata.status = 0

      results.push(tdata)
    }
    return results;
  }

  public async org_integrate_app(from: string, daoId: number, appId: number, ext: any): Promise<boolean> {
    const extensions = await web3Enable('DTIM');
    if (extensions.length === 0) {
      throw new Error('no extension');
    }
    const injector = await web3FromAddress(hexToss58(from, undefined));
    return new Promise<boolean>((ok, no) => {
      this.base.weteeGovCall(
        daoId,
        ext,
        this.base.api!.tx.weteeOrg.orgIntegrateApp(
          daoId,
          appId,
        )
      ).signAndSend(hexToss58(from, undefined), { signer: injector.signer }, ({ events = [], status }: any) => {
        if (status.isInBlock) {
          events.forEach(({ event: { data, method, section }, phase }: any) => {
            console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
            if (`${section}.${method}` == "system.ExtrinsicSuccess") {
              ok(true)
            }
          });
        } else if (status.isFinalized) {
          ok(true)
        }
      }).catch((error: any) => {
        console.log(error)
        no("transaction failed', " + error.toString())
      });
    })
  }
}