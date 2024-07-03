<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改卡券</q-toolbar-title>
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

        <q-card-section>
          <GoodsOption
            title="用户 *"
            v-model="couponObj.userId"
            baseUrl="/user"
          />
        </q-card-section>

        <q-card-section>
          <DateTimeComponent title="截止时间 *" v-model="couponObj.deadline" />
        </q-card-section>

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
          <q-editor
            placeholder="请填写相应卡券的备注说明"
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
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar, useMeta, date } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'boot/axios';

import GoodsOption from 'components/GoodsOption.vue';
import DateTimeComponent from 'components/DateTimeComponent.vue';
import CheckboxComponent from 'components/CheckboxComponent.vue';

const metaData = {
  // sets document title
  title: '修改卡券',
};

export default {
  name: 'coupon-edit',

  components: { GoodsOption, DateTimeComponent, CheckboxComponent },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const couponItem = $route.params;

    const couponObj = ref();

    const myForm = ref(null);

    const allStore = ref(false);

    //
    const loadData = () => {
      if (JSON.stringify(couponItem) === '{}') {
        history.back();
      } else {
        console.log(couponItem);
        couponItem.userId = Number(couponItem.userId);
        couponItem.couponTemplateId = Number(couponItem.couponTemplateId);

        couponItem.applyStore = couponItem.applyStore.map((o) => {
          if (Number(o) === 0) {
            allStore.value = true;
          }
          return Number(o);
        });

        couponObj.value = couponItem;
      }
    };

    const postData = (data) => {
      // $q.loading.show()
      let id = couponObj.value.id;
      api
        .put(`/coupon/${id}`, data)
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
          const bodyData = Object.assign({}, couponObj.value);
          const newBodyData = {};

          newBodyData.userId = bodyData.userId;
          newBodyData.couponTemplateId = Number(bodyData.couponTemplateId);
          newBodyData.memo = bodyData.memo;
          newBodyData.deadline = bodyData.deadline
            ? Number(new Date(bodyData.deadline)) / 1000
            : 0;
          newBodyData.applyStore = allStore.value ? [0] : bodyData.applyStore;
          console.log(newBodyData);
          // return;
          if (
            !newBodyData ||
            !newBodyData.userId ||
            !newBodyData.couponTemplateId ||
            !newBodyData.memo ||
            !newBodyData.applyStore.length ||
            !newBodyData.deadline
          ) {
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

    // 监听是否是全部门店
    watch(
      () => allStore.value,
      (newVal) => {
        console.log(newVal);
        if (newVal) {
          couponObj.value.applyStore = [0];
        } else {
          couponObj.value.applyStore = [];
        }
      }
    );

    //
    onBeforeUnmount(() => {
      // we do cleanup
    });

    return {
      myForm,
      couponObj,
      allStore,
      onSumbit,
    };
  },
};
</script>
