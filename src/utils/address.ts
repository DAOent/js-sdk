import { hexToU8a, u8aToHex, hexToString } from "@polkadot/util";
import keyring from "../hander/keyring";


export  function hexToss58 (addr:string,prefix:number|undefined):string {
    return keyring.globlekeyring.encodeAddress(hexToU8a(addr),prefix??42);
}

export  function ss58ToHex (addr:string):string {
    return u8aToHex(keyring.globlekeyring.decodeAddress(addr));
}