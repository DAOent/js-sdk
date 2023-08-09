import { ApiPromise, WsProvider } from "@polkadot/api";


export let clientMap:Client[] = [];

export class Client {
    index: number;
    api: ApiPromise | undefined;
    url: string[]

    constructor(_url: string[]) {
        console.log('Client constructor');
        this.url = _url;
        this.index = clientMap.length;
        clientMap.push(this);
    }

    static from_index(i: number): Client {
        let c = clientMap[i];
        if (c == undefined) {
            throw "client is not start";
        }
        return c!;
    }

    async start() {
        console.log('Client start '+this.url);
        const wsProvider = new WsProvider(this.url);
        try {
            this.api = await ApiPromise.create({
                provider: wsProvider,
                types: {
                    "MemmberData": {
                        _enum: {
                            GLOBAL: null,
                            GUILD: 'u64',
                            PROJECT: 'u64',
                        }
                    },
                    "Pledge": {
                        _enum: {
                            "FungToken": 'u128',
                        }
                    },
                    "Opinion": {
                        _enum: [
                            "YES",
                            "NO",
                        ]
                    }
                }
            });
        } catch (err) {
            throw `connect failed`;
        }
    }

    async stop() {
        if (this.api != undefined) {
           await this.api.disconnect();
        }
        this.api = undefined;
    }

    weteeGovCall(daoId: number, ext: any, call: any): any {
        if(ext.runType==2){
            return this.api!.tx.weteeSudo.sudo(daoId,call);
        }
        let ps: any = {}
        ps[MemmberDataMap[ext.member.scope]] = ext.member.scope == 1 ? null : ext.member.id;
        let memmberData = this.api!.createType("MemmberData", ps)
        return this.api!.tx.weteeGov.createPropose(daoId, memmberData, call, ext.periodIndex)
    }
}

const MemmberDataMap: any = {
    1: "GLOBAL",
    2: "GUILD",
    3: "PROJECT",
}
