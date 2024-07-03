<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>添加卡券类型</q-toolbar-title>
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

import { api } from 'boot/axios';

import UploadImgComponent from 'components/UploadImgComponent.vue';

const metaData = {
  // sets document title
  title: '卡券类型',
};

export default {
  name: 'coupon-type-new',

  components: { UploadImgComponent },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();

    const myForm = ref(null);
    const couponTypeObj = ref(null);

    //
    const loadData = () => {
      couponTypeObj.value = {
        name: '',
        image: [],
      };
    };

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/coupon_class', data)
        .then((payload) => {
          $q.notify({
            color: 'success',
            position: 'top',
            message: '添加成功!',
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
          bodyData.image = bodyData.image[0] ? bodyData.image[0].url : '';
          console.log(bodyData);
          // return;
          if (!bodyData || !bodyData.name || !bodyData.image) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '数据输入不完整!',
              icon: 'las la-bug',
            });

            return;
          }

          postData(bodyData);
        } else {
          // oh no, user has filled in
          // at least one invalid value
          $q.notify({
            color: 'negative',
            position: 'center',
            message: '表单验证失败!',
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
