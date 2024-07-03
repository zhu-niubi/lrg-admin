<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改门店</q-toolbar-title>
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
          <q-input
            label="门店名称 *"
            v-model="formDataObj.name"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 1) || 'Please type something',
            ]"
          />
        </q-card-section>

        <q-card-section>
          <q-item>门店地址 *</q-item>

          <CascaderSelect
            :cascadeTitle="[
              { title: '省级' },
              { title: '市级' },
              { title: '区级' },
            ]"
            v-model="formDataObj.region"
            v-if="formDataObj.region"
            :optionsVal="addressList"
          />
        </q-card-section>

        <q-card-section>
          <q-input
            label="详细地址 *"
            v-model="formDataObj.fullAddress"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 1) || 'Please type something',
            ]"
            @blur="getALocation"
          />
          <p>
            <span>经度：{{ formDataObj.lon }}</span>
            <span style="margin-left: 20px">纬度：{{ formDataObj.lat }}</span>
          </p>
          <div id="container"></div>
        </q-card-section>

        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-6">
            <q-card-section>
              <q-input
                label="联系人 *"
                v-model="formDataObj.contact"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 1) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-6">
            <q-card-section>
              <q-input
                type="tel"
                label="电话 *"
                v-model="formDataObj.phoneNumber"
                :rules="[
                  (val) => (val && val.length > 1) || 'Please type something',
                ]"
              />
            </q-card-section>
          </div>
        </div>

        <q-card-section>
          <UploadImgComponent title="门店照片" v-model="formDataObj.images" />
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
import { region } from '../../utils/china-area';

import UploadImgComponent from 'components/UploadImgComponent.vue';
import CascaderSelect from 'components/CascaderSelect.vue';

const metaData = {
  // sets document title
  title: '修改门店',
};

export default {
  name: 'store-manage-edit',

  components: { UploadImgComponent, CascaderSelect },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const addressList = region.data;

    const formDataItem = $route.params;

    const formDataObj = ref();

    const myForm = ref(null);

    //
    const loadData = () => {
      if (JSON.stringify(formDataItem) === '{}') {
        history.back();
      } else {
        if (formDataItem.images.length > 0) {
          let newImgList = [];
          for (var key in formDataItem.images) {
            let list = {};
            list.url = formDataItem.images[key];
            newImgList.push(list);
          }
          formDataItem.images = newImgList;
        }
        // console.log(formDataItem);

        formDataObj.value = formDataItem;
      }
    };

    const postData = (data) => {
      // $q.loading.show()
      let id = formDataObj.value.id;
      api
        .put(`/store/${id}`, data)
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

          newBodyData.name = bodyData.name;
          newBodyData.phoneNumber = bodyData.phoneNumber;
          newBodyData.contact = bodyData.contact;
          newBodyData.region = bodyData.region;
          newBodyData.fullAddress = bodyData.fullAddress;
          newBodyData.lat = bodyData.lat;
          newBodyData.lon = bodyData.lon;
          newBodyData.images = bodyData.images ? bodyData.images : undefined;

          if (
            !newBodyData ||
            !newBodyData.name ||
            !newBodyData.phoneNumber ||
            !newBodyData.contact ||
            newBodyData.region.length !== 12 ||
            !newBodyData.fullAddress ||
            !newBodyData.lat ||
            !newBodyData.lon
          ) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '数据输入不完整!',
              icon: 'las la-bug',
            });

            return;
          }

          // 有上传照片的情况下处理上传照片
          if (bodyData.images && bodyData.images.length > 0) {
            let newImages = [];
            bodyData.images.map((img) => {
              newImages.push(img.url);
            });

            newBodyData.images = newImages;
          }

          // console.log(newBodyData);
          // return;
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

    // 获取经纬度
    const getALocation = () => {
      let addr = '';
      let province = formDataObj.value.region
        ? formDataObj.value.region.substring(0, 2)
        : '';
      let town = formDataObj.value.region
        ? formDataObj.value.region.substring(2, 6)
        : '';
      let district = formDataObj.value.region
        ? formDataObj.value.region.substring(6, 12)
        : '';

      addressList.map((item1) => {
        if (item1.value === province) {
          addr += item1.label;
          item1.children.map((item2) => {
            if (item2.value === town) {
              addr += item2.label;
              item2.children.map((item3) => {
                if (item3.value === district) {
                  addr += item3.label;
                }
              });
            }
          });
        }
      });
      // 加载地图
      var map = new AMap.Map('container', {
        resizeEnable: true,
        zoom: 15,
      });
      let fullAddress = formDataObj.value.fullAddress
        ? formDataObj.value.fullAddress
        : '';
      let keyword = fullAddress ? addr + fullAddress : '';

      let data = {
        key: '692e0a1fa9af08757923129a8121c389',
        address: keyword,
      };

      $.ajax({
        url: 'https://restapi.amap.com/v3/geocode/geo',
        type: 'get',
        dataType: 'jsonp',
        data,
        success: function (data) {
          // console.log(data.geocodes[0].location)//获取到的经纬度
          console.log(data);

          if (data.status == 1) {
            let location = data.geocodes[0].location.split(',');
            let title = data.geocodes[0].formatted_address;

            formDataObj.value.lat = location[0];
            formDataObj.value.lon = location[1];

            var marker = new AMap.Marker({
              position: location, // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
              title: title,
              offset: new AMap.Pixel(-10, -10),
            });
            // 将创建的点标记添加到已有的地图实例：
            map.add(marker);
            map.setFitView();
          } else {
            $q.notify({
              color: 'warning',
              position: 'top',
              message: '没有查询到对应的地址!',
              icon: 'lar la-check-circle',
            });
          }
        },
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
      addressList,
      myForm,
      formDataObj,
      getALocation,
      onSumbit,
    };
  },
};
</script>
