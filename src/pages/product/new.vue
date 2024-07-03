<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>添加商品</q-toolbar-title>
    </q-toolbar>

    <q-card flat v-if="formDataObj">
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
              <GoodsOption title="商品类型 *" v-model="productType" baseUrl="/product_type" />
            </q-card-section>
          </div>
          <div class="col-12" v-if="formDataObj.type">
            <q-card-section>
              <q-card flat bordered>
                <q-toolbar>
                  <div class="subTitle">
                    商品{{
                      formDataObj.type === 1
                      ? '部位'
                      : formDataObj.type === 2
                        ? '规格'
                        : '规格'
                    }}
                  </div>
                </q-toolbar>
                <div v-for="(itemSkus, indexSkus) in formDataObj.skus" :key="indexSkus">
                  <div class="q-px-md row q-col-gutter-md">
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
          <!--          <div class="col-xs-12 col-sm-3">-->
          <!--            <q-card-section>-->
          <!--              <q-input-->
          <!--                type="number"-->
          <!--                label="库存 *"-->
          <!--                v-model="formDataObj.stock"-->
          <!--                lazy-rules-->
          <!--                :rules="[-->
          <!--                  (val) => (val && val.length > 0) || 'Please type something',-->
          <!--                ]"-->
          <!--              />-->
          <!--            </q-card-section>-->
          <!--          </div>-->
          <!--          <div class="col-xs-12 col-sm-5">-->
          <!--            <q-card-section>-->
          <!--              <q-input-->
          <!--                type="number"-->
          <!--                label="积分（不填默认为不可积分兑换）"-->
          <!--                v-model="formDataObj.point"-->
          <!--                lazy-rules-->
          <!--              />-->
          <!--            </q-card-section>-->
          <!--          </div>-->
          <q-card-section>
            <span>适用门店 *</span>
            <q-toggle v-model="allStore" keep-color label="全部门店" />
            <CheckboxComponent v-if="!allStore" v-model="formDataObj.applyStore" baseUrl="/store" isNoClickAll="true" />
          </q-card-section>
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
        <!--              (val) => (val && val.length > 0) || 'Please type something',-->
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
        <!--              (val) => (val && val.length > 0) || 'Please type something',-->
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
          <UploadImgComponent title="商品封面 * （300*165,限一张）" v-model="imgData.coverImg" />
          <div v-if="imgData.coverImg.length > 0">
            <UploadImgComponent title="商品内容详情 * （限一张）" v-model="imgData.banners" />
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

    <!-- {{ brandLabelObj }} -->
  </q-page>
</template>

<script>
import { getCurrentInstance, onBeforeUnmount, onMounted, ref, watch, } from 'vue';
import { useBaseStore } from 'stores/base';
import { useMeta, useQuasar } from 'quasar';

import { api } from 'boot/axios';

import GoodsOption from 'components/GoodsOption.vue';
import UploadImgComponent from 'components/UploadImgComponent.vue';
import DateTimeComponent from 'components/DateTimeComponent.vue';
import CheckboxComponent from 'components/CheckboxComponent.vue';

const metaData = {
  // sets document title
  title: '添加商品',
};

