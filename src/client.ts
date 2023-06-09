import { ApiPromise } from "@polkadot/api";


export let clientMap = new Map<number, ApiPromise | undefined>();

export class Client {
    index: number | undefined;
    constructor(i: number | undefined) {
        console.log('Client constructor');
        if (i === undefined) {
            clientMap.set(clientMap.keys.length, undefined);
            i = clientMap.keys.length;
        }
        this.index = i;
    }

    static from_index(i: number) {
        return new Client(i);
    }

    async start(){
        if(this.index === undefined) throw new Error('Client index is undefined');
        console.log('Client start');
        clientMap.set(this.index!, await ApiPromise.create());
    }
}

