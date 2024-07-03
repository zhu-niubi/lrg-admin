<template>
  <q-page class="q-pa-md q-gutter-y-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>发送卡券</q-toolbar-title>
    </q-toolbar>

    <q-card flat v-if="couponObj">
      <q-form
        ref="myForm"
        autocorrect="off"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      >
        <q-card-section>
          <GoodsOption
            title="卡券模板 *"
            v-model="couponObj.couponTemplateId"
            baseUrl="/coupon_template"
          />
        </q-card-section>

<!--        <q-card-section>-->
<!--          <q-input-->
<!--            label="用户ID ( 请使用回车分隔 ) *"-->
<!--            v-model="couponObj.userId"-->
<!--            filled-->
<!--            type="textarea"-->
<!--          />-->
<!--        </q-card-section>-->
        <div class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-xs-12 col-sm-3">
              <q-input outlined label="用户手机号"  v-model="phoneNumber"/>
            </div>
            <div class="col-xs-12 col-sm-3">
              <q-btn
                class="q-px-xl q-py-md"
                color="primary"
                @click="onSearch"
                label="查询"
              />
            </div>
          </div>
          <q-item v-ripple style="width: 560px;"  v-if="personExit">
            <q-item-section side>
              <q-avatar rounded size="48px">
                <img :src="personInfo.avatarUrl || ''" />
                <q-badge floating color="teal">用户</q-badge>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ personInfo.nickname || personInfo.name || `用户${personInfo.id}` }}</q-item-label>
              <q-item-label caption>{{ personInfo.phoneNumber }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                class="q-px-xl q-py-md"
                color="primary"
                size="md"
                @click="addPer"
                label="添加"
                rounded
                flat
              />
            </q-item-section>
          </q-item>
          <div class="q-gutter-xs row" style="margin-top: 20px" v-if="personList.length > 0">
            <div v-for="person in personList" :key="person.id">

              <q-chip
                removable
                v-model="person.removePer"
                color="primary"
                text-color="white"
              >
                <q-avatar>
                  <img :src="person.avatarUrl || ''">
                </q-avatar>
                <div class="ellipsis">
                  {{ person.nickname || person.name || `用户${person.id}` }}
                  <q-tooltip>ID:{{ person.id }}</q-tooltip>
                </div>
              </q-chip>

            </div>


          </div>

        </div>



        <q-card-section>
          <span>适用门店 *</span
          ><q-toggle v-model="allStore" keep-color label="全部门店" />
          <CheckboxComponent
            v-if="!allStore"
            v-model="couponObj.applyStore"
            baseUrl="/store"
            isNoClickAll="true"
          />
        </q-card-section>

        <q-card-section>
          <q-input type="number" label="数量" v-model="couponObj.count" />
        </q-card-section>

        <q-card-section>
          <q-editor
            placeholder="请填写相应卡券的备注说明 *"
            v-model="couponObj.memo"
          />
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

import { api } from 'boot/axios';

import GoodsOption from 'components/GoodsOption.vue';
import CheckboxComponent from 'components/CheckboxComponent.vue';

const metaData = {
  // sets document title
  title: '发送卡券',
};

export default {
  name: 'coupon-new',

  components: { GoodsOption, CheckboxComponent },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();

    const phoneNumber = ref(null);

    const personInfo = ref({});

    const personExit = ref(false);

    // const removePer = ref(true);

    const personList = ref([]);

    const myForm = ref(null);
    const couponObj = ref(null);

    // 全部门店
    const allStore = ref(false);



    //
    const loadData = () => {
      couponObj.value = {
        userId: '',
        couponTemplateId: null,
        count: null,
        memo: '',
      };
    };

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/coupon', data)
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

          // console.log(personList.value)
          // yay, models are correct          return;

          const bodyData = Object.assign({}, couponObj.value);

          bodyData.count = bodyData.count ? Number(bodyData.count) : 0;

          // 处理用户id数据
          // let numbers = bodyData.userId.split('\n');
          // numbers = numbers.map(Number);
          // bodyData.userId = numbers.filter((item) => {
          //   return String(item) != '0';
          // });

          bodyData.userId = personList.value
            .filter(item => item.removePer === true)
            .map(item => item.id);

          bodyData.applyStore = allStore.value ? [0] : bodyData.applyStore;

          // console.log(bodyData);
          // return;
          if (
            !bodyData ||
            !bodyData.userId.length ||
            !bodyData.couponTemplateId ||
            !bodyData.applyStore.length ||
            !bodyData.memo
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
    const onSearch = () => {
      // console.log();
      if (phoneNumber.value == undefined){
        $q.notify({
          color: 'primary',
          position: 'center',
          message: '请输入用户手机号',
          icon: 'las la-exclamation-circle',
        });
        return;
      }
      const params = {
        phoneNumber: phoneNumber.value || undefined,
      };
      api
        .get('/user', { params })
        .then((payload) => {
          // console.log(payload);
          const { list } = payload;
          if( list.length > 0 ){

            personInfo.value = list[0];
            // console.log(personInfo.value);
            personInfo.value.removePer = true;
            personExit.value = true;

          }else {
            $q.notify({
              color: 'primary',
              position: 'center',
              message: '该用户不存在',
              icon: 'las la-exclamation-circle',
            });

          }
        })
    };




    const addPer = () => {

      // console.log(addPer);

      if (personList.value.some(item => item.id === personInfo.value.id  && item.removePer === true)) {
        $q.notify({
          color: 'primary',
          position: 'center',
          message: '该用户已经存在',
          icon: 'las la-exclamation-circle',
        });


      }else {
        personList.value.push(personInfo.value);

      }


      personExit.value = false;

      // console.log('add',personList.value)

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
      couponObj,
      allStore,
      onSumbit,
      phoneNumber,
      onSearch,
      // removePer,
      addPer,
      personInfo,
      personList,
      personExit
    };
  },
};
</script>
