<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>创建施工单</q-toolbar-title>
    </q-toolbar>

    <q-card flat v-if="formDataObj">
      <q-form
        ref="myForm"
        autocorrect="off"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      >
        <q-card-section>
          <SelectInputFiler
            title="用户汽车 *(请输入手机号/车牌号/车架号)"
            v-model="formDataObj.userCarId"
            baseUrl="/user_car"
            searchName="keyword"
          />
        </q-card-section>

        <q-card-section>
          <q-input
            label="公里数 *"
            v-model="formDataObj.kilometer"
            :rules="[
              (val) =>
                (val && val.toString().length > 0) || 'Please type something',
            ]"
          />
        </q-card-section>

        <!-- :rules="[
              (val) =>
                (val && val.toString().length > 0) || 'Please type something',
            ]" -->

        <!-- <q-card-section>
          <q-input
            label="订单号 *"
            v-model="formDataObj.orderNumber"
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />
        </q-card-section> -->

        <q-card-section>
          <TreeSelect
            title="施工产品 *"
            v-model="productList"
            baseUrl="/product_type"
          />
        </q-card-section>

        <q-card-section v-if="productList.length > 0">
          <div v-for="(proItem, proIndex) in productList" :key="proIndex">
            <CheckboxComponent
              :title="proItem.label + '施工部位：*'"
              v-model="proItem.constructionPart"
              :baseUrl="'/product/' + proItem.value.split('-')[2]"
              optionKey="productSku"
              isDataObject="true"
            />
          </div>
        </q-card-section>

        <q-card-section>
          <CheckboxComponent
            title="缺陷部位"
            v-model="formDataObj.defectPart"
            :optionsVal="defectPartList"
          />
        </q-card-section>

        <q-card-section>
          <UploadImgComponent
            title="缺陷图片"
            v-model="formDataObj.defectImages"
          />
        </q-card-section>

        <q-card-section>
          <CheckboxComponent
            title="缺陷原因"
            isNoClickAll="true"
            v-model="formDataObj.defectType"
            :optionsVal="defectTypeList"
          />
        </q-card-section>

        <q-card-section>
          <DateTimeComponent
            title="预计完成时间 *"
            v-model="formDataObj.expectComplete"
          />
        </q-card-section>

        <q-card-section>
          <GoodsOption
            title="门店 *"
            v-model="formDataObj.storeId"
            baseUrl="/store"
          />
        </q-card-section>

        <q-card-section>
          <q-editor
            placeholder="请填写相应的备注说明"
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
  onMounted,
  onBeforeUnmount,
  watch,
} from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar, useMeta, date } from 'quasar';

import { api } from 'boot/axios';

import UploadImgComponent from 'components/UploadImgComponent.vue';
import GoodsOption from 'components/GoodsOption.vue';
import DateTimeComponent from 'components/DateTimeComponent.vue';
import CheckboxComponent from 'components/CheckboxComponent.vue';
import TreeSelect from 'components/TreeSelect.vue';
import SelectInputFiler from 'components/SelectInputFiler.vue';

const metaData = {
  // sets document title
  title: '创建施工单',
};

export default {
  name: 'construction-new',

  components: {
    UploadImgComponent,
    GoodsOption,
    DateTimeComponent,
    CheckboxComponent,
    SelectInputFiler,
    TreeSelect,
  },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();

    const myForm = ref(null);
    const formDataObj = ref(null);

    // 缺陷部位
    const defectPartList = ref([
      { label: '引擎盖', value: 1 },
      { label: '前保险杠', value: 2 },
      { label: '后保险杠', value: 3 },
      { label: '车顶', value: 4 },
      { label: '后翼', value: 5 },
      { label: '后盖箱', value: 6 },
      { label: '左前翼子板', value: 7 },
      { label: '右前翼子板', value: 8 },
      { label: '左后翼子板', value: 9 },
      { label: '右后翼子板', value: 10 },
      { label: '左后视镜', value: 11 },
      { label: '右后视镜', value: 12 },
      { label: '前左侧门', value: 13 },
      { label: '后左侧门', value: 14 },
      { label: '右前门', value: 15 },
      { label: '右后门', value: 16 },
      { label: '仪表号', value: 17 },
      { label: '车灯', value: 18 },
      { label: '座椅', value: 19 },
      { label: '车窗', value: 20 },
    ]);

    // 缺陷原因
    const defectTypeList = ref([
      { label: '划痕', value: 1 },
      { label: '凹凸', value: 2 },
      { label: '脱漆', value: 3 },
      { label: '破损', value: 4 },
      { label: '补漆', value: 5 },
    ]);

    // 商品类型
    const productList = ref([]);

    //
    const loadData = () => {
      formDataObj.value = {
        userCarId: null,
        kilometer: null,
        orderNumber: null,
        constructionSku: [],
        defectPart: [],
        defectType: [],
        expectComplete: null,
        storeId: null,
        defectImages: [],
        memo: '',
      };
    };

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/construction', data)
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

          bodyData.userCarId = bodyData.userCarId
            ? bodyData.userCarId.value
            : '';

          bodyData.kilometer = bodyData.kilometer
            ? Number(bodyData.kilometer)
            : '';

          // bodyData.orderNumber = bodyData.orderNumber
          //   ? bodyData.orderNumber.toString()
          //   : '';
          bodyData.orderNumber = undefined;

          bodyData.defectPart =
            bodyData.defectPart.length > 0
              ? bodyData.defectPart.toString()
              : '';

          bodyData.defectType =
            bodyData.defectType.length > 0
              ? bodyData.defectType.toString()
              : '';

          bodyData.defectImages = bodyData.defectImages
            ? bodyData.defectImages
            : '';

          bodyData.expectComplete = bodyData.expectComplete
            ? Number(new Date(bodyData.expectComplete)) / 1000
            : undefined;

          // 施工部位
          console.log(productList.value);
          if (productList.value.length > 0) {
            let activeList = productList.value;

            let map = {},
              dest = [],
              newConstructionPart = [];

            for (let i = 0; i < activeList.length; i++) {
              let ai = activeList[i];
              if (ai.constructionPart && ai.constructionPart.length > 0) {
                // 如果是全选那么把全部的部位值渲染出来

                let partNumberlist = [];

                let isAll = false;
                ai.constructionPart.map((a) => {
                  a.productSkuId = a.value;
                  if (!Number(a.value)) {
                    let partNumber = a.value.toString().split(',');
                    if (partNumber.length > 1) {
                      partNumberlist = partNumber.map((part) => {
                        const productSkuId = part;
                        return {
                          ...ai.constructionPart[0],
                          productSkuId,
                        };
                      });
                    }
                    isAll = true;
                  } else if (!isAll) {
                    partNumberlist.push(a);
                  }
                });

                ai.constructionPart = [...partNumberlist];

                if (!map[ai.value.split('-')[0]]) {
                  dest.push({
                    value: ai.value,
                    label: ai.label,
                    constructionPart: ai.constructionPart,
                  });
                  map[ai.value.split('-')[0]] = ai;
                } else {
                  for (let j = 0; j < dest.length; j++) {
                    let dj = dest[j];
                    if (dj.value.split('-')[0] == ai.value.split('-')[0]) {
                      dj.constructionPart = dj.constructionPart.concat(
                        ai.constructionPart
                      );
                      break;
                    }
                  }
                }

                console.log(dest);
              } else {
                $q.notify({
                  color: 'negative',
                  position: 'top',
                  message: '施工部位不能为空!',
                  icon: 'las la-bug',
                });

                return;
              }
            }

            activeList.map((c) => {
              if (c.constructionPart && c.constructionPart.length > 0) {
                c.constructionPart.map((o) => {
                  let partObj = {};

                  partObj.rollId = o.rollId?.value
                    ? Number(o.rollId?.value)
                    : undefined;
                  partObj.length = Number(o.length) || undefined;
                  partObj.employeeId = o.employeeId?.value
                    ? Number(o.employeeId?.value)
                    : undefined;
                  partObj.productSkuId = Number(o.productSkuId);

                  newConstructionPart.push(partObj);
                });
              }
            });

            console.log(newConstructionPart);
            bodyData.constructionSku = newConstructionPart;
          }

          console.log(bodyData);
          // return;
          if (
            !bodyData ||
            !bodyData.userCarId ||
            !bodyData.kilometer ||
            // !bodyData.orderNumber ||
            bodyData.defectPart === undefined ||
            bodyData.defectType === undefined ||
            !bodyData.expectComplete ||
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

          if (bodyData.defectImages && bodyData.defectImages.length > 0) {
            let newImages = [];
            bodyData.defectImages.map((img) => {
              newImages.push(img.url);
            });

            bodyData.defectImages = newImages;
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
      defectPartList,
      defectTypeList,
      myForm,
      productList,
      formDataObj,
      onSumbit,
    };
  },
};
</script>
