<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改订单详细</q-toolbar-title>
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
  </q-page>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useQuasar, useMeta, date } from 'quasar';
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';

const metaData = {
  title: '修改订单详细',
};

export default {
  name: 'order-edit',

  components: {},

  setup() {
    const $q = useQuasar();
    const $route = useRoute();

    const { id } = $route.params;

    const formDataObj = ref();

    const myForm = ref(null);

    const loadData = () => {
      api
        .get(`/order/${id}`)
        .then((payload) => {
          console.log(payload);

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

          let newOrderPart = [];
          payload.orderPart &&
            payload.orderPart.map((o) => {
              newOrderPart.push(o.positionId);
            });

          payload.orderPart = newOrderPart;

          if (payload.defectImages && payload.defectImages.length > 0) {
            let newImgList = [];
            for (var key in payload.defectImages) {
              let list = {};
              list.url = payload.defectImages[key];
              newImgList.push(list);
            }
            payload.defectImages = newImgList;
          }

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
        .put(`/order/${id}`, data)
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

          newBodyData.expectComplete = bodyData.expectComplete
            ? Number(new Date(bodyData.expectComplete)) / 1000
            : undefined;

          newBodyData.memo = bodyData.memo ? bodyData.memo : '';

          console.log(newBodyData);
          // return;

          if (!newBodyData) {
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
          $q.notify({
            color: 'negative',
            position: 'center',
            messagae: '表单验证失败!',
            icon: 'las la-skull-crossbones',
          });
        }
      });
    };
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
      formDataObj,
      onSumbit,
    };
  },
};
</script>
