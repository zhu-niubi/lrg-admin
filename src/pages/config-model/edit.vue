<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改3D模型配置</q-toolbar-title>
    </q-toolbar>

    <q-card flat v-if="formDataObj">
      <q-form
        ref="myForm"
        autocorrect="off"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      >
        <q-card-section v-if="formDataObj.type !== 4">
          <q-input
            label="标题 *"
            v-model="formDataObj.title"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />
        </q-card-section>

        <q-card-section>
          <GoodsOption
            title="类型 *"
            v-model="formDataObj.type"
            :optionsVal="modeTypeList"
            disable
          />
        </q-card-section>

        <div v-show="formDataObj.type === 4">
          <q-card-section v-if="modelCarList.length">
            <GoodsOption
              title="车型 *"
              v-model="formDataObj.model"
              :optionsVal="modelCarList"
              disable
            />
          </q-card-section>

          <q-card-section v-if="colorList.length">
            <SelectFiler
              title="颜色 *"
              v-model="formDataObj.parentId"
              :optionsVal="colorList"
            />
          </q-card-section>
        </div>

        <q-card-section v-if="formDataObj.type === 4">
          <UploadImgComponent
            :title="formDataObj.type === 4 ? '视频封面 *' : '资源地址 *'"
            v-model="formDataObj.title"
          />
        </q-card-section>
        <q-card-section v-if="formDataObj.type !== 2">
          <UploadImgComponent
            :title="formDataObj.type === 4 ? '视频 *' : '资源地址 *'"
            v-model="formDataObj.resource"
          />
        </q-card-section>

        <q-card-section v-if="formDataObj.type === 1">
          <UploadImgComponent title="绑定模型" v-model="formDataObj.model" />
        </q-card-section>

        <q-card-section v-if="formDataObj.type === 2 && parentTypeList.length">
          <GoodsOption
            title="父级系列"
            v-model="formDataObj.parentId"
            :optionsVal="parentTypeList"
          />
        </q-card-section>
        <!-- 主系列 -->
        <div v-if="formDataObj.type === 2 && !formDataObj.parentId">
          <UploadImgComponent
            title="图标 *"
            v-model="formDataObj.resourceList"
          />
        </div>

        <div v-if="formDataObj.type === 2 && formDataObj.parentId">
          <q-card-section>
            <GoodsOption
              title="系列"
              v-model="formDataObj.tag"
              :optionsVal="tagsList"
            />
          </q-card-section>
          <q-card-section>
            <q-input
              filled
              v-model="formDataObj.resource"
              class="my-input"
              :label="formDataObj.type === 2 ? '颜色 *' : '资源 *'"
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-color v-model="formDataObj.resource" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>
        </div>

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

import GoodsOption from 'components/GoodsOption.vue';
import UploadImgComponent from 'components/UploadImgComponent.vue';
import SelectFiler from 'components/SelectFiler.vue';

const metaData = {
  // sets document title
  title: '修改3D模型配置',
};

