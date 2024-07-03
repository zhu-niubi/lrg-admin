<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>添加公告</q-toolbar-title>
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useQuasar, useMeta, date } from 'quasar';

import { api } from 'boot/axios';

const metaData = {
  // sets document title
  title: '添加公告',
};

export default {
  name: 'notice-new',

  setup() {
    const $q = useQuasar();

    const myForm = ref(null);

    const formDataObj = ref({});

    //
    const loadData = () => {
      formDataObj.value = {
        date: '',
      };
    };

    const postData = (data) => {
      // $q.loading.show()

      api
        .post('/notice', data)
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
          const bodyData = Object.assign({}, formDataObj.value);

          bodyData.data = bodyData.data || '';

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
      myForm,
      formDataObj,
      onSumbit,
    };
  },
};
</script>
