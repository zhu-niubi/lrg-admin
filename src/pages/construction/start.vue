<template>
  <q-page class="q-pa-md" v-if="formDataObj">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>{{
        formDataObj.status === 3 ? '开始施工' : '施工确认'
      }}</q-toolbar-title>
    </q-toolbar>

    <q-card flat>
      <q-form
        ref="myForm"
        autocorrect="off"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      >
        <q-card-section
          v-for="(item, index) in formDataObj.newconstructionSku"
          :key="index"
          class="q-gutter-md"
        >
          <div>施工产品：{{ item.productName }}</div>
          <div v-for="(itemS, indexS) in item.productPosition" :key="indexS">
            <div class="row q-col-gutter-md q-py-sm flex items-end">
              <div class="col-xs-12 col-sm-1">
                <span class="text-subtitle2">{{ itemS.label }}: </span>
              </div>
              <div class="col-xs-12 col-sm-4">
                <SelectInputFiler
                  title="技师 (输入手机号/姓名)"
                  v-model="itemS.employeeId"
                  baseUrl="/employee"
                  searchName="phoneNumber,name"
                />
              </div>
              <div class="ol-xs-12 col-sm-4">
                <SelectInputFiler
                  title="膜卷号 (输入膜卷号)"
                  v-model="itemS.rollId"
                  :baseUrl="'/roll?productId=' + item.productId"
                  searchName="rollNumber"
                />
              </div>
              <div class="ol-xs-12 col-sm-2">
                <q-input
                  type="number"
                  label="消耗米数"
                  v-model="itemS.length"
                />
              </div>

              <!-- <div class="col-xs-12 col-sm-2 flex items-center">
              <q-btn label="删除" flat color="grey" @click="delSkus(indexS)" />
            </div> -->
            </div>
          </div>
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

import SelectInputFiler from 'components/SelectInputFiler.vue';

export default {
  name: 'construction-start',

  components: {
    SelectInputFiler,
  },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();

    const { id } = $route.params;

    const formDataObj = ref();

    const myForm = ref(null);

    const loadData = () => {
      api
        .get(`/construction/${id}`)
        .then((payload) => {
          // console.log(payload);

          let constructionSku = [...payload.constructionSku],
            keyInx = {};
          for (var i = 0; i < constructionSku.length; i++) {
            var id = constructionSku[i].productId;
            constructionSku[i].productPosition = [
              {
                id: constructionSku[i].id,
                status: 1,
                label: constructionSku[i].productSkuName,
                productSkuId: constructionSku[i].productSkuId,
                productSkuName: constructionSku[i].productSkuName,
                productId: constructionSku[i].productId,
                employeeId: {
                  value: constructionSku[i].employeeId,
                  label: constructionSku[i].employeeId
                    ? constructionSku[i].employeeId +
                      ' ' +
                      constructionSku[i].employeeName
                    : null,
                },
                rollId: {
                  value: constructionSku[i].rollId,
                  label: constructionSku[i].rollId
                    ? constructionSku[i].rollNumber +
                      ' ' +
                      constructionSku[i].productName
                    : null,
                },

                length: constructionSku[i].length,
              },
            ];

            if (keyInx[id] >= 0) {
              var product1 = constructionSku[i].productPosition;
              var product2 = constructionSku[keyInx[id]].productPosition;
              constructionSku[keyInx[id]].productPosition =
                product1.concat(product2);
              constructionSku.splice(i, 1);
              i--;
            } else {
              keyInx[id] = i;
            }
          }
          payload.newconstructionSku = constructionSku;

          console.log(payload);

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
        .put(`/construction/${id}`, data)
        .then((payload) => {
          $q.notify({
            color: 'success',
            position: 'top',
            message: '提交成功!',
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
          // 状态加一 开始施工
          newBodyData.status = bodyData.status + 1 || null;

          let isPass = true;
          if (bodyData.newconstructionSku.length > 0) {
            let activeList = bodyData.newconstructionSku;
            // console.log(activeList);

            let newConstructionPart = [];

            activeList.map((c) => {
              if (c.productPosition && c.productPosition.length > 0) {
                c.productPosition.map((o) => {
                  let partObj = {};
                  partObj.id = o.id;
                  partObj.rollId = o.rollId?.value
                    ? Number(o.rollId?.value)
                    : undefined;
                  partObj.length = Number(o.length) || undefined;
                  partObj.employeeId = o.employeeId?.value
                    ? Number(o.employeeId?.value)
                    : undefined;
                  partObj.productSkuId = Number(o.productSkuId);

                  if (
                    bodyData.status === 3 &&
                    o.employeeId?.value == undefined
                  ) {
                    $q.notify({
                      color: 'negative',
                      position: 'top',
                      message: o.label + ' 施工技师不能为空!',
                      icon: 'las la-bug',
                    });
                    isPass = false;
                  } else if (bodyData.status === 4) {
                    if (
                      o.employeeId?.value === undefined ||
                      !Number(o.length) ||
                      o.rollId?.value === undefined
                    ) {
                      $q.notify({
                        color: 'negative',
                        position: 'top',
                        message: o.label + ' 膜卷号/消耗米数不能为空!',
                        icon: 'las la-bug',
                      });
                      isPass = false;
                    }
                  }

                  newConstructionPart.push(partObj);
                });
              }
            });
            if (isPass) {
              newBodyData.constructionSku = newConstructionPart;
            }
          }

          console.log(newBodyData);
          // return;

          if (
            !newBodyData ||
            !newBodyData.status ||
            !newBodyData.constructionSku?.length
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
    const metaData = {
      // sets document title
      title: formDataObj.value?.status === 3 ? '开始施工' : '施工确认',
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