export default {
  name: 'config-model-edit',

  components: { GoodsOption, UploadImgComponent, SelectFiler },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const formDataItem = $route.params;

    const formDataObj = ref();

    const modeTypeList = ref([
      { value: 1, label: '车型' },
      { value: 2, label: '车膜' },
      { value: 3, label: '场景' },
      { value: 4, label: '视频' },
    ]);

    const tagsList = ref([
      { value: '潮流风尚系列/TREND FASHION SERIES', label: '潮流风尚系列' },
      {
        value: '御彩极光系列/ROYAL AURORA SERIES',
        label: '御彩极光系列',
      },
      {
        value: '复刻经典系列/CLASSIC REBORN SERIES',
        label: '复刻经典系列',
      },
    ]);

    const parentTypeList = ref([]);

    const myForm = ref(null);

    // 车型数据
    const modelCarList = ref([]);

    // 车颜色
    const colorList = ref([]);

    const handleModelType = () => {
      api
        .get('/config_model?type=1')
        .then((payload) => {
          modelCarList.value = payload.map((i) => {
            const value = i.id;
            const label = i.title;
            return { value, label };
          });
        })
        .catch((e) => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: '加载失败!' + e,
            icon: 'report_problem',
          });
        });
    };

    //
    const loadData = () => {
      if (JSON.stringify(formDataItem) === '{}') {
        history.back();
      } else {
        // console.log(formDataItem);
        // 类型
        formDataItem.type = Number(formDataItem.type);

        formDataItem.parentId = Number(formDataItem.parentId);

        // 标题字段 视频封面
        formDataItem.title =
          formDataItem.type === 4
            ? formDataItem.title
              ? [{ url: formDataItem.title }]
              : []
            : formDataItem.title;

        formDataItem.resource =
          formDataItem.type !== 2
            ? [{ url: formDataItem.resource }]
            : formDataItem.resource;

        formDataItem.model = formDataItem.model
          ? formDataItem.type === 4
            ? Number(formDataItem.model)
            : [{ url: formDataItem.model }]
          : [];

        //主系列
        formDataItem.resourceList =
          formDataItem.type === 2 &&
          !formDataItem.parentId &&
          formDataItem.resource
            ? [{ url: formDataItem.resource }]
            : [];

        formDataObj.value = { ...formDataItem };
      }
    };

    const getModel = () => {
      // 获取父级系列数据
      api
        .get('/config_model')
        .then((payload) => {
          // console.log(payload);

          parentTypeList.value = payload.filter((i) => {
            i.value = i.id;
            i.label = i.title;
            return i.type === 2 && !i.parentId;
          });

          colorList.value = payload.filter((i) => {
            i.value = i.id;
            i.label = i.title;
            return i.type === 2 && i.parentId;
          });
        })
        .catch((e) => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: '加载失败!' + e,
            icon: 'report_problem',
          });
        });
    };

    const postData = (data) => {
      // $q.loading.show();
      let id = formDataObj.value.id;
      api
        .put(`/config_model/${id}`, data)
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
          $q.loading.hide();
        });
    };

    const onSumbit = () => {
      myForm.value.validate().then((success) => {
        if (success) {
          // yay, models are correct
          const bodyData = Object.assign({}, formDataObj.value);
          const newBodyData = {};

          newBodyData.type = bodyData.type;
          newBodyData.parentId = bodyData.parentId
            ? Number(bodyData.parentId)
            : undefined;
          newBodyData.tag = bodyData.tag || undefined;

          // 如果没有父级系列，那么他添加的就是系列
          // 资源地址
          if (bodyData.type !== 2) {
            newBodyData.resource = bodyData.resource[0]?.url || undefined;
          } else if (bodyData.type === 2 && !bodyData.parentId) {
            newBodyData.resource = bodyData.resourceList[0]?.url || undefined;
          } else {
            newBodyData.resource = bodyData.resource;
          }

          // 标题字段 视频封面
          newBodyData.title =
            bodyData.type === 4 ? bodyData.title[0]?.url : bodyData.title;

          newBodyData.model =
            bodyData.type === 1
              ? bodyData.model[0]?.url || undefined
              : bodyData.model.toString() || undefined;

          // console.log(newBodyData);
          // return;

          if (
            !newBodyData ||
            !newBodyData.type ||
            !newBodyData.title ||
            !newBodyData.resource
          ) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '数据输入不完整!',
              icon: 'las la-bug',
            });

            return;
          } else {
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
      handleModelType();

      getModel();
    });

    //
    onBeforeUnmount(() => {
      // we do cleanup
    });

    return {
      myForm,
      modeTypeList,
      parentTypeList,
      tagsList,
      formDataObj,
      modelCarList,
      colorList,
      handleModelType,
      onSumbit,
    };
  },
};
</script>
