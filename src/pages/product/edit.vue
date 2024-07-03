<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改商品</q-toolbar-title>
    </q-toolbar>

    <q-card flat v-if="formDataObj && formDataObj.id">
      <q-form ref="myForm" autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false">
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input label="商品名称 *" v-model="formDataObj.name" lazy-rules :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]" />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <GoodsOption title="商品属性 *" v-model="formDataObj.type" :optionsVal="propertyList" />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4" v-if="formDataObj.type === 1">
            <q-card-section>
              <GoodsOption title="商品类型 *" v-model="productType" baseUrl="/product_type" disable />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-12">
            <q-card-section>
              <span>适用门店 *</span>
              <q-toggle v-model="allStore" keep-color label="全部门店" />
              <CheckboxComponent v-if="!allStore" v-model="formDataObj.applyStore" baseUrl="/store" isNoClickAll="true" />
            </q-card-section>
          </div>
          <div class="col-12" v-if="formDataObj.type">
            <q-card-section>
              <q-card flat bordered>
                <q-toolbar>
                  <div class="subTitle">商品规格</div>
                </q-toolbar>
                <div v-for="(itemSkus, indexSkus) in formDataObj.skus" :key="indexSkus">
                  <div class="q-px-md row q-col-gutter-md" v-if="itemSkus.status">
                    <div class="col-xs-12 col-sm-4">
                      <q-input label="规格名 *" v-model="itemSkus.name" lazy-rules :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                      ]" />
                    </div>
                    <div class="col-xs-12 col-sm-3">
                      <q-input label="价格 *" type="number" v-model="itemSkus.price" lazy-rules :rules="[
                        (val) => (val && val > 0) || 'Please type something',
                      ]" />
                    </div>
                    <div class="col-xs-12 col-sm-3">
                      <q-input label="积分(不填默认不能积分兑换)" type="number" v-model="itemSkus.point" lazy-rules />
                    </div>
                    <div class="col-xs-12 col-sm-2 flex items-center">
                      <q-btn label="删除" flat color="grey" @click="delSkus(indexSkus)" />
                    </div>
                  </div>
                </div>
                <!-- 添加规格 -->
                <div class="text-center">
                  <q-btn round icon="las la-plus" @click="addSkus" />
                </div>
              </q-card>
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4" v-if="formDataObj.type === 1 && productType">
            <q-card-section>
              <GoodsOption title="商品系列 *" v-model="formDataObj.productModelId"
                :baseUrl="'/product_model?productTypeId=' + productType" />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <GoodsOption title="售卖状态 *" v-model="formDataObj.saleStatus" :optionsVal="saleStatusList" />
            </q-card-section>
          </div>
          <!--          <div class="col-xs-12 col-sm-4">-->
          <!--            <q-card-section>-->
          <!--              <q-input-->
          <!--                type="number"-->
          <!--                label="积分（不填默认为不可积分兑换）"-->
          <!--                v-model="formDataObj.point"-->
          <!--                lazy-rules-->
          <!--              />-->
          <!--            </q-card-section>-->
          <!--          </div>-->
          <!--          <div class="col-xs-12 col-sm-4">-->
          <!--            <q-card-section>-->
          <!--              <q-input-->
          <!--                type="number"-->
          <!--                label="库存 *"-->
          <!--                v-model="formDataObj.stock"-->
          <!--                lazy-rules-->
          <!--                :rules="[-->
          <!--                  (val) =>-->
          <!--                    (val && val.toString().length > 0) ||-->
          <!--                    'Please type something',-->
          <!--                ]"-->
          <!--              />-->
          <!--            </q-card-section>-->
          <!--          </div>-->
        </div>

        <!--        <q-card-section>-->
        <!--          <q-toggle-->
        <!--            v-model="formDataObj.payType"-->
        <!--            keep-color-->
        <!--            label="定金尾款(默认为全额支付)"-->
        <!--          />-->
        <!--        </q-card-section>-->

        <!--        <q-card-section v-if="formDataObj.payType">-->
        <!--          <q-input-->
        <!--            type="number"-->
        <!--            label="定金 *"-->
        <!--            v-model="formDataObj.deposit"-->
        <!--            lazy-rules-->
        <!--            :rules="[-->
        <!--              (val) =>-->
        <!--                (val && val.toString().length > 0) || 'Please type something',-->
        <!--            ]"-->
        <!--          />-->
        <!--        </q-card-section>-->

        <!--        <q-card-section>-->
        <!--          <q-input-->
        <!--            type="number"-->
        <!--            :label="formDataObj.payType ? '尾款 *' : '价格 *'"-->
        <!--            v-model="formDataObj.price"-->
        <!--            lazy-rules-->
        <!--            :rules="[-->
        <!--              (val) =>-->
        <!--                (val && val.toString().length > 0) || 'Please type something',-->
        <!--            ]"-->
        <!--          />-->
        <!--        </q-card-section>-->

        <!--        <q-card-section v-if="formDataObj.payType">-->
        <!--          <DateTimeComponent-->
        <!--            title="尾款时间 *"-->
        <!--            v-model="formDataObj.payBalanceAt"-->
        <!--          />-->
        <!--        </q-card-section>-->

        <q-card-section>
          <UploadImgComponent title="商品图标" v-model="formDataObj.homePicture" />
        </q-card-section>

        <q-card-section>
          <UploadImgComponent title="商品封面 * （300*165）" v-model="formDataObj.cover" />
          <div v-if="formDataObj?.cover?.length > 0">
            <UploadImgComponent title="商品详情 * （300*165）" v-model="formDataObj.detail" />
          </div>
        </q-card-section>

        <q-card-section>
          <q-editor placeholder="请填写相应商品描述 *" v-model="formDataObj.description" />
        </q-card-section>

        <q-card-section class="text-center">
          <q-btn rounded color="primary" class="q-px-xl q-py-md" @click="onSumbit" label="提交" />
        </q-card-section>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>
