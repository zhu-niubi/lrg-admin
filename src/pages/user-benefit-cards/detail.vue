<template>
  <q-page class="q-pa-md" v-if="formDataObj">
    <q-toolbar class="q-py-md">
      <q-toolbar-title>权益卡详情</q-toolbar-title>

    </q-toolbar>

    <q-card flat>
      <q-toolbar class="q-py-md">
        <q-toolbar-title>
          <div>
            <q-chip>权益卡号：{{ formDataObj.code }}</q-chip>
          </div>
          <div class="text-body2 flex items-center q-gutter-lg q-py-sm">
            <span>用户昵称：{{ formDataObj.userName }}</span>
            <span>用户ID：{{ formDataObj.userId }}</span>
          </div>
          <div class="text-body2 flex items-center q-gutter-lg q-py-sm">
            <span>发放门店：{{ formDataObj.storeName }}</span>
            <span>权益卡名称：{{ formDataObj.productPackName }}</span>

          </div>
          <span>包含内容：</span>
          <div class="text-body2 flex items-center q-gutter-lg q-py-sm" v-for="(product, index) in formDataObj.products" :key="index">
            <span>产品ID：{{ product.productId }}</span>
            <span>产品名称：{{ product.productName }}</span>
            <span>数量：{{ product.quantity }}</span>

          </div>
        </q-toolbar-title>
      </q-toolbar>

      <q-card-section class="text-grey">

        <div
          class="text-body2 q-gutter-md q-py-sm"
        >
          <div class="q-pa-md">
            <PhotoswipeComponent
              title="权益卡封面"
              :items="formDataObj.productPackPictrue"
            />
          </div>
        </div>

        <div
          class="text-body2 flex items-center q-gutter-lg q-py-md text-black"
        >
          <span>订单创建时间：{{ formDataObj.createdAt }}</span>
          <span>权益卡过期时间：{{ formDataObj.deadline }}</span>
        </div>


        <div
          class="text-body2 flex items-center q-gutter-lg q-py-sm"
          v-if="formDataObj.memo"
        >
          <span>描述：{{ formDataObj.memo }}</span>
        </div>
      </q-card-section>
      <q-table
        flat
        title="详细内容"
        :rows="rows"
        :columns="columns"

        row-key="id">
      </q-table>
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
  title: '权益卡详情',
};

export default defineComponent({
  name: 'user-benefit-cards-detail',

  components: {

    PhotoswipeComponent,
  },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const { id } = $route.params;

    const formDataObj = ref();
    const columns = ref([
      {
        name: '#',
        required: true,
        align: 'left',
        label: '#',
        field: '#',
        format: (val) => `${val}`, // 将行号显示为"#1", "#2", ...
      },
      {
        name: 'productName',
        required: true,
        align: 'left',
        label: '名称',
        field: 'productName',
      },
      {
        name: 'code',
        required: true,
        align: 'left',
        label: '编号',
        field: 'code',
      },
      {
        name: 'status',
        required: true,
        align: 'left',
        label: '使用状态',
        field: 'status',
      },
    ]);
    let rows = [];


    const loadData = () => {
      console.log('id',id)
      api
        .get(`/user-product-pack/${id}`)
        .then((payload) => {
          // console.log(payload);
          if (payload.userCoupon.length > 0 && payload.products.length > 0){
            // 遍历userCoupon数组，处理每个元素并添加到rows数组中
            payload.userCoupon.forEach((coupon, index) => {
              // 根据productId查找对应的产品名称
              const product = payload.products.find(p => p.productId === coupon.productId);

              // 创建行数据
              const row = {
                '#': index + 1,
                'productName': product ? product.productName : '未知产品',
                'code': coupon.code,
                'status': coupon.status === 1 ? '未使用' : '已使用',
              };

              // 添加行数据到rows数组
              rows.push(row);
            });
          }
          if (payload.createdAt){
            payload.createdAt = date.formatDate(
              payload.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );
          }
         if (payload.deadline){
           payload.deadline = date.formatDate(
             payload.deadline * 1000,
             'YYYY-MM-DD HH:mm:ss'
           )
         }
         console.log('payload',payload.productPackPictrue)
            payload.productPackPictrue = [payload.productPackPictrue];
          formDataObj.value = { ...payload };
          console.log(payload);
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
      columns,
      rows,
    };
  },
});
</script>
<style lang="scss" scoped></style>
