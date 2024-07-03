<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改会员权益</q-toolbar-title>
    </q-toolbar>

    <q-card flat v-if="couponTypeObj">
      <q-form
        ref="myForm"
        autocorrect="off"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      >
        <q-card-section>
          <q-input
            label="名称 *"
            v-model="couponTypeObj.name"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 1) || 'Please type something',
            ]"
          />
        </q-card-section>

        <q-card-section>
          <GoodsOption
            title="权益等级 *"
            v-model="couponTypeObj.level"
            :optionsVal="userLevelList"
          />
        </q-card-section>

        <q-card-section>
          <UploadImgComponent v-model="couponTypeObj.image" title="图片 *" />
        </q-card-section>

        <q-card-section>
          <q-editor
            placeholder="请填写相应的权益内容"
            v-model="couponTypeObj.describe"
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

const metaData = {
  // sets document title
  title: '会员权益',
};

export default {
  name: 'welfare-edit',

  components: { UploadImgComponent, GoodsOption },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const couponTypeItem = $route.params;

    const couponTypeObj = ref();

    // 权益等级
    const userLevelList = ref([
      { label: '等级一', value: 1 },
      { label: '等级二', value: 2 },
      { label: '等级三', value: 3 },
      { label: '等级四', value: 4 },
      { label: '等级五', value: 5 },
      { label: '等级六', value: 6 },
      { label: '等级七', value: 7 },
      { label: '等级八', value: 8 },
      { label: '等级九', value: 9 },
      { label: '等级十', value: 10 },
    ]);

    const myForm = ref(null);

    //
    const loadData = () => {
      if (JSON.stringify(couponTypeItem) === '{}') {
        history.back();
      } else {
        couponTypeItem.image = [{ url: couponTypeItem.image }];
        couponTypeItem.level = Number(couponTypeItem.level);
        couponTypeObj.value = couponTypeItem;
      }
    };

    const postData = (data) => {
      // $q.loading.show()
      let id = couponTypeObj.value.id;
      api
        .put(`/welfare/${id}`, data)
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
          const bodyData = Object.assign({}, couponTypeObj.value);
          const newBodyData = {};

          newBodyData.name = bodyData.name;
          newBodyData.image = bodyData.image[0] ? bodyData.image[0].url : '';
          newBodyData.describe = bodyData.describe;
          newBodyData.level = bodyData.level ? Number(bodyData.level) : '';

          // console.log(newBodyData);
          // return;
          if (
            !newBodyData ||
            !newBodyData.image ||
            !newBodyData.describe ||
            !bodyData.level
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
      couponTypeObj,
      userLevelList,
      onSumbit,
    };
  },
};
</script>
