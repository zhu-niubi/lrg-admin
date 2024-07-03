<template>
  <q-page class="q-pa-md" v-if="formDataObj">
    <q-toolbar class="q-py-md">
      <q-toolbar-title>施工单详情</q-toolbar-title>

      <div>
        <q-btn flat round color="grey" icon="las la-edit" :to="`/construction/${formDataObj.id}/edit`" />
      </div>
    </q-toolbar>

    <q-card flat>
      <q-toolbar class="q-py-md">
        <q-toolbar-title>
          <div>
            <q-chip>施工单号：{{ formDataObj.code }}</q-chip>
          </div>
          <div class="text-body2 flex items-center q-gutter-lg q-py-sm">
            <span>车主姓名：{{ formDataObj.userName }}</span>
            <span>手机号：{{ formDataObj.phoneNumber }}</span>
          </div>

          <div class="flex justify-start items-center q-gutter-md text-h6 q-py-sm">
            <span class="text-primary">汽车品牌：{{ formDataObj.carBrandName }}</span>
            <q-icon name="las la-arrows-alt-h" color="grey" size="16px" />
            <span>汽车型号：{{ formDataObj.carName }}</span>
          </div>

          <div class="text-body2 flex items-center q-gutter-lg q-py-sm">
            <span>车牌号：{{ formDataObj.carNumber }}</span>
            <span>公里数：{{ formDataObj.kilometer }}</span>
          </div>
        </q-toolbar-title>
      </q-toolbar>

      <q-card-section class="text-grey">
        <div class="text-body2 flex items-center q-gutter-lg q-py-md text-black">
          <span>门店：{{ formDataObj.storeName }}</span>
          <span>预计完成时间：{{ formDataObj.expectComplete }}</span>
        </div>

        <div class="q-py-lg q-gutter-md text-black">
          <span v-show="formDataObj.warrantyCode">
            质保单号：{{ formDataObj.warrantyCode }}
          </span>
          <!-- <span v-show="formDataObj.deadline">
            质保截止时间：{{ formDataObj.deadline }}
          </span> -->
        </div>

        <div v-for="(itemProType, indexProType) in formDataObj.newconstructionSku" :key="indexProType"
          class="text-body2 q-gutter-md q-py-md">
          <div class="text-black">
            <span class="q-pr-md">产品类型：{{ itemProType.productTypeName }}</span>
            <span class="q-pr-md">产品系列：{{ itemProType.productModelName }}</span>
            <span class="q-pr-md">施工产品：<q-chip color="orange" v-if="itemProType.productName">{{ itemProType.productName
                }}</q-chip></span>
            <span class="q-pr-md">质保年限：<q-chip color="red" v-if="itemProType.warrantyYear">{{ itemProType.warrantyYear
                }}</q-chip></span>
          </div>

          <!-- <div v-else class="text-red">商品还未绑定膜卷号！</div> -->

          <div v-for="(itemPosition, indexPosition) in itemProType.productPosition" :key="indexPosition"
            class="flex items-center q-gutter-sm">
            <span class="text-black" style="width: 4%;">{{ itemPosition.productSkuName }}:</span>
            <div v-if="itemPosition.rollNumber">
              <q-chip color="teal">膜卷:{{ itemPosition.rollNumber }}</q-chip>
            </div>

            <q-chip color="green" v-if="itemPosition.length">消耗米数：{{ itemPosition.length }}</q-chip>
            <q-chip v-if="itemPosition.employeeName">技师：{{ itemPosition.employeeName }}</q-chip>
          </div>
        </div>

        <div class="text-body2 flex items-center q-gutter-md q-py-sm">
          <CheckboxComponent v-if="formDataObj.productTypeId" title="施工部位" v-model="formDataObj.constructionPart"
            :baseUrl="'/product_position?productTypeId=' + formDataObj.productTypeId
              " disable />
        </div>

        <div class="text-body2 flex items-center q-gutter-md q-py-sm">
          <CheckboxComponent title="缺陷部位" v-model="formDataObj.defectPart" :optionsVal="defectPartList" disable />
        </div>

        <div class="text-body2 q-gutter-md q-py-sm" v-if="formDataObj.defectImages.length > 0">
          <div class="q-pa-md">
            <PhotoswipeComponent title="缺陷图片" :items="formDataObj.defectImages" />
          </div>
        </div>

        <div class="text-body2 flex items-center q-gutter-md q-py-sm">
          <CheckboxComponent title="缺陷原因" isNoClickAll="true" v-model="formDataObj.defectType"
            :optionsVal="defectTypeList" disable />
        </div>

        <div class="text-body2 flex items-center q-gutter-lg q-py-sm" v-if="formDataObj.memo">
          <span>备注：{{ formDataObj.memo }}</span>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  defineComponent,
  reactive,
  toRefs,
} from 'vue';
import { useBaseStore } from 'stores/base';
import { useRoute } from 'vue-router';
import { useQuasar, useMeta, date } from 'quasar';
import { api } from 'boot/axios';

import CheckboxComponent from 'components/CheckboxComponent.vue';
import RadioOption from 'components/RadioOption.vue';
import PhotoswipeComponent from 'components/PhotoswipeComponent.vue';

const metaData = {
  // sets document title
  title: '施工单详情',
};

export default defineComponent({
  name: 'construction-detail',

  components: {
    CheckboxComponent,
    PhotoswipeComponent,
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

    const loadData = () => {
      api
        .get(`/construction/${id}`)
        .then((payload) => {
          // console.log(payload);

          payload.expectComplete = date.formatDate(
            payload.expectComplete * 1000,
            'YYYY-MM-DD HH:mm:ss'
          );

          payload.deadline = date.formatDate(
            payload.deadline * 1000,
            'YYYY-MM-DD HH:mm:ss'
          );

          // 施工部位
          let constructionSku = [...payload.constructionSku];

          let keyInx = {};
          for (var i = 0; i < constructionSku.length; i++) {
            var id = constructionSku[i].productId;
            constructionSku[i].productPosition = [
              {
                // productPositionId: constructionSku[i].productPositionId,

                productSkuName: constructionSku[i].productSkuName,
                rollNumber: constructionSku[i].rollNumber,
                employeeName: constructionSku[i].employeeName,
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

          formDataObj.value = { ...payload };
          console.log(formDataObj.value);
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

    // needs to be called in setup()
    useMeta(metaData);

    //
    onMounted(() => {
      loadData();
    });

    return {
      formDataObj,
      defectPartList,
      defectTypeList,
    };
  },
});
</script>
<style lang="scss" scoped></style>
