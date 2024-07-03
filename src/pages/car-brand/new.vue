<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>添加汽车品牌</q-toolbar-title>
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
          <div class="col-xs-12 col-sm-6">
            <q-card-section>
              <q-input
                label="品牌名称 *"
                v-model="formDataObj.name"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 1) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-6">
            <q-card-section>
              <q-input
                label="首字母 *"
                v-model="formDataObj.initial"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>
        </div>

        <q-card-section>
          <UploadImgComponent title="图标 *" v-model="formDataObj.image" />
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
  title: '添加员工',
};

export default {
  name: 'car-brand-new',

  components: { UploadImgComponent },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();

    const myForm = ref(null);
    const formDataObj = ref(null);

    //
    const loadData = () => {
      formDataObj.value = {
        name: '',
        initial: '',
        image: [],
      };
    };

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/car_brand', data)
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
          const bodyData = Object.assign({}, formDataObj.value);
          bodyData.image = bodyData.image[0] ? bodyData.image[0].url : '';

          // console.log(bodyData);
          // return;
          if (
            !bodyData ||
            !bodyData.name ||
            !bodyData.initial ||
            !bodyData.image
          ) {
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
      formDataObj,
      onSumbit,
    };
  },
};
</script>
