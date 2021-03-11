"use strict";

import axios from "axios";
import { Notification } from "element-ui";

let config = {
  baseURL: "",
  timeout: 10 * 1000, // Timeout
};

const _axios = axios.create(config);

_axios.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    // if (store && store.state.token) {
    //   config.headers.common['Authorization'] = config.headers.token = store.state.token || ''
    // }
    config.headers["Content-Type"] = "application/json;charset=UTF-8";
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
_axios.interceptors.response.use(
  (response) => {
		const code = response.data.code;
    // Do something with response
    if (code !== 200 && code !== undefined) {
      Notification.warning({
        message: response.data.msg,
        title: "提示",
        type: "warning",
      });
    }
    return response.data;
  },
  (error) => {
    // Do something with response error
    Notification.warning({
      message: '服务出现异常，请稍后重试',
      title: "提示",
      type: "warning",
    });
    return Promise.reject(error);
  }
);
export default _axios;
