<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>修改公告</q-toolbar-title>
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
            type="textarea"
            placeholder="公告内容"
            v-model="formDataObj.data"
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
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';

const metaData = {
  // sets document title
  title: '修改公告',
};

export default {
  name: 'notice-edit',

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const couponItem = $route.params;

    const formDataObj = ref();

    const myForm = ref(null);

    //
    const loadData = () => {
      if (JSON.stringify(couponItem) === '{}') {
        history.back();
      } else {
        formDataObj.value = couponItem;
      }
    };

    const postData = (data) => {
      api
        .post('/notice', data)
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
          const data = {
            data: formDataObj.value.data,
          };

          postData(data);
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
      formDataObj,
      onSumbit,
    };
  },
};
</script>
