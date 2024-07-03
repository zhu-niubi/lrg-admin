<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改案例</q-toolbar-title>
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
          <p>
            <span style="margin-left: 20px"
            >上传时间：{{ formDataObj.createdAt }}</span
            >
          </p>
          <p>
            <span
              style="margin-left: 20px; font-size: larger; font-weight: bold"
            >施工门店：{{ formDataObj.storeName }}</span
            >
          </p>
          <p>
            <span style="margin-left: 20px"
            >汽车品牌：{{ formDataObj.carBrandName }}</span
            >
          </p>
          <div style="letter-spacing: 2px">
            <p>
              <span style="margin-left: 20px"
              >车型：{{ formDataObj.carName }}</span
              >
              <span style="margin-left: 20px"
              >产品类型：{{ formDataObj.productName }}</span
              >
              <span style="margin-left: 20px"
              >产品系列：{{ formDataObj.productModelName }}</span
              >
            </p>
          </div>
        </q-card-section>
        <q-card-section>
          <UploadImgComponent title="车辆外观" v-model="formDataObj.src"/>
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

const metaData = {
  // sets document title
  title: '修改案例',
};

export default {
  name: 'case-manage-edit',

  components: {UploadImgComponent},

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const formDataItem = $route.params;

    const formDataObj = ref();

    const myForm = ref(null);

    const cData = ref({
      constructionId: null,
      productId: null,
    });

    //
    const loadData = () => {
      if (JSON.stringify(formDataItem) === '{}') {
        history.back();
      } else {
        if (formDataItem.src && formDataItem.src.length > 0) {
          // console.log('formDataItem.src', formDataItem.src);
          let newImgList = [];
          for (var key in formDataItem.src) {
            let list = {};
            list.url = formDataItem.src[key];
            newImgList.push(list);
          }
          formDataItem.src = newImgList;
        }

        cData.value.constructionId = formDataItem.constructionId;
        cData.value.productId = formDataItem.productId;

        formDataObj.value = formDataItem;

        // console.log('formDataObj.value', formDataObj.value);
      }
    };

    const postData = (data) => {
      // $q.loading.show()
      let id = formDataObj.value.id;
      api
        .put(`/construction-image/${id}`, data)
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
          newBodyData.constructionId = parseInt(cData.value.constructionId);
          newBodyData.productId = parseInt(cData.value.productId);
          newBodyData.src = [];
          for (const i of formDataObj.value.src) {
            newBodyData.src.push(i.url);
            // newBodyData.src.push();
          }

          console.log('newBodyData', newBodyData);
          // return;
          if (
            !newBodyData ||
            !newBodyData.constructionId ||
            !newBodyData.productId ||
            !newBodyData.src.length > 0
          ) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '数据输入不完整!',
              icon: 'las la-bug',
            });

            return;
          }

          postData(newBodyData);
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
      myForm,
      formDataObj,
      onSumbit,
    };
  },
};
</script>
