<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改卡券模板</q-toolbar-title>
    </q-toolbar>

    <q-card flat v-if="couponTypeObj">
      <q-form
        ref="myForm"
        autocorrect="off"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      >
        <q-card-section>
          <q-input
            label="名称 *"
            v-model="couponTypeObj.name"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 1) || 'Please type something',
            ]"
          />
        </q-card-section>

        <q-card-section>
          <UploadImgComponent v-model="couponTypeObj.image" title="图片 *" />
        </q-card-section>

        <q-card-section class="text-center">
          <q-btn
            rounded
            color="primary"
            class="q-px-xl q-py-md"
            @click="onSumbit"
            label="提交"
          />
        </q-card-section>
      </q-form>
    </q-card>

    <!-- {{ brandLabelObj }} -->
  </q-page>
</template>

<script>
import {
  ref,
  defineComponent,
  reactive,
  toRefs,
  computed,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar, useMeta, date } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'boot/axios';

import UploadImgComponent from 'components/UploadImgComponent.vue';

const metaData = {
  // sets document title
  title: '卡券模板',
};

export default {
  name: 'coupon-board-edit',

  components: { UploadImgComponent },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const couponTypeItem = $route.params;

    const couponTypeObj = ref();

    const myForm = ref(null);

    //
    const loadData = () => {
      if (JSON.stringify(couponTypeItem) === '{}') {
        history.back();
      } else {
        couponTypeItem.image = [{ url: couponTypeItem.image }];
        couponTypeObj.value = couponTypeItem;
      }
    };

    const postData = (data) => {
      // $q.loading.show()
      let id = couponTypeObj.value.id;
      api
        .put(`/coupon_class/${id}`, data)
        .then((payload) => {
          $q.notify({
            color: 'success',
            position: 'top',
            message: '修改成功!',
            icon: 'lar la-check-circle',
          });
          history.back();
        })
        .finally(() => {
          // $q.loading.hide()
        });
    };

    const onSumbit = () => {
      myForm.value.validate().then((success) => {
        if (success) {
          // yay, models are correct
          const bodyData = Object.assign({}, couponTypeObj.value);
          const newBodyData = {};

          newBodyData.name = bodyData.name;
          newBodyData.image = bodyData.image[0] ? bodyData.image[0].url : '';

          // console.log(newBodyData);
          // return;
          if (!newBodyData || !newBodyData.image) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '数据输入不完整!',
              icon: 'las la-bug',
            });

            return;
          }

          postData(newBodyData);
        } else {
          // oh no, user has filled in
          // at least one invalid value
          $q.notify({
            color: 'negative',
            position: 'center',
            messagae: '表单验证失败!',
            icon: 'las la-skull-crossbones',
          });
        }
      });
    };

    // needs to be called in setup()
    useMeta(metaData);

    //
    onMounted(() => {
      loadData();
    });

    //
    onBeforeUnmount(() => {
      // we do cleanup
    });

    return {
      myForm,
      couponTypeObj,
      onSumbit,
    };
  },
};
</script>
