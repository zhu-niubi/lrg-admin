<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改员工信息</q-toolbar-title>
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
                label="姓名 *"
                v-model="formDataObj.name"
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
                type="tel"
                label="手机号 *"
                v-model="formDataObj.phoneNumber"
                :rules="[
                  (val) => (val && val.length > 1) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input
                label="账号 *"
                v-model="formDataObj.username"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 1) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <GoodsOption
                title="职位 *"
                v-model="formDataObj.position"
                :optionsVal="positionList"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <GoodsOption
                title="门店 *"
                v-model="formDataObj.storeId"
                baseUrl="/store"
              />
            </q-card-section>
          </div>
        </div>
        <div v-if="formDataObj.position == 2" class="row q-col-gutter-lg-md">
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <GoodsOption
                title="是否是星级技师 *"
                v-model="formDataObj.star"
                :optionsVal="propertyList"
              />
            </q-card-section>
          </div>
          <div v-if="formDataObj.star == 1" class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input
                label="昵称 *"
                v-model="formDataObj.nickname"
                lazy-rules
                :rules="[
                (val) => (val && val.length > 1) || 'Please type something',
              ]"
              />
            </q-card-section>
          </div>
          <div v-if="formDataObj.star == 1" class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input
                type="number"
                label="从业时长（年） *"
                v-model="formDataObj.employeementAt"
                lazy-rules
                :rules="[
                (val) => (val && val > 0) || '从业时长不能为0',
              ]"
              />
            </q-card-section>
          </div>
          <div v-if="formDataObj.star == 1" class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input
                type="number"
                label="服务车主（人次） *"
                v-model="formDataObj.serviceNumber"
                lazy-rules
                :rules="[
                (val) => (val && val.length > 1) || 'Please type something',
              ]"
              />
            </q-card-section>

          </div>

          <div v-if="formDataObj.star == 1" class="col-xs-12 col-sm-4">
            <q-card-section>
              <GoodsOption
                title="星级 *"
                v-model="formDataObj.level"
                :optionsVal="startList"
              />
            </q-card-section>
          </div>

        </div>

        <q-card-section>
          <UploadImgComponent title="员工照片" v-model="formDataObj.image"/>
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
  onBeforeUnmount, watch,
} from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar, useMeta, date } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'boot/axios';

import UploadImgComponent from 'components/UploadImgComponent.vue';
import GoodsOption from 'components/GoodsOption.vue';

const metaData = {
  // sets document title
  title: '修改员工信息',
};

export default {
  name: 'employee-manage-edit',

  components: { UploadImgComponent, GoodsOption },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const formDataItem = $route.params;

    const formDataObj = ref();
    const positionList = ref([
      {label: '店长', value: 1},
      {label: '技师', value: 2},
      {label: '店员', value: 3},
      {label: '运营', value: 4},
      {label: '咖啡师', value: 5},
    ]);
    const propertyList = ref([
      {value: 1, label: '是'},
      {value: 0, label: '否'},
    ]);
    const startList = ref([
      {value: 1, label: '一星'},
      {value: 2, label: '两星'},
      {value: 3, label: '三星'},
      {value: 4, label: '四星'},
      {value: 5, label: '五星'},
    ]);

    const myForm = ref(null);

    //
    const loadData = () => {
      if (JSON.stringify(formDataItem) === '{}') {
        history.back();
      } else {
        formDataItem.position = Number(formDataItem.position);
        formDataItem.storeId = Number(formDataItem.storeId);
        formDataItem.image = formDataItem.image
          ? [{url: formDataItem.image}]
          : [];
        if (formDataItem.star) {
          formDataItem.star = parseInt(formDataItem.star);
          formDataItem.level = parseInt(formDataItem.level);

          if (parseInt(formDataItem.level) == 0) {
            formDataItem.level = null;
          }
          if (parseInt(formDataItem.employeementAt) == 0) {
            formDataItem.employeementAt = null;
          }
          if (parseInt(formDataItem.serviceNumber) == 0) {
            formDataItem.serviceNumber = null;
          }
        }

        console.log('formDataItem', formDataItem);
        formDataObj.value = formDataItem;
      }
    };

    const postData = (data) => {
      // $q.loading.show()
      let id = formDataObj.value.id;
      api
        .put(`/employee/${id}`, data)
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

          newBodyData.name = bodyData.name;
          newBodyData.phoneNumber = bodyData.phoneNumber;
          newBodyData.username = bodyData.username;
          newBodyData.position = bodyData.position;
          newBodyData.storeId = bodyData.storeId;
          newBodyData.star = bodyData.star;
          const {star, serviceNumber, employeementAt, nickname, level} = bodyData;
          newBodyData.serviceNumber = star === 1 ? parseInt(serviceNumber) : 0;
          newBodyData.employeementAt = star === 1 ? parseInt(employeementAt) : 0;
          newBodyData.nickname = star === 1 ? nickname : '';
          newBodyData.level = star === 1 ? parseInt(level) : 0;

          console.log('newBodyData', newBodyData);
          // return;
          if (
            !newBodyData ||
            !newBodyData.name ||
            !newBodyData.phoneNumber ||
            !newBodyData.username ||
            !newBodyData.position ||
            !newBodyData.storeId
          ) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '数据输入不完整!',
              icon: 'las la-bug',
            });

            return;
          }

          // 有上传照片的情况下处理上传照片
          newBodyData.image = bodyData.image[0]
            ? bodyData.image[0].url
            : undefined;
          bodyData.serviceNumber = null ? 0 : parseInt(bodyData.serviceNumber);
          bodyData.employeementAt = null ? 0 : parseInt(bodyData.employeementAt);


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
    // watch(() => formDataObj.value, (newVal) => {
    //   console.log('newVal',newVal)
    //   if ( newVal ){
    //     if ( newVal.star ){
    //       if ( parseInt(newVal.star) == 0 ){
    //
    //         formDataObj.value.nickname = '';
    //         formDataObj.value.level =  null;
    //         formDataObj.value.employeementAt = null;
    //         formDataObj.value.serviceNumber =  null;
    //       }
    //     }
    //   }
    // }, {deep: true} )

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
      startList,
      propertyList,
      positionList,
      myForm,
      formDataObj,
      onSumbit,
    };
  },
};
</script>
