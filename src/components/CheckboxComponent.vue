
<template>
  <div class="q-pa-md">
    <div class="q-py-sm">{{ title }}</div>
    <div class="q-gutter-sm">
      <q-checkbox
        v-for="(item, index) in options"
        :key="index"
        v-model="selection"
        :val="item.value"
        :label="item.label"
        color="teal"
        :disable="disable"
      />

      <div
        v-if="optionKey && !disable && selectionData && selectionData.length"
      >
        <div v-for="(itemS, indexS) in selectionData" :key="indexS">
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
                :baseUrl="
                  '/roll?productId=' +
                  baseUrl.substring(baseUrl.lastIndexOf('/') + 1)
                "
                searchName="rollNumber"
              />
            </div>
            <div class="ol-xs-12 col-sm-2">
              <q-input type="number" label="消耗米数" v-model="itemS.length" />
            </div>

            <!-- <div class="col-xs-12 col-sm-2 flex items-center">
              <q-btn label="删除" flat color="grey" @click="delSkus(indexS)" />
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <div class="text-red" v-if="!options.length">
      部位暂无数据！请先添加相应部位！
    </div>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, watch, onRenderTracked } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import SelectInputFiler from 'components/SelectInputFiler';

export default defineComponent({
  name: 'CheckboxComponent',
  props: [
    'modelValue',
    'title',
    'baseUrl',
    'optionsVal',
    'disable',
    'isNoClickAll',
    'optionKey',
    'isDataObject',
    'optionData',
  ],
  components: { SelectInputFiler },

  emits: ['update:modelValue'],

  setup(props, context) {
    // //console.log('props=>',context);
    const $q = useQuasar();

    const selection = ref([]);
    const selectionData = ref([]);
    const modelVal = ref('');
    const baseUrlVal = ref('');
    const optionDataVal = ref([]);

    baseUrlVal.value = props.baseUrlVal ? props.baseUrlVal : '';

    modelVal.value = props.modelValue ? props.modelValue : '';

    optionDataVal.value = props.optionData ? props.optionData : [];

    const options = ref([]);
    const newOptions = ref([]);

    const loadData = () => {
      // $q.loading.show()
      let params = {
        pageNumber: 1,
        pageSize: 1000,
      };
      api
        .get(props.baseUrl, { params })
        .then((payload) => {
          // //console.log(payload);

          const { list } = payload;
          selection.value = modelVal.value || [];
          if (props.optionKey) {
            const newList = payload[props.optionKey].map((o) => {
              const label = o.name;

              return { label, value: o.id };
            });

            selection.value = modelVal.value || [];

            if (props.isNoClickAll) {
              options.value = newList.length ? [...newList] : [];
            } else {
              options.value = newList.length
                ? [
                  {
                    label: '全选',
                    value: newList.map((n) => n.value).toString(), //newList.map((n) => n.value).toString()
                  },
                  ...newList,
                ]
                : [];
            }
          } else if (props.isNoClickAll) {
            const newList = list.map((o) => {
              const label = o.name;
              return { label, value: o.id };
            });

            if (
              modelVal.value.length > 0 &&
              modelVal.value.length === newList.length
            ) {
              // selection.value = [0];
            }
            options.value = newList.length ? [...newList] : [];
          } else {
            const newList = list.map((o) => {
              const label = o.name;

              return { label, value: o.id };
            });
            if (
              modelVal.value.length > 0 &&
              modelVal.value.length === newList.length
            ) {
              selection.value = [0];
            }
            options.value = newList.length
              ? [{ label: '全选', value: 0 }, ...newList]
              : [];
          }
          // //console.log(selection.value);
        })
        .finally(() => {
          // $q.loading.hide()
        });
    };

    // 点击删除skus
    const delSkus = (index) => {
      if (selectionData.value[index].id) {
        selectionData.value[index].status = 0;
      } else {
        selectionData.value.splice(index, 1);
      }
    };

    watch(
      () => props.baseUrl,
      () => {
        loadData();
      }
    );
    watch(
      () => selection.value,
      (newVal) => {
        //console.log('newVal==>', newVal);
        if (newVal.length) {
          let list = [];
          options.value.forEach((item) => {
            if (newVal.includes(item.value)) {
              list.push(item);
            }
          });

          let isNumber = newVal.map((item) => Number(item)).includes(NaN);

          if (isNumber) {
            let alllist = list.filter((item) => item.label === '全选');
            selectionData.value = alllist;
            // 避免在 watch 处理程序内修改 selection.value
            // 可以通过触发事件或使用计算属性来处理更改
            // 例如：this.$emit('selection-change', alllist);
          } else {
            let optionData = [];
            if (optionDataVal.value.length) {
              list.forEach((lis) => {
                lis.status = 1;
                optionDataVal.value.forEach((item) => {
                  item.value = item.productSkuId;
                  if (item.productSkuId === lis.value) {
                    lis = item;
                  }
                });
                optionData.push(lis);
              });
            }
            selectionData.value = optionData.length ? optionData : list;
          }
        }
      },
      { deep: true, immediate: true }
    );

    // watch(
    //   () => selection.value,
    //   (newVal) => {
    //     //console.log(newVal);
    //     if (newVal.length) {
    //       let list = [];
    //       options.value.forEach((item) => {
    //         if (newVal.includes(item.value)) {
    //           list.push(item);
    //         }
    //       });
    //       let isNumber = newVal.map((item) => Number(item)).includes(NaN);
    //       if (isNumber) {
    //         let alllist = list.filter((item) => item.label === '全选');
    //         selectionData.value = alllist;
    //         selection.value = [alllist[0]?.value];
    //       } else {
    //         let optionData = [];
    //         if (optionDataVal.value.length) {
    //           list.map((lis) => {
    //             lis.status = 1;
    //             optionDataVal.value.map((item) => {
    //               item.value = item.productSkuId;
    //               if (item.productSkuId === lis.value) {
    //                 lis = item;
    //               }
    //             });
    //             optionData.push(lis);
    //           });
    //         }
    //         selectionData.value = optionData.length ? optionData : list;
    //       }
    //     }
    //   },
    //   {deep: true, immediate: true}
    // );

    watch(
      () => selectionData.value,
      (newVal) => {
        if (newVal?.indexOf(0) !== -1) {
          let dataArr = [];
          options.value.map((o) => {
            dataArr.push(o);
          });

          dataArr.shift();

          newVal = dataArr;
        }

        if (props.isDataObject) {
          context.emit('update:modelValue', newVal);
        } else {
          context.emit('update:modelValue', selection.value);
        }
      },
      { deep: true, immediate: true }
    );

    //
    onMounted(() => {
      if (props.baseUrl) {
        loadData();
      } else {
        options.value = props.isNoClickAll
          ? props.optionsVal
          : [...props.optionsVal];

        let newArr =
          modelVal.value.length > 0 ? modelVal.value.toString().split(',') : [];

        if (newArr.length === props.optionsVal.length) {
          selection.value = [0];
        } else {
          selection.value = modelVal.value ? newArr.map(Number) : [];
        }
      }
    });

    return {
      selection,
      selectionData,
      modelVal,
      baseUrlVal,
      options,
      newOptions,
      optionDataVal,
      delSkus,
    };
  },
  watch: {
    selectionData(newValue) {
      if (newValue.indexOf(0) !== -1) {
        let dataArr = [];
        this.options.map((o) => {
          dataArr.push(o);
        });

        dataArr.shift();

        newValue = dataArr;
      }

      if (this.isDataObject) {
        this.$emit('update:modelValue', newValue);
      } else {
        this.$emit('update:modelValue', this.selection);
      }
    },
  },
});
</script>





