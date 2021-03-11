import axios from './axios';
import { IS_DEBUG } from '../config';

export const getHeightBycoord = (params) => axios.get(`//map${IS_DEBUG ? '-test' : ''}.airlook.com/v1/data/altitude`, { params });