import { defineStore } from 'pinia';
import { date, LocalStorage } from 'quasar';
import pkg from '../../package.json';

export const useBaseStore = defineStore('base', {
  //存储一些应用的基本信息，如应用名称、版本号、版权信息、主机地址等。通过从package.json和其他变量中获取到的值进行初始化。
  state: () => {
    const { productName, version } = pkg;

    const dt = Date.now();
    const copyYear = date.formatDate(dt, 'YYYY');

    const appName = productName || 'APP';
    const appVersion = `v${version}`;
    const appPredata: any = {};

    const copyright = `@${copyYear} ${productName}, v${version}`;

    // console.log('curLocale', curLocale)
    // console.log('process.env',process.env)

    const hostUri = process.env.PROD
      ? 'https://api.ngj.nkdppf.com'
      : 'https://api.ngj.nkdppf.com'; // https://api.ngj.nkdppf.com,   , https://wxapp.ngj.nkdppf.com

    const uploadUrl = `${hostUri}`;

    // const userToken =
    //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOm51bGwsImlhdCI6MTY0NDQ4MTc4Nn0.8KDZG5ZAgLyW-02uPj3Q2acZ-cfHNU7mYERhfQaRWX0";
    // const userToken =
    //   LocalStorage.getItem("userToken") !== null
    //     ? LocalStorage.getItem("userToken")
    //     : false;

    const tokenKey = 'userToken';
    const userToken = LocalStorage.has(tokenKey)
      ? LocalStorage.getItem(tokenKey)
      : '';

    const permissionKey = 'userPermissions';
    const userPermissions = LocalStorage.has(permissionKey)
      ? LocalStorage.getItem(permissionKey)
      : '';

    return {
      appName,
      appVersion,
      appPredata,
      version,
      copyright,
      hostUri,
      uploadUrl,
      userToken,
      userPermissions,
      counter: 0,
    };
  },
  //定义一个名为doubleCount的getter，用于获取counter状态的两倍值。通过在getter中引用state对象的counter属性，可以实现根据counter计算的派生值。
  getters: {
    doubleCount(state) {
      return state.counter * 2;
    },
  },
  //定义一些操作函数，包括increment、setState、login和logout。这些操作函数可以在组件中调用，并可以修改存储对象中的状态。
  actions: {
    increment() {
      this.counter++;
    },
    //根据传入的数据，更新存储对象中的多个状态。通过遍历传入的数据对象，并将其属性赋值给存储对象中的对应属性，实现批量更新状态。
    setState(data = {}) {
      type keyType = keyof typeof data;
      // console.log('setState', data);
      Object.keys(data).forEach((k) => {
        this[k as keyType] = data[k as keyType];
      });
    },
    //用于设置用户的登录状态，将传入的userToken保存到userToken状态中，并使用LocalStorage将userToken持久化保存。
    login(userToken: any) {
      this.userToken = userToken;

      LocalStorage.set('userToken', userToken);
    },
    //用于清除用户的登录状态
    logout() {
      this.userToken = '';

      LocalStorage.clear();
    },
  },
});
