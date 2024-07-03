<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>添加商品系列</q-toolbar-title>
    </q-toolbar>

    <q-card flat v-if="formDataObj">
      <q-form ref="myForm" autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false">
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <GoodsOption title="产品类型 *" v-model="formDataObj.productTypeId" baseUrl="/product_type" />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input label="系列名称 *" v-model="formDataObj.name" lazy-rules :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]" />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input type="number" label="序号 *" v-model="formDataObj.sort" lazy-rules :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]" />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input label="质保年限 *" v-model="formDataObj.warrantyYear" lazy-rules type="number" :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]" />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <GoodsOption title="标签" v-model="formDataObj.tag" :optionsVal="tagPUList"
                v-if="formDataObj.productTypeId == 1" />
              <GoodsOption title="标签" v-model="formDataObj.tag" :optionsVal="tagList" v-else />
            </q-card-section>
          </div>
        </div>

        <q-card-section class="text-center">
          <q-btn rounded color="primary" class="q-px-xl q-py-md" @click="onSumbit" label="提交" />
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
} from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar, useMeta, date } from 'quasar';

import { api } from 'boot/axios';

import GoodsOption from 'components/GoodsOption.vue';

const metaData = {
  // sets document title
  title: '添加系列',
};

export default {
  name: 'product-model-new',

  components: { GoodsOption },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();

    const myForm = ref(null);
    const formDataObj = ref(null);

    // 标签
    const tagList = ref(['标签一', '标签二', '标签三']);
    const tagPUList = ref(['透明车衣', '改色车衣']);

    //
    const loadData = () => {
      formDataObj.value = {
        name: '',
        productTypeId: null,
        tag: '',
        sort: null,
      };
    };

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/product_model', data)
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

          bodyData.sort = bodyData.sort ? Number(bodyData.sort) : undefined;
          bodyData.tag = bodyData.tag ? bodyData.tag : undefined;

          bodyData.warrantyYear = Number(bodyData.warrantyYear) || undefined;
          // console.log(bodyData);
          // return;
          if (
            !bodyData ||
            !bodyData.name ||
            !bodyData.productTypeId ||
            !bodyData.sort ||
            !bodyData.warrantyYear
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

    //
    onMounted(() => {
      loadData();
    });

    //
    onBeforeUnmount(() => {
      // we do cleanup
    });

    return {
      tagList,
      tagPUList,
      myForm,
      formDataObj,
      onSumbit,
    };
  },
};
</script>
