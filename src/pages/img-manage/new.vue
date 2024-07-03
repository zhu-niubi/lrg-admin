<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>添加背景图片</q-toolbar-title>
    </q-toolbar>

    <q-card flat v-if="imageObj">
      <q-form
        ref="myForm"
        autocorrect="off"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      >
        <q-card-section>
          <GoodsOption
            title="图片类型 *"
            v-model="imageObj.type"
            :optionsVal="imageType"
          />
        </q-card-section>

        <q-card-section>
          <UploadImgComponent title="图片 *" v-model="imageObj.url" />
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

import { api } from 'boot/axios';

import UploadImgComponent from 'components/UploadImgComponent.vue';
import GoodsOption from 'components/GoodsOption.vue';

const metaData = {
  // sets document title
  title: '添加图片',
};

export default {
  name: 'coupon-type-new',

  components: { UploadImgComponent, GoodsOption },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();

    const myForm = ref(null);
    const imageObj = ref(null);

    const imageType = ref([
      { label: '开机屏轮播图', value: 1 },
      { label: '授权登录背景图', value: 2 },
      { label: '我的-页面背景', value: 3 },
      { label: '个人档案背景图', value: 4 },
      { label: '卡券背景图', value: 5 },
      { label: '商城-banner图', value: 6 },
      { label: '首页-活动分享背景图', value: 7 },
      { label: '活动分享-页面展示图', value: 8 },
      { label: '首页-banner背景底图', value: 9 },
      { label: '首页-品牌故事视频', value: 10 },
      { label: '首页-星级技师默认图片', value: 11 },
      {label: '首页-星级技师展开图片', value: 12},
      {label: '首页-公司信息及介绍', value: 13},
      {label: '活动分享-纳分享有好礼', value: 14},
      {label: '活动分享-我的奖励', value: 15},
      {label: '活动分享-活动须知', value: 16},
      {label: '质保查询背景图', value: 17},
      {label: '商城背景图', value: 18},
      {label: '施工单案例分享-背景图', value: 19},
      {label: '施工单案例分享-海报背景', value: 20},
      {label: '施工单案例分享-海报banner', value: 21},
      {label: 'NFC识别GIF', value: 22},
    ]);

    //
    const loadData = () => {
      imageObj.value = {
        type: '',
        url: [],
      };
    };

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/image', data)
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
          const bodyData = Object.assign({}, imageObj.value);
          bodyData.url = bodyData.url[0] ? bodyData.url[0].url : '';
          bodyData.type = bodyData.type ? Number(bodyData.type) : '';

          console.log(bodyData);
          // return;
          if (!bodyData || !bodyData.type || !bodyData.url) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '数据输入不完整!',
              icon: 'las la-bug',
            });

            return;
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
      imageType,
      myForm,
      imageObj,
      onSumbit,
    };
  },
};
</script>
