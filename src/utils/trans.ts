import { hexToU8a, u8aToString, hexToString } from "@polkadot/util";

export function tryHexToString(str: string) {
    if(!str.startsWith("0x")) {
        return str
    }
    return hexToString(str)
}