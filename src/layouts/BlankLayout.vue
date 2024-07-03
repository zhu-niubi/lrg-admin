<template>
  <q-layout view="lHh Lpr lFf">
    <q-header reveal class="bg-transparent text-black">
      <q-bar v-if="isElectron" class="q-electron-drag bg-transparent q-mt-xs">
        <!-- <q-icon name="lab la-stumbleupon" /> -->
        <q-avatar>
          <q-img src="~assets/ICON.svg" spinner-size="18px" />
        </q-avatar>
        <div>
          {{ `${appName}` }}
          <q-badge rounded color="grey-5">
            {{ `${appVersion}` }}
          </q-badge>
        </div>

        <q-space />

        <q-btn dense flat icon="close" @click="closeApp" />
      </q-bar>

      <q-toolbar class="q-mt-xs">
        <q-avatar size="38px">
          <q-img
            src="~assets/ICON.svg"
            width="38px"
            height="38px"
            spinner-size="18px"
          />
        </q-avatar>
        <q-toolbar-title></q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import {
  ref,
  defineComponent,
  computed,
  onMounted,
  onUnmounted,
  onUpdated,
} from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'BlankLayout',

  components: {},

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();

    const appName = computed(() => store.appName);
    const appVersion = computed(() => store.appVersion);

    const isElectron = $q.platform.is.electron;
    const timer = ref<any>(null);

    function closeApp() {
      if (process.env.MODE === 'electron') {
        window.myWindowAPI.close();
      }
    }

    onMounted(() => {
      // console.log('onMounted');
      if (isElectron) {
        window.myWindowAPI.on('message', (_event: any, arg: any) => {
          console.log('on.message', arg);
          $q.notify(JSON.stringify(arg));
        });

        timer.value = setInterval(() => {
          // console.log('send.app_version');
          window.myWindowAPI.send('app_version', { topic: 'app_version' });
        }, 5000);
      }
    });

    onUpdated(() => {
      // console.log('onUpdated');
    });

    onUnmounted(() => {
      // console.log('onUnmounted');

      if (isElectron) {
        window.myWindowAPI.removeAllListeners('message');

        clearInterval(timer.value);
        timer.value = null;
      }
    });

    return { appName, appVersion, isElectron, closeApp };
  },
});
</script>
