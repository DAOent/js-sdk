import { hexToU8a, u8aToHex, hexToString } from "@polkadot/util";
import keyring from "../hander/keyring";


export  function hexToss58 (addr:string):string {
    return keyring.globlekeyring.encodeAddress(hexToU8a(addr), 42);
}