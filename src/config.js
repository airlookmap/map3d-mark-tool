const DEBUG = ['dev', 'pro'][0];

const version = '1.1.4';
const appkey = DEBUG === 'dev' ?
  "7e3aa05dd28eca88aebac6697635ccb8" :
  "15072b795aa21f522561adfca1c1d78b";

export const BASE_CONFIG = () => {
  return {
    sceneConfig: {
      scriptSrc: `//map${DEBUG === 'dev' ? '-test' : ''}.airlook.com/v1/sdk/amapmobile?v=${version}&appKey=${appkey}`,
      appkey: appkey,
      longitude: "109.58060853821272",
      latitude: "19.51846651500485"
    },
  }
}