import {
  ref,
  watch,
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

import GoodsOption from 'components/GoodsOption.vue';
import UploadImgComponent from 'components/UploadImgComponent.vue';
import DateTimeComponent from 'components/DateTimeComponent.vue';
import CheckboxComponent from 'components/CheckboxComponent.vue';

const metaData = {
  // sets document title
  title: '修改商品',
};

export default {
  name: 'product-edit',

  components: {
    CheckboxComponent,
    GoodsOption,
    UploadImgComponent,
  },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const { id } = $route.params;

    const formDataObj = ref({});

    // 商品类型
    const productType = ref(null);

    // 商品属性
    const propertyList = ref([
      { value: 1, label: '车膜' },
      { value: 2, label: '卡券' },
      { value: 3, label: '周边' },
    ]);
    const allStore = ref(false);

    // 售卖状态
    const saleStatusList = ref([
      { value: 2, label: '积分兑换' },
      { value: 1, label: '售卖中' },
      { value: 0, label: '停售' },
    ]);

    const myForm = ref(null);

    //
    const loadData = () => {
      api
        .get(`/product/${id}`)
        .then((payload) => {
          // console.log('回填数据', payload);
          let data = { ...payload };

          data.price = parseFloat((data.price / 100).toFixed(2));
          data.deposit = parseFloat((data.deposit / 100).toFixed(2));

          productType.value = data.productTypeId;

          data.payBalanceAt = date.formatDate(
            data.payBalanceAt * 1000,
            'YYYY-MM-DD HH:mm:ss'
          );

          if (data.banners && data.banners.length > 0) {
            let newImgList = [];
            for (var key in data.banners) {
              let list = {};
              list.url = data.banners[key];
              newImgList.push(list);
            }
            data.banners = newImgList;
          }

          // 规格skus
          if (data.productSku) {
            data.skus = data.productSku.map((o) => {
              return {
                name: o.name,
                price: (o.price / 100).toFixed(2),
                id: o.id,
                point: parseInt(o.point),
                status: o.status,
              };
            });
          } else {
            data.skus = [];
          }

          data.homePicture = data.homePicture
            ? [{ url: data.homePicture }]
            : [];

          if (data.applyStore.indexOf(0) !== -1) {
            allStore.value = true;
          }

          data.cover = [];
          data.detail = [];
          if (data.banners.length > 0) {
            data.cover.unshift(data.banners[0]);
            if (data.banners.length > 1) {
              data.detail.push(data.banners[1]);
            }
          }

          formDataObj.value = { ...data };
        })
        .catch((e) => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: '加载失败!' + e,
            icon: 'report_problem',
          });
        })
        .finally(() => {
          $q.loading.hide();
        });
    };

    const postData = (data) => {
      // $q.loading.show()
      let id = formDataObj.value.id;
      api
        .put(`/product/${id}`, data)
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
          // console.log('bodyData',bodyData)
          // return;
          bodyData.banners = [];
          if (bodyData.cover.length > 0) {
            bodyData.banners.unshift(bodyData.cover[0]);
          }
          if (bodyData.detail.length > 0) {
            bodyData.banners.push(bodyData.detail[0]);
          }

          console.log('原请求体', bodyData);
          // return;
          const newBodyData = {};
          if (!allStore.value) {
          }
          let arr = Object.values(bodyData.applyStore);
          if (arr.length > 1) {
            arr = arr.filter((item) => item !== 0);
          }

          console.log(Object.values(bodyData.applyStore));
          console.log(arr);

          newBodyData.applyStore = allStore.value ? [0] : arr;
          newBodyData.name = bodyData.name;
          newBodyData.saleStatus = bodyData.saleStatus;
          newBodyData.payType = bodyData.payType;

          newBodyData.productModelId =
            bodyData.type == 1 ? bodyData.productModelId : 0;

          if (bodyData.banners && bodyData.banners.length > 0) {
            let newImages = [];
            bodyData.banners.map((img) => {
              newImages.push(img.url);
            });

            newBodyData.banners = newImages;
          }

          newBodyData.homePicture =
            bodyData.homePicture.length > 0 ? bodyData.homePicture[0].url : '';

          newBodyData.description = bodyData.description
            ? bodyData.description
            : undefined;

          // 规格
          if (bodyData.skus.length > 0) {
            newBodyData.skus = bodyData.skus.map((sku) => {
              if (sku.point == undefined) {
                sku.pointStatus = 0;
              } else {
                sku.pointStatus = 1;
              }

              return {
                ...sku,
                point: parseInt(sku.point),
                price: parseFloat((sku.price * 100).toFixed(2)),
              };
            });
          }
          newBodyData.type = bodyData.type;
          console.log('新请求体', newBodyData);
          // return;
          //
          if (
            !newBodyData ||
            !newBodyData.name ||
            !newBodyData.type ||
            newBodyData.productModelId == undefined ||
            newBodyData.saleStatus == undefined ||
            !newBodyData.description ||
            !newBodyData.banners ||
            newBodyData.banners.length < 0 ||
            newBodyData.skus.length < 0
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

    // 点击添加skus
    const addSkus = () => {
      formDataObj.value.skus.push({
        name: '',
        price: null,
        status: 1,
      });
    };
    // 点击删除skus
    const delSkus = (index) => {
      if (formDataObj.value.skus[index].id) {
        formDataObj.value.skus[index].status = 0;
      } else {
        formDataObj.value.skus.splice(index, 1);
      }
    };

    //
    onMounted(() => {
      loadData();
    });

    // 监听规格部位不能重复
    watch(
      () => formDataObj.value?.skus,
      (newVal) => {
        if (newVal && newVal.length > 0) {
          let skusList = newVal.map((item) => item.name);

          let list = new Set(skusList);

          if (skusList.length > list.size) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '规格名不能重复!',
              icon: 'las la-bug',
            });
          }
        }
      },
      { deep: true, immediate: true }
    );
    watch(
      () => formDataObj.value?.cover?.length == 0,
      (newVal) => {
        if (newVal) {
          formDataObj.value.detail.length = 0;
        }
      }
    );

    //
    onBeforeUnmount(() => {
      // we do cleanup
    });

    return {
      myForm,
      formDataObj,
      productType,
      propertyList,
      saleStatusList,
      addSkus,
      delSkus,
      onSumbit,
      allStore,
    };
  },
};
</script>
