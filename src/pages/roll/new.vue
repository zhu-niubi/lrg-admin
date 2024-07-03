<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>添加膜卷</q-toolbar-title>
    </q-toolbar>

    <q-card flat v-if="formDataObj">
      <q-form
        ref="myForm"
        autocorrect="off"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      >
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input
                label="膜卷号 *"
                v-model="formDataObj.rollNumber"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <GoodsOption
                title="商品 *"
                v-model="formDataObj.productId"
                baseUrl="/product"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input
                type="number"
                label="长度 *"
                v-model="formDataObj.length"
                lazy-rules
                :rules="[(val) => (val && val > 0) || 'Please type something']"
              />
            </q-card-section>
          </div>
        </div>

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
  watch,
  onMounted,
  onBeforeUnmount,
  onUpdated,
} from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar, useMeta, date } from 'quasar';

import { api } from 'boot/axios';

import GoodsOption from 'components/GoodsOption.vue';

const metaData = {
  // sets document title
  title: '添加膜卷',
};

export default {
  name: 'roll-new',

  components: { GoodsOption },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();

    const myForm = ref(null);
    const formDataObj = ref(null);

    //
    const loadData = () => {
      formDataObj.value = {
        rollNumber: '',
        productId: null,
        length: null,
      };
    };

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/roll', data)
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
          const bodyData = Object.assign({}, formDataObj.value);

          bodyData.length = bodyData.length
            ? Number(bodyData.length)
            : undefined;

          console.log(bodyData);
          // return;
          if (
            !bodyData ||
            !bodyData.rollNumber ||
            !bodyData.productId ||
            !bodyData.length
          ) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '数据输入不完整!',
              icon: 'las la-bug',
            });

            return;
          } else {
            postData(bodyData);
          }
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

    onMounted(() => {
      loadData();
    });

    //
    onBeforeUnmount(() => {
      // we do cleanup
    });

    return {
      myForm,
      formDataObj,
      onSumbit,
    };
  },
};
</script>
