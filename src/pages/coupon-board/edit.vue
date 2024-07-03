<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改卡券模板</q-toolbar-title>
    </q-toolbar>

    <q-card flat v-if="couponBoardObj">
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
              <SelectFiler
                title="商品 *"
                v-model="couponBoardObj.productId"
                baseUrl="/product"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-6" v-if="productSku.length">
            <q-card-section>
              <SelectFiler
                title="商品规格 *"
                v-model="couponBoardObj.productSkuId"
                :optionsVal="productSku"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-6">
            <q-card-section>
              <q-input
                label="模板名称 *"
                v-model="couponBoardObj.name"
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
                label="优惠金额"
                v-model="couponBoardObj.amount"
                type="number"
              />
            </q-card-section>
          </div>
        </div>

        <q-card-section>
          <UploadImgComponent
            title="优惠券背景图 *"
            v-model="couponBoardObj.image"
          />
        </q-card-section>

        <q-card-section>
          <q-toggle v-model="toggleValue" keep-color label="指定收到后日期" />

          <q-input
            v-if="toggleValue"
            type="number"
            label="指定收到后日期 *"
            v-model="couponBoardObj.deadlineDay"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please type money']"
          />

          <DateTimeComponent
            v-else
            title="截止时间 *"
            v-model="couponBoardObj.deadline"
            :options="timeOptions"
          />
        </q-card-section>

        <q-card-section>
          <q-editor
            placeholder="请填写相应卡券模板的备注说明 *"
            v-model="couponBoardObj.memo"
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
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar, useMeta, date } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'boot/axios';

import DateTimeComponent from 'src/components/DateTimeComponent.vue';
import SelectFiler from 'components/SelectFiler.vue';
import UploadImgComponent from 'components/UploadImgComponent.vue';

const metaData = {
  // sets document title
  title: '卡券模板',
};

export default {
  name: 'coupon-board-edit',

  components: { DateTimeComponent, SelectFiler, UploadImgComponent },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const couponBoardItem = $route.params;

    const couponBoardObj = ref();
    const toggleValue = ref(false);

    const myForm = ref(null);
    const productSku = ref([]);

    // 日期大于申请当天
    const timeOptions = (d) => {
      return d >= date.formatDate(Date.now(), 'YYYY/MM/DD');
    };

    //
    const loadData = () => {
      if (JSON.stringify(couponBoardItem) === '{}') {
        history.back();
      } else {
        console.log(couponBoardItem);
        // 判断显示截止日期还是指定后收到的日期
        if (couponBoardItem.deadline) {
          toggleValue.value = false;
        } else {
          toggleValue.value = true;
        }

        // console.log(couponBoardItem);
        couponBoardItem.productId = Number(couponBoardItem.productId);
        couponBoardItem.productSkuId = Number(couponBoardItem.productSkuId);

        couponBoardItem.image = couponBoardItem.image
          ? [{ url: couponBoardItem.image }]
          : [];
        couponBoardObj.value = couponBoardItem;
      }
    };

    const postData = (data) => {
      // $q.loading.show()
      let id = couponBoardObj.value.id;
      api
        .put(`/coupon_template/${id}`, data)
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
          const bodyData = Object.assign({}, couponBoardObj.value);
          const newBodyData = {};

          newBodyData.name = bodyData.name;
          newBodyData.deadline = toggleValue.value
            ? 0
            : Number(new Date(bodyData.deadline ? bodyData.deadline : 0)) /
              1000;
          newBodyData.deadlineDay = toggleValue.value
            ? Number(bodyData.deadlineDay)
            : 0;
          newBodyData.productId = Number(bodyData.productId) || undefined;
          newBodyData.image = bodyData.image[0] ? bodyData.image[0].url : '';

          newBodyData.memo = bodyData.memo;
          newBodyData.productSkuId = Number(bodyData.productSkuId) || undefined;
          newBodyData.amount = Number(bodyData.amount) || undefined;

          console.log(newBodyData);
          // return;
          if (
            !newBodyData ||
            !newBodyData.name ||
            newBodyData.deadline === undefined ||
            newBodyData.deadlineDay === undefined ||
            !newBodyData.productId ||
            !newBodyData.image ||
            !newBodyData.memo ||
            !newBodyData.productSkuId
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
            message: '表单验证失败!',
            icon: 'las la-skull-crossbones',
          });
        }
      });
    };

    // 监听couponBoardObj.productId
    watch(
      () => couponBoardObj.value?.productId,
      (newVal) => {
        if (newVal) {
          api
            .get(`/product/${couponBoardObj.value.productId}`)
            .then((payload) => {
              // console.log('payload', payload);
              productSku.value = payload.productSku.map((sku) => {
                const { id, name } = sku;
                return { value: id, label: name };
              });
            });
        }
      }
    );

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
      couponBoardObj,
      toggleValue,
      productSku,
      timeOptions,
      onSumbit,
    };
  },
};
</script>
