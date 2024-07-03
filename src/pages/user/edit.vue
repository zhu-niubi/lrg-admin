<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改用户信息</q-toolbar-title>
    </q-toolbar>

    <q-card flat v-if="userObj">
      <q-form
        ref="myForm"
        autocorrect="off"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      >
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-card-section>
              <q-input
                label="openId"
                v-model="userObj.openId"
                lazy-rules
                disable
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input label="昵称" v-model="userObj.nickname" lazy-rules />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input label="姓名" v-model="userObj.name" lazy-rules />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <RadioOption
                title="性别"
                type="radio"
                v-model="userObj.gender"
                :optionValue="genderGroups"
                defaultVal="1"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <GoodsOption
                title="用户等级"
                v-model="userObj.level"
                :optionsVal="userLevelList"
              />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input type="tel" label="电话" v-model="userObj.phoneNumber" />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <DateTimeComponent title="生日" v-model="userObj.birthday" />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input label="省" v-model="userObj.province" />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input label="市" v-model="userObj.city" />
            </q-card-section>
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-card-section>
              <q-input label="区" v-model="userObj.area" />
            </q-card-section>
          </div>
        </div>

        <q-card-section>
          <UploadImgComponent title="头像" v-model="userObj.avatarUrl" />
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

import DateTimeComponent from 'src/components/DateTimeComponent.vue';
import RadioOption from 'src/components/RadioOption.vue';
import UploadImgComponent from 'components/UploadImgComponent.vue';
import GoodsOption from 'components/GoodsOption.vue';

const metaData = {
  // sets document title
  title: '修改用户信息',
};

export default {
  name: 'user-edit',

  components: {
    RadioOption,
    DateTimeComponent,
    UploadImgComponent,
    GoodsOption,
  },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const userItem = $route.params;

    const userObj = ref();

    const myForm = ref(null);

    const genderGroups = ref([
      { value: 1, label: '男' },
      { value: 2, label: '女' },
    ]);

    // 用户等级
    const userLevelList = ref([
      { label: '车衣小白', value: 1 },
      { label: '车衣新人', value: 2 },
      { label: '车衣潮人', value: 3 },
      { label: '车衣达人', value: 4 },
      { label: '车衣王者', value: 5 },
    ]);

    //
    const loadData = () => {
      if (JSON.stringify(userItem) === '{}') {
        history.back();
      } else {
        // userItem.avatarUrl = userItem.avatarUrl !== '' ? [{ url: userItem.avatarUrl }] : [];
        // userItem.level = Number(userItem.level);
        //
        // console.log('userItem',userItem);

        // userObj.value = userItem;

        findUserDetail();
      }
    };
    const findUserDetail = () => {
      let userId = userItem.id;
      api
        .get(`/user/${userId}`)
        .then((payload) => {
          console.log('payload',payload)
          payload.avatarUrl = payload.avatarUrl !== '' ? [{ url: payload.avatarUrl }] : [];
          payload.level = Number(payload.level);
          const date = new Date(payload.birthday * 1000);
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // JavaScript中月份是从0开始计数的，所以要加1
          const day = date.getDate();
          const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;


          payload.birthday = formattedDate;
          console.log('sdasdasdas',payload)
          userObj.value = payload;
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
      let id = userObj.value.id;
      api
        .put(`/user/${id}`, data)
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
          const bodyData = Object.assign({}, userObj.value);
          const newBodyData = {};

          newBodyData.openId = bodyData.openId ? bodyData.openId : undefined;
          newBodyData.nickname = bodyData.nickname
            ? bodyData.nickname
            : undefined;
          newBodyData.name = bodyData.name ? bodyData.name : undefined;
          newBodyData.gender = bodyData.gender
            ? Number(bodyData.gender)
            : undefined;
          newBodyData.avatarUrl = bodyData.avatarUrl[0]
            ? bodyData.avatarUrl[0].url
            : undefined;
          newBodyData.birthday = bodyData.birthday
            ? Number(new Date(bodyData.birthday)) / 1000
            : undefined;
          newBodyData.phoneNumber = bodyData.phoneNumber
            ? bodyData.phoneNumber.toString()
            : undefined;
          newBodyData.country = bodyData.country ? bodyData.country : undefined;
          newBodyData.province = bodyData.province
            ? bodyData.province
            : undefined;
          newBodyData.city = bodyData.city ? bodyData.city : undefined;
          newBodyData.area = bodyData.area ? bodyData.area : undefined;
          newBodyData.level = bodyData.level
            ? Number(bodyData.level)
            : undefined;

          console.log(newBodyData);

          postData(newBodyData);
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
      myForm,
      userObj,
      genderGroups,
      userLevelList,
      onSumbit,
    };
  },
};
</script>
