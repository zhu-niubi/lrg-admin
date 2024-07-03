<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>添加用户车库</q-toolbar-title>
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
                label="手机号 *"
                v-model="formDataObj.phoneNumber"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 1) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <SelectFiler
                title="汽车品牌 *"
                v-model="carBrand"
                baseUrl="/car_brand"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4" v-if="carBrand">
            <q-card-section>
              <SelectFiler
                title="汽车型号 *"
                v-model="formDataObj.carId"
                :baseUrl="'/car?carBrandId=' + carBrand"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input
                label="车牌号 *"
                v-model="formDataObj.carNumber"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 1) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input
                label="车架号 *"
                v-model="formDataObj.VIN"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 1) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input
                label="汽车颜色 *"
                v-model="formDataObj.color"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
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
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar, useMeta, date } from 'quasar';

import { api } from 'boot/axios';
import SelectFiler from 'components/SelectFiler.vue';

const metaData = {
  // sets document title
  title: '添加用户车库',
};

export default {
  name: 'user-car-new',

  components: { SelectFiler },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();

    const myForm = ref(null);
    const formDataObj = ref(null);

    // 汽车品牌
    const carBrand = ref(null);

    //
    const loadData = () => {
      formDataObj.value = {
        userId: null,
        carId: null,
        color: '',
        carNumber: '',
        VIN: '',
      };
    };

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/user_car', data)
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
          bodyData.carId = Number(bodyData.carId) || undefined;

          // console.log(bodyData);
          // return;
          if (
            !bodyData ||
            !bodyData.color ||
            !bodyData.carNumber ||
            !bodyData.VIN ||
            !bodyData.phoneNumber ||
            !bodyData.carId
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
      myForm,
      formDataObj,
      carBrand,
      onSumbit,
    };
  },
};
</script>
