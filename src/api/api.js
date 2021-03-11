import axios from './axios';

export const getHeightBycoord = (params) => axios.get("//map-test.airlook.com/v1/data/altitude", { params })