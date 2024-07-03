<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>添加卡券模板</q-toolbar-title>
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

import { api } from 'boot/axios';

import DateTimeComponent from 'src/components/DateTimeComponent.vue';
import SelectFiler from 'src/components/SelectFiler.vue';
import UploadImgComponent from 'src/components/UploadImgComponent.vue';

const metaData = {
  // sets document title
  title: '卡券模板',
};

export default {
  name: 'coupon-board-new',

  components: { DateTimeComponent, SelectFiler, UploadImgComponent },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();

    const myForm = ref(null);
    const couponBoardObj = ref({
      name: '',
      image: [],
      deadline: '',
      deadlineDay: '',
      memo: '',
      productId: null,
    });

    const productSku = ref([]);

    const toggleValue = ref(false);

    // 日期大于申请当天
    const timeOptions = (d) => {
      return d >= date.formatDate(Date.now(), 'YYYY/MM/DD');
    };

    //
    // const loadData = () => {};

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/coupon_template', data)
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
          const bodyData = Object.assign({}, couponBoardObj.value);

          bodyData.deadline = toggleValue.value
            ? 0
            : bodyData.deadline
            ? Number(new Date(bodyData.deadline)) / 1000
            : 0;
          bodyData.deadlineDay = Number(
            toggleValue.value ? bodyData.deadlineDay : 0
          );

          bodyData.image = bodyData.image[0] ? bodyData.image[0].url : '';

          bodyData.productId = Number(bodyData.productId) || undefined;
          bodyData.productSkuId = Number(bodyData.productSkuId) || undefined;
          bodyData.amount = Number(bodyData.amount) || undefined;

          console.log(bodyData);
          // return;
          if (
            !bodyData ||
            !bodyData.name ||
            bodyData.deadline === undefined ||
            bodyData.deadlineDay === undefined ||
            !bodyData.image ||
            !bodyData.memo ||
            !bodyData.productId ||
            !bodyData.productSkuId
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

    // 监听couponBoardObj.productId
    watch(
      () => couponBoardObj.value.productId,
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
      // loadData();
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
