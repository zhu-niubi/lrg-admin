<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>添加权益卡/商品包</q-toolbar-title>
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
          <div class="col-xs-12 col-sm-3">
            <q-card-section>
              <div class="q-pa-md">
                <div class="q-gutter-sm">
                  <q-radio v-model="formDataObj.type" val=1 label="商品包"/>
                  <q-radio v-model="formDataObj.type" val=2 label="权益卡"/>
                </div>
              </div>
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input
                label="名称 *"
                v-model="formDataObj.name"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input
                type="number"
                label="有效期（天） *"
                v-model="formDataObj.deadlineDay"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>

          <q-card-section>
            <span>适用门店 *</span>
            <q-toggle v-model="allStore" keep-color label="全部门店"/>
            <CheckboxComponent
              v-if="!allStore"
              v-model="formDataObj.applyStore"
              baseUrl="/store"
              isNoClickAll="true"
            />
          </q-card-section>


          <div class="col-12" v-if="formDataObj.applyStore">
            <q-card-section>
              <q-card flat bordered>
                <q-toolbar>
                  <div class="subTitle">
                    关联卡券/商品
                  </div>
                </q-toolbar>
                <div
                  v-for="(item, index) in formDataObj.products"
                  :key="index"
                >
                  <div class="q-px-md row q-col-gutter-md">
                    <div class="col-xs-12 col-sm-3">
                      <q-card-section>
                        <GoodsOption
                          title="商品名称 *"
                          v-model="item.productId"
                          baseUrl="/product"
                          type="2"
                        />
                      </q-card-section>
                    </div>
                    <div class="col-xs-12 col-sm-3">
                      <q-card-section>
                        <q-input
                          type="number"
                          label="数量 *"
                          v-model="item.quantity"
                          lazy-rules
                          :rules="[
                            (val) => (val && val.length > 0) || 'Please type something',
                          ]"
                        />
                      </q-card-section>
                    </div>
                    <div class="col-xs-12 col-sm-3">
                      <q-card-section>
                        <q-select
                          label='规格 *'
                          v-model="item.skuId"
                          :options="skuVal"
                        >
                        </q-select>
                      </q-card-section>
                    </div>

                    <div class="col-xs-12 col-sm-2 flex items-center">
                      <q-btn
                        label="删除"
                        flat
                        color="grey"
                        @click="delItem(index)"
                      />
                    </div>
                  </div>
                </div>
                <div class="text-center">
                  <q-btn round icon="las la-plus" @click="addItem"/>
                </div>
              </q-card>
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input
                label="单价 *"
                v-model="formDataObj.price"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>

          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <GoodsOption
                title="售卖状态 *"
                v-model="formDataObj.saleStatus"
                :optionsVal="saleStatusList"
              />
            </q-card-section>
          </div>
        </div>


        <q-card-section>
          <UploadImgComponent
            title="商品包/权益卡封面 * （推荐尺寸：340*170）"
            :modelValue="formDataObj.pictrue || []"
            @update:modelValue="newValue => formDataObj.pictrue = newValue"
          />
        </q-card-section>

        <q-card-section>
          <q-editor
            placeholder="权益卡描述 *"
            v-model="formDataObj.memo"
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
  onUpdated,
  getCurrentInstance,
} from 'vue';
import {useBaseStore} from 'stores/base';
import {useQuasar, useMeta, date} from 'quasar';

import {api} from 'boot/axios';

import GoodsOption from 'components/GoodsOption.vue';
import UploadImgComponent from 'components/UploadImgComponent.vue';
import DateTimeComponent from 'components/DateTimeComponent.vue';
import CheckboxComponent from 'components/CheckboxComponent.vue';


import _ from 'lodash';

const metaData = {
  // sets document title
  title: '添加权益卡',
};

export default {
  name: 'benefit-card-new',

  components: {GoodsOption, UploadImgComponent, CheckboxComponent},

  setup() {


    const {proxy} = getCurrentInstance();
    const $q = useQuasar();
    const store = useBaseStore();

    const myForm = ref(null);
    const allStore = ref(false);


    const formDataObj = ref({
      name: '',
      price: null,
      type: null,
      saleStatus: null,
      deadlineDay: null,
      pictrue: '',
      memo: '',
      products: [],
      applyStore: null,
    });


    const storeList = ref(null);

    // 售卖状态
    const saleStatusList = ref([
      {value: 1, label: '售卖中'},
      {value: 0, label: '积分兑换'},
    ]);

    //
    const loadData = () => {
      2;
    };

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/product-pack', data)
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


          bodyData.type = parseFloat(bodyData.type);

          bodyData.products = bodyData.products.reduce((acc, product) => {
            if (product.productId !== null && product.quantity !== null && product.skuId !== null) {
              acc.push({
                productId: product.productId,
                quantity: parseFloat(product.quantity),
                productSkuId: product.skuId.value,
              });
            }
            return acc;
          }, []);


          if (bodyData.pictrue && bodyData.pictrue.length > 0) {
            bodyData.pictrue = bodyData.pictrue[0].url;
          }

          bodyData.price = bodyData.price
            ? parseFloat((bodyData.price * 100).toFixed(2))
            : undefined;

          bodyData.applyStore = allStore.value ? [0] : Object.values(bodyData.applyStore);

          bodyData.deadlineDay = bodyData.deadlineDay ? Number(bodyData.deadlineDay) : undefined;

          console.log('bodyData', bodyData);

          if (
            !bodyData ||
            !bodyData.name ||
            !bodyData.price ||
            !bodyData.type ||
            bodyData.saleStatus == undefined ||
            !bodyData.deadlineDay ||
            !bodyData.memo ||
            !bodyData.pictrue
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
    const delItem = (index) => {
      formDataObj.value.products.splice(index, 1);
    };
    const addItem = () => {
      formDataObj.value.products.push({
        productId: null,
        quantity: null,
        skuId: null
      });
    };

    //规格
    const processedProducts = ref([]);
    const selectedProductId = ref('');
    let skuVal = ref([{
      value: null,
      label: null
    }]);

    watch(() => formDataObj.value.products, (newVal) => {
      // console.log(newVal)
      if (newVal) {
        processedProducts.value = newVal.map((i) => {
          const newItem = {...i};
          console.log('newItem1', newItem)
          if (newItem.productId) {
            api
              .get(`/product/${newItem.productId}`)
              .then((payload) => {
                console.log('payload', payload)
                newItem.productSku = payload?.productSku
                console.log('newItem2', newItem)
              })
          }

          processedProducts.value.forEach((product) => {
            const {productSku} = product;
            console.log('productSku', productSku)
            skuVal.value = productSku?.map((sku) => {
              const {id, name} = sku
              return {
                value: id,
                label: name
              }
            });
            console.log('skuVal', skuVal)

          })
          console.log('processedProducts', processedProducts.value);

          // newItem.productSku = {id: 11111};
          return newItem;
        });

      }
    }, {deep: true})

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
      storeList,

      saleStatusList,
      delItem,
      onSumbit,
      addItem,
      allStore,
      selectedProductId,
      processedProducts,
      skuVal,

    };
  },
};
</script>
