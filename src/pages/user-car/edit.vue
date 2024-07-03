<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改用户车库</q-toolbar-title>
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
import { useRoute, useRouter } from 'vue-router';
import { api } from 'boot/axios';

import SelectFiler from 'components/SelectFiler.vue';

const metaData = {
  // sets document title
  title: '修改用户车库',
};

export default {
  name: 'user-car-edit',

  components: { SelectFiler },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const formDataItem = $route.params;

    const formDataObj = ref();

    const myForm = ref(null);

    // 汽车品牌
    const carBrand = ref();

    //
    const loadData = () => {
      if (JSON.stringify(formDataItem) === '{}') {
        history.back();
      } else {
        formDataItem.userId = Number(formDataItem.userId);
        formDataItem.carId = Number(formDataItem.carId);

        carBrand.value = Number(formDataItem.carBrandId);

        console.log(formDataItem);

        formDataObj.value = formDataItem;
      }
    };

    const postData = (data) => {
      // $q.loading.show()
      let id = formDataObj.value.id;
      api
        .put(`/user_car/${id}`, data)
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
          const bodyData = Object.assign({}, formDataObj.value);
          const newBodyData = {};

          newBodyData.carNumber = bodyData.carNumber;
          newBodyData.color = bodyData.color;
          newBodyData.VIN = bodyData.VIN;

          newBodyData.phoneNumber = bodyData.phoneNumber || undefined;

          console.log(newBodyData);
          // return;

          if (
            !newBodyData ||
            !newBodyData.carNumber ||
            !newBodyData.color ||
            !newBodyData.VIN ||
            !newBodyData.phoneNumber
          ) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '数据输入不完整!',
              icon: 'las la-bug',
            });

            return;
          } else {
            postData(newBodyData);
          }
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
      formDataObj,
      carBrand,
      onSumbit,
    };
  },
};
</script>