export default {
  name: 'product-new',

  components: { GoodsOption, UploadImgComponent, CheckboxComponent },

  setup() {
    const { proxy } = getCurrentInstance();
    const $q = useQuasar();
    const store = useBaseStore();

    const myForm = ref(null);

    // 全部门店
    const allStore = ref(false);
    const formDataObj = ref({
      name: '',
      type: null,
      saleStatus: null,
      productModelId: null,
      description: '',
      homePicture: [],
      skus: [],
      applyStore: null,
      banners: [],
    });
    const imgData = ref({
      coverImg: [],
      banners: [],
    })

    // 商品类型
    const productType = ref(null);

    // 商品属性
    const propertyList = ref([
      { value: 1, label: '车膜' },
      { value: 2, label: '卡券' },
      { value: 3, label: '周边' },
    ]);

    // 售卖状态
    const saleStatusList = ref([
      { value: 2, label: '积分兑换' },
      { value: 1, label: '售卖中' },
      { value: 0, label: '停售' },
    ]);

    //
    const loadData = () => {
      2;
    };

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/product', data)
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
          const imageData = Object.assign({}, imgData.value);
          const bodyData = Object.assign({}, formDataObj.value);


          console.log('imageData', imageData);
          if (imageData.coverImg.length > 1 || imageData.banners.length > 1) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '封面或内容详情图片大于一张!',
              icon: 'las la-bug',
            });
            return;
          } else if (imageData.coverImg.length === 1) {
            bodyData.banners.unshift(imageData.coverImg[0]);
            if (imageData.banners.length === 1) {
              bodyData.banners.splice(1, 0, imageData.banners[0]);
            }
            console.log('image=>', bodyData.banners)
          }


          bodyData.applyStore = allStore.value ? [0] : Object.values(bodyData.applyStore);

          bodyData.productModelId =
            bodyData.type == 1 ? bodyData.productModelId : 0;

          if (bodyData.banners && bodyData.banners.length > 0) {
            let newImages = [];
            bodyData.banners.map((img) => {
              newImages.push(img.url);
            });

            bodyData.banners = newImages;
          }

          bodyData.homePicture =
            bodyData.homePicture.length > 0
              ? bodyData.homePicture[0].url
              : undefined;

          // 商品规格
          if (bodyData.skus.length > 0) {
            bodyData.skus.map((sku) => {
              console.log('point', sku.point);
              if (sku.point == undefined) {
                sku.point = 0;
                sku.pointStatus = 0;
              } else {
                sku.point = parseInt(sku.point);
                sku.pointStatus = 1;

              }

              sku.price = parseFloat((sku.price * 100).toFixed(2));

            });
          }
          bodyData.payType = 1;

          console.log('bodyData', bodyData);
          // return;
          // postData(bodyData);

          if (
            !bodyData ||
            !bodyData.name ||
            !bodyData.type ||
            bodyData.productModelId == undefined ||
            bodyData.saleStatus == undefined ||
            !bodyData.description ||
            !bodyData.banners ||
            bodyData.banners.length < 0 ||
            bodyData.skus.length < 0
          ) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '数据输入不完整!',
              icon: 'las la-bug',
            });

            return;
          } else {
            // console.log(bodyData)
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

    // 根据商品类型获取对应部位
    const getSkusList = (id) => {
      const params = {
        pageNumber: 1,
        pageSize: 1000,
        productTypeId: id,
      };

      api
        .get('/product_position', { params })
        .then((payload) => {
          // console.log(payload);
          // return;
          let { list } = payload;

          // 渲染的规格有几个
          formDataObj.value.skus = list.map((item) => {
            const name = item.name;
            const price = undefined;
            return { name, price };
          });
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

    // 点击添加skus
    const addSkus = () => {
      formDataObj.value.skus.push({
        name: '',
        price: null,
      });
    };
    // 点击删除skus
    const delSkus = (index) => {
      formDataObj.value.skus.splice(index, 1);
    };

    // 监听商品类型，获取对应类型的部位
    watch(
      () => productType.value,
      (newVal) => {
        if (newVal) getSkusList(newVal);
      }
    );
    watch(
      () => imgData.value.coverImg.length === 0,
      (newVal) => {
        if (newVal) {
          imgData.value.banners.length = 0;
        }
        ;
      }
    );

    // 监听规格部位不能重复
    watch(
      () => formDataObj.value.skus,
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

    // needs to be called in setup()
    useMeta(metaData);

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
      productType,
      propertyList,
      saleStatusList,
      addSkus,
      delSkus,
      onSumbit,
      allStore,
      imgData

    };
  },
};
</script>
