<template>
  <q-page class="q-pa-md" v-if="formDataObj">
    <q-toolbar class="q-py-md">
      <q-toolbar-title>订单详细</q-toolbar-title>

      <div>
        <q-btn
          flat
          round
          color="grey"
          icon="las la-edit"
          :to="`/order/${formDataObj.id}/edit`"
        />
      </div>
    </q-toolbar>
    <div class="computeArea">

      <q-card class="compute">
        <div class="price">
          订单金额（元）：40

        </div>
      </q-card>
      <q-card class="compute">
        <div class="price">
          优惠金额（元）：-22

        </div>
        <div class="priceDiscount">
          折扣金额（12元）+支付优惠（0元）+积分抵扣（10元）
        </div>
      </q-card>
      <q-card class="compute">
        <div class="price">
          订单收入（元）：+30

        </div>
      </q-card>
    </div>

    <q-card flat>
      <q-toolbar class="q-py-md">
        <q-toolbar-title>
          <div
            class="flex justify-start items-center q-gutter-md text-h6 q-py-sm"
          >
            <span>订单号：{{ formDataObj.orderNumber }}</span>
            <q-chip color="orange">{{
                formDataObj.status === 0
                  ? '交易关闭'
                  : formDataObj.status === 1
                    ? '正常'
                    : formDataObj.status === 2
                      ? '已退款'
                      : '交易完成'
              }}
            </q-chip>
          </div>
          <div class="textArea">
            <div class="text1">订单来源：门店消费/美团/大众点评</div>
            <div class="text">用户ID：{{ formDataObj.userId }}</div>
            <div class="text">用户昵称：{{ formDataObj.userName }}</div>
          </div>

          <div class="text-body2 flex items-center q-gutter-lg q-py-sm">
            <span
            >支付阶段：<q-chip>{{
                `${
                  formDataObj.payStage == 0
                    ? '等待支付全额'
                    : formDataObj.payStage == 1
                      ? ' 等待支付定金 '
                    : formDataObj.payStage == 2
                    ? '等待支付尾款 '
                    : '完成支付'
                }`
              }}</q-chip></span
            >
          </div>
          <div class="text-body2 flex items-center q-gutter-lg q-py-sm">
            <span>支付门店：{{ formDataObj.storeName }}</span>
          </div>
        </q-toolbar-title>
      </q-toolbar>


      <q-card-section
        class="text-grey"
        v-for="(item, index) in formDataObj.orderSku"
        :key="index"
      >
        <div class="text-body2 flex items-center q-gutter-md q-py-sm">
          <span>子订单号:{{ item.orderSkuNumber }}</span>
          <span>商品名称：{{ item.productName }}</span>
          <span>商品规格：{{ item.productSkuName }}</span>
          <span>商品数量：{{ item.productCount }}</span>
        </div>

        <div class="text-body2 flex items-center q-gutter-lg q-py-sm">
          <span
            >订单金额：{{
              parseFloat(item.productSkuPrice / 100).toFixed(2) || 0
            }}</span
          >
          <span
            >实际支付金额：<span class="text-red">{{
              parseFloat(item.amount / 100).toFixed(2) || 0
            }}</span></span
          >
        </div>

        <div class="q-pa-md">
          <PhotoswipeComponent title="商品图片" :items="item.productBanner" />
        </div>

        <div class="text-body2 flex items-center q-gutter-lg q-py-sm">
          <span>订单创建时间：{{ formDataObj.createdAt }}</span>
        </div>
      </q-card-section>
      <q-card-section>
        <div
          v-for="(item, index) in formDataObj.payment"
          :key="index"
          class="text-body2 flex items-center q-gutter-lg q-py-sm"
        >
          <span>账单ID：{{ item.id }}</span>
          <span>账单金额：{{ parseFloat(item.amount / 100).toFixed(2) }}</span>

          <span
            >账单类型：{{
              `${
                item.billType == 1
                  ? '全额支付'
                  : item.billType == 2
                  ? '定金'
                  : '尾款'
              }`
            }}</span
          >
          <span
            >付款方式：{{ item.paymentMethods == 1 ? '微信' : '支付宝' }}</span
          >
          <span
            >支付状态：{{ item.payStatus == 0 ? ' 未支付' : '已支付' }}</span
          >
        </div>
        <div
          v-if="formDataObj.deadline"
          class="text-body2 flex items-center q-gutter-lg q-py-sm"
        >
          <span>截止支付时间：{{ formDataObj.deadline }}</span>
        </div>
        <div
          v-if="formDataObj.deleteReason"
          class="text-body2 flex items-center q-gutter-lg q-py-sm"
        >
          <span>取消订单原因：{{ formDataObj.deleteReason }}</span>
        </div>

        <div
          v-if="formDataObj.memo"
          class="text-body2 flex items-center q-gutter-lg q-py-sm"
        >
          <span>备注：{{ formDataObj.memo }}</span>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted, defineComponent } from 'vue';
import { useBaseStore } from 'stores/base';
import { useRoute } from 'vue-router';
import { useQuasar, useMeta, date } from 'quasar';
import { api } from 'boot/axios';
import PhotoswipeComponent from 'components/PhotoswipeComponent.vue';

const metaData = {
  title: '订单详细',
};

export default defineComponent({
  name: 'order-detail',

  components: {
    PhotoswipeComponent,
  },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const { id } = $route.params;

    const isDialog = ref(false);

    const formDataObj = ref();
    const loadData = () => {
      api
        .get(`/order/${id}`)
        .then((payload) => {
          console.log(payload);

          payload.createdAt = date.formatDate(
            payload.createdAt * 1000,
            'YYYY-MM-DD HH:mm:ss'
          );

          payload.deadline = payload.deadline
            ? date.formatDate(payload.deadline * 1000, 'YYYY-MM-DD HH:mm:ss')
            : '';
          let newOrderPart = [];
          payload.orderPart &&
            payload.orderPart.map((o) => {
              newOrderPart.push(o.positionId);
            });

          payload.orderPart = newOrderPart;

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

    // 点击查看图片
    const handleDialog = () => {
      isDialog.value = true;
    };
    useMeta(metaData);

    //
    onMounted(() => {
      loadData();
    });

    return {
      formDataObj,
      isDialog,
      handleDialog,
      val: ref(true),
    };
  },
});
</script>
<style scoped>
.computeArea {
  width: 100%;
  height: 10vw;
//border: #1d1d1d solid; display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
}

.computeArea .compute {
  width: 20%;
  height: 15vh;
  margin-bottom: 20px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.compute .price {

  width: 100%;
  height: 40px;
//border: #1d1d1d solid; border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compute .priceDiscount {
  width: 100%;
  height: 40px;
//border: #1d1d1d solid; border-radius: 0;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.textArea {
  width: 100%;
  height: 30px;
//border: black solid 1px; display: flex;
  flex-direction: row;

}

.textArea .text1 {
  font-size: 17px;

}

.textArea .text {
  font-size: 17px;
  margin-left: 20vw;
}

</style>
