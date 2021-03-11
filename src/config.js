export const IS_DEBUG = true;
console.log('IS_DEBUG', IS_DEBUG);

const version = '1.1.3';
const appkey = IS_DEBUG ?
  "7e3aa05dd28eca88aebac6697635ccb8" :
  "15072b795aa21f522561adfca1c1d78b";

export const BASE_CONFIG = () => {
  return {
    sceneConfig: {
      scriptSrc: `//map${IS_DEBUG ? '-test' : ''}.airlook.com/v1/sdk/amapmobile?v=${version}&appKey=${appkey}`,
      appkey: appkey,
      longitude: "109.58060853821272",
      latitude: "19.51846651500485"
    },
  }
}