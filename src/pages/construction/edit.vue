<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改施工单</q-toolbar-title>
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

        <q-card-section>
          <TreeSelect
            title="施工产品 *"
            v-model="productList"
            baseUrl="/product_type"
            disabled="true"
          />
        </q-card-section>

        <q-card-section v-if="productList.length > 0">
          <div v-for="(proItem, proIndex) in productList" :key="proIndex">
            <CheckboxComponent
              :title="proItem.label + '施工部位：*'"
              v-model="proItem.constructionPart"
              :baseUrl="'/product/' + proItem.value.split('-')[2]"
              optionKey="productSku"
              :optionData="proItem.newConstructionPart"
              isNoClickAll="true"
              disable
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
            isNoClickAll="true"
            title="缺陷原因"
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
} from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar, useMeta, date } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'boot/axios';

import UploadImgComponent from 'components/UploadImgComponent.vue';
import GoodsOption from 'components/GoodsOption.vue';
import DateTimeComponent from 'components/DateTimeComponent.vue';
import CheckboxComponent from 'components/CheckboxComponent.vue';
import SelectInputFiler from 'components/SelectInputFiler.vue';
import TreeSelect from 'components/TreeSelect.vue';

const metaData = {
  // sets document title
  title: '修改施工单',
};

export default {
  name: 'construction-edit',

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
    const $route = useRoute();

    const { id } = $route.params;

    const formDataObj = ref();
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

    // 商品系列
    const productList = ref(null);

    const myForm = ref(null);

    const loadData = () => {
      api
        .get(`/construction/${id}`)
        .then((payload) => {
          // console.log(payload);

          // 汽车id
          let userCarId = payload.userCarId;
          payload.userCarId = {};
          payload.userCarId.value = userCarId;
          payload.userCarId.label =
            '车型：' +
            payload.carBrandName +
            payload.carName +
            ' 车牌号：' +
            payload.carNumber;

          payload.expectComplete = date.formatDate(
            payload.expectComplete * 1000,
            'YYYY-MM-DD HH:mm:ss'
          );

          if (payload.defectImages && payload.defectImages.length > 0) {
            console.log('payload.defectImages', payload.defectImages);
            let newImgList = [];
            for (var key in payload.defectImages) {
              let list = {};
              list.url = payload.defectImages[key];
              newImgList.push(list);
            }
            payload.defectImages = newImgList;
          }

          // 施工产品
          let keyInx = {},
            constructionSku = [...payload.constructionSku];
          // console.log(constructionSku);
          for (var i = 0; i < constructionSku.length; i++) {
            var id = constructionSku[i].productId;
            constructionSku[i].productPosition = [
              {
                id: constructionSku[i].id,
                status: 1,
                label: constructionSku[i].productSkuName,
                productSkuId: constructionSku[i].productSkuId,
                productSkuName: constructionSku[i].productSkuName,
                productId: constructionSku[i].productId,
                employeeId: {
                  value: constructionSku[i].employeeId,
                  label: constructionSku[i].employeeId
                    ? constructionSku[i].employeeId +
                      ' ' +
                      constructionSku[i].employeeName
                    : null,
                },
                rollId: {
                  value: constructionSku[i].rollId,
                  label: constructionSku[i].rollId
                    ? constructionSku[i].rollNumber +
                      ' ' +
                      constructionSku[i].productName
                    : null,
                },

                length: constructionSku[i].length,
              },
            ];

            if (keyInx[id] >= 0) {
              var product1 = constructionSku[i].productPosition;
              var product2 = constructionSku[keyInx[id]].productPosition;
              constructionSku[keyInx[id]].productPosition =
                product1.concat(product2);
              constructionSku.splice(i, 1);
              i--;
            } else {
              keyInx[id] = i;
            }
          }
          payload.newconstructionSku = constructionSku;

          let proList = [];
          payload.newconstructionSku.map((n) => {
            let newObj = {};
            newObj.value =
              n.productTypeId + '-' + n.productModelId + '-' + n.productId;
            newObj.label = n.productName;

            // 施工部位

            newObj.newConstructionPart = n.productPosition;

            let constructionPart = [];
            n.productPosition.map((p) => {
              constructionPart.push(p.productSkuId);
            });
            newObj.constructionPart = constructionPart;

            proList.push(newObj);
          });
          productList.value = proList;

          // console.log(payload);
          // console.log(productList.value);

          formDataObj.value = { ...payload };
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
        .put(`/construction/${id}`, data)
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

          newBodyData.userCarId = bodyData.userCarId
            ? bodyData.userCarId.value
            : '';

          newBodyData.kilometer = bodyData.kilometer
            ? Number(bodyData.kilometer)
            : '';

          newBodyData.defectPart =
            bodyData.defectPart.length > 0
              ? bodyData.defectPart.toString()
              : '';

          newBodyData.defectType =
            bodyData.defectType.length > 0
              ? bodyData.defectType.toString()
              : '';

          newBodyData.defectImages = bodyData.defectImages
            ? bodyData.defectImages
            : '';

          newBodyData.expectComplete = bodyData.expectComplete
            ? Number(new Date(bodyData.expectComplete)) / 1000
            : undefined;

          newBodyData.storeId = bodyData.storeId
            ? Number(bodyData.storeId)
            : '';

          newBodyData.memo = bodyData.memo ? bodyData.memo : '';

          // 施工部位

          if (productList.value.length > 0) {
            let activeList = productList.value;
            // console.log(activeList);

            let map = {},
              dest = [],
              newConstructionPart = [];

            for (let i = 0; i < activeList.length; i++) {
              let ai = activeList[i];

              if (ai.constructionPart && ai.constructionPart.length > 0) {
                ai.constructionPart.map((n) => {
                  let res = ai.newConstructionPart.findIndex((v) => {
                    return v.productSkuId === n;
                  });

                  if (res == -1) {
                    ai.newConstructionPart.push({
                      productSkuId: n,
                      productId: Number(ai.value.split('-')[2]),
                    });
                  }
                });

                if (!map[ai.value.split('-')[0]]) {
                  dest.push({
                    value: ai.value,
                    label: ai.label,
                    constructionPart: ai.constructionPart,
                    newConstructionPart: ai.newConstructionPart,
                  });
                  map[ai.value.split('-')[0]] = ai;
                } else {
                  for (let j = 0; j < dest.length; j++) {
                    let dj = dest[j];
                    if (dj.value.split('-')[0] == ai.value.split('-')[0]) {
                      dj.constructionPart = dj.constructionPart.concat(
                        ai.constructionPart
                      );
                      dj.newConstructionPart = dj.newConstructionPart.concat(
                        ai.newConstructionPart
                      );
                      break;
                    }
                  }
                }

                // console.log(dest);
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
                c.newConstructionPart.map((o) => {
                  let partObj = {};
                  partObj.id = o.id;
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

            newBodyData.constructionSku = newConstructionPart;
          }

          console.log(newBodyData);
          // return;

          if (
            !newBodyData ||
            !newBodyData.userCarId ||
            !newBodyData.kilometer ||
            newBodyData.constructionSku.length <= 0 ||
            newBodyData.defectPart === undefined ||
            newBodyData.defectType === undefined ||
            !newBodyData.expectComplete ||
            !newBodyData.storeId
          ) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '数据输入不完整!',
              icon: 'las la-bug',
            });

            return;
          } else {
            if (bodyData.defectImages && bodyData.defectImages.length > 0) {
              let newImages = [];
              bodyData.defectImages.map((img) => {
                newImages.push(img.url);
              });

              newBodyData.defectImages = newImages;
            }

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
