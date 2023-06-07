import { WsProvider, ApiPromise } from "@polkadot/api";
import { subscribeMessage, getNetworkConst, getNetworkProperties } from "./hander/setting";
import keyring from "./hander/keyring";
import account from "./hander/account";
import { genLinks } from "./utils/config/config";


// console.log will send message to MsgChannel to App
function send(path: string, data: any) {
  console.log(JSON.stringify({ path, data }));
}
send("log", "main js loaded");
(<any>window).send = send;

async function connectAll(nodes: string[]) {
  return Promise.race(nodes.map((node) => connect([node])));
}

/**
 * connect to a specific node.
 *
 * @param {string} nodeEndpoint
 */
async function connect(nodes: string[]) {
  (<any>window).api = undefined;

  return new Promise(async (resolve, reject) => {
    const wsProvider = new WsProvider(nodes);
    try {
      const res = await ApiPromise.create({
        provider: wsProvider,
      });
      if (!(<any>window).api) {
        (<any>window).api = res;
        // console.log(res);
        const url = (<any>res)._options.provider.__internal__endpoints[0];
        send("log", `${url} wss connected success`);
        resolve(url);
      } else {
        res.disconnect();
        const url = (<any>res)._options.provider.__internal__endpoints[0];
        send("log", `${url} wss success and disconnected`);
        resolve(url);
      }
    } catch (err) {
      send("log", `connect failed`);
      wsProvider.disconnect();
      resolve(null);
    }
  });
}

const test = async () => {
  // const props = await api.rpc.system.properties();
  // send("log", props);
};

const settings = {
  test,
  connect,
  connectAll,
  subscribeMessage,
  getNetworkConst,
  getNetworkProperties,
  // generate external links to polkascan/subscan/polkassembly...
  genLinks,
};

(<any>window).settings = settings;
(<any>window).keyring = keyring;
(<any>window).account = account;

export default settings;
