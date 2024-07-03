import { boot } from 'quasar/wrappers';
import { Notify, LocalStorage } from 'quasar';
import { useBaseStore } from 'stores/base';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create();

export default boot(({ app, router, store }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  // const { fullPath } = router.currentRoute;

  const baseStore = useBaseStore(store);

  // console.log(baseStore.userToken);

  api.defaults.baseURL = baseStore.hostUri;
  // api.defaults.withCredentials = true; // 携带cookie

  // http request 拦截器
  api.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // console.log(baseStore.userToken);

      if (baseStore.userToken) {
        //判断token是否存在
        config.headers.Authorization = `Bearer ${baseStore.userToken}`;
      }
      return config;
    },
    (err) => {
      return Promise.reject(err);
    }
  );

  // http response 拦截器
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      const { code, data, message } = response.data;
      if (code !== 0) {
        Notify.create({
          type: 'negative',
          message,
          position: 'top',
        });
        throw new Error(message);
      } else {
        return data;
      }
    },
    (error) => {
      if (error.response) {
        const { status, data } = error.response;

        const message = `${status} ${data.message || ''}`;

        switch (status) {
          case 401:
            // 401 清除token信息并跳转到登录页面
            // store.commit("base/AUTH_LOGOUT");
            Notify.create({
              type: 'negative',
              message: '身份过期，重新登录',
            });

            //
            LocalStorage.clear();

            router.replace({
              path: '/login',
              query: { redirect: '/' },
            });

            // window.location.href = `${window.location.origin}/#/login`;

            break;
          case 400:
            Notify.create({
              type: 'warning',
              message,
            });
            break;

          case 403:
            Notify.create({
              type: 'warning',
              message,
            });
            break;

          case 404:
            Notify.create({
              type: 'warning',
              message,
            });
            break;

          case 200:
            Notify.create({
              type: 'warning',
              message,
            });
            break;

          case 201:
            Notify.create({
              type: 'warning',
              message,
            });
            break;

          case 500:
            // console.log(data);
            Notify.create({
              type: 'negative',
              position: 'top',
              message,
            });
            break;

          default:
            break;
        }
      }

      return Promise.reject(error);
    }
  );

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { axios, api };
