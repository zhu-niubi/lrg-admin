<template>
  <q-btn
    flat
    rounded
    color="primary"
    :icon="`las ${isHome ? 'la-home' : 'la-arrow-left'}`"
    @click="goBack"
    :label="title"
  />
</template>

<script lang="ts">
import { ref, defineComponent, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'GoBack',

  props: {
    title: {
      type: String,
      required: false,
      default: '',
    },
  },

  setup() {
    const route = useRoute();
    const router = useRouter();

    // const curRoute: any = router.currentRoute.value;

    const isHome = ref(false);

    // console.dir($router);
    // console.info('curRoute', curRoute);

    const goBack = () => {
      if (isHome.value) {
        //router.replace('/');
        return;
      }

      router.back();
    };

    // 当参数更改时
    watch(
      () => route.name,
      (val) => {
        // console.log(val);

        isHome.value = val && val === 'HOME' ? true : false;
      },
      { immediate: true }
    );

    return { isHome, goBack };
  },
});
</script>
