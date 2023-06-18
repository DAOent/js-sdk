import { ApiPromise, WsProvider } from "@polkadot/api";


export let clientMap: Map<number, Client> = new Map<number, Client>();

export class Client {
    index: number;
    api: ApiPromise | undefined;
    url: string[]

    constructor(_url: string[]) {
        console.log('Client constructor');
        this.url = _url;
        this.index = clientMap.keys.length;
        clientMap.set(clientMap.keys.length, this);
    }

    static from_index(i: number):Client {
        let c = clientMap.get(i);
        if(c==undefined){
            throw "client is not start";
        }
        return c!;
    }

    async start() {
        const wsProvider = new WsProvider(this.url);
        try {
            this.api = await ApiPromise.create({
                provider: wsProvider,
                types:{
                    "MemmberData":{
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
                    "Opinion":{
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
    
    weteeGovCall(daoId:number, ext:any, call:any ):any {
       let ps:any = {}
       ps[MemmberDataMap[ext.member.scope]] = ext.member.scope==1?null:ext.member.id;
       let memmberData = this.api!.createType("MemmberData",ps)
       return this.api!.tx.weteeGov.createPropose(daoId,memmberData,call,ext.amount)
    }
}

const MemmberDataMap:any={
    1:"GLOBAL",
    2:"GUILD",
    3:"PROJECT",
}
