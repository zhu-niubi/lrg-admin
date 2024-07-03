<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>添加员工</q-toolbar-title>
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
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar, useMeta, date } from 'quasar';

import { api } from 'boot/axios';

import UploadImgComponent from 'components/UploadImgComponent.vue';
import GoodsOption from 'components/GoodsOption.vue';

const metaData = {
  // sets document title
  title: '添加员工',
};

export default {
  name: 'employee-manage-new',

  components: { UploadImgComponent, GoodsOption },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();

    const myForm = ref(null);


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
    const formDataObj = ref({
      name: '',
      phoneNumber: '',
      username: '',
      nickname: '',
      position: null,
      storeId: null,
      image: [],
      star: null,
      employeementAt: null,
      serviceNumber: null,
      level: null,

    });

    //
    const loadData = () => {
      2
    };

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/employee', data)
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
          bodyData.serviceNumber = (bodyData.serviceNumber == null) ? 0 : parseInt(bodyData.serviceNumber);
          bodyData.employeementAt = (bodyData.employeementAt == null) ? 0 : parseInt(bodyData.employeementAt);
          bodyData.level = (bodyData.level == null) ? 0 : bodyData.level;
          if (bodyData.star == null) {
            bodyData.star = 0
          }
          console.log('bodyData', bodyData);

          // return;
          if (
            !bodyData ||
            !bodyData.name ||
            !bodyData.phoneNumber ||
            !bodyData.username ||
            !bodyData.position ||
            !bodyData.storeId
          ) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '数据输入不完整!',
              icon: 'las la-bug',
            });

            return;
          }

          bodyData.image = bodyData.image[0]
            ? bodyData.image[0].url
            : undefined;

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
    watch(() => formDataObj.value.star, (newVal) => {
      console.log('newVal', newVal)
      if (newVal == 0) {
        formDataObj.value.nickname = '';
        formDataObj.value.level = null;
        formDataObj.value.employeementAt = null;
        formDataObj.value.serviceNumber = null;
      }
    }, {deep: true})

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
