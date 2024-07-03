<template>
  <div>
    <div>{{ title }}</div>
    <div class="q-pa-md row q-col-gutter-sm">
      <q-tree
        class="col-12 col-sm-6"
        :nodes="simple"
        node-key="value"
        tick-strategy="leaf"
        v-model:ticked="ticked"
        v-model:expanded="expanded"
        @update:ticked="handleTicked"
      />
      <div class="col-12 col-sm-6 q-gutter-sm">
        <div class="text-h6">施工产品值：</div>
        <div v-for="(tick, index) in targetList" :key="`ticked-${index}`">
          <span class="text-subtitle2">{{ tick.label }}, </span>
        </div>

        <q-separator spaced />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default defineComponent({
  name: 'TreeSelect',
  props: [
    'modelValue',
    'title',
    'baseUrl',
    'optionsVal',
    'searchName',
    'disabled',
  ],
  emits: ['update:modelValue'],

  setup(props, emits) {
    // console.log(props);
    const $q = useQuasar();

    const ticked = ref([]),
      targetList = ref([]),
      expanded = ref([]),
      simple = ref([]);

    const loadData = () => {
      // $q.loading.show()
      // return;
      let params = {
        pageNumber: 1,
        pageSize: 1000,
      };
      api
        .get(props.baseUrl, { params })
        .then((payload) => {
          // console.log(payload);
          const { list } = payload;

          list.map((s, index) => {
            s.value = s.id;
            s.label = s.name;
            s.children = [];
            if (props.disabled) {
              s.disabled = true;
            }

            simple.value.push(s);
            proModelList(s.id, index);
          });

          // console.log(simple.value);
        })
        .finally(() => {
          // $q.loading.hide()
        });
    };

    // 获取产品系列
    const proModelList = (id, index) => {
      let params = {
        pageNumber: 1,
        pageSize: 1000,
        productTypeId: id,
      };

      api
        .get('/product_model', { params })
        .then((payload) => {
          const { list } = payload;

          if (list.length > 0) {
            list.map((o, oIndex) => {
              o.label = o.name;
              o.value = id + '-' + o.id;
              productList(index, o.value, oIndex);
            });
            simple.value[index].children = [...list];
          }
        })
        .finally(() => {
          // $q.loading.hide()
        });
    };

    // 获取产品
    const productList = (index, value, oIndex) => {
      let params = {
        pageNumber: 1,
        pageSize: 1000,
        productModelId: value.split('-')[1],
      };

      api
        .get('/product', { params })
        .then((payload) => {
          const { list } = payload;

          if (list.length > 0) {
            list.map((o) => {
              o.label = o.name;
              o.value = value + '-' + o.id;
            });
            simple.value[index].children[oIndex].children = [...list];
          }
        })
        .finally(() => {
          // $q.loading.hide()
        });
    };

    const handleTicked = (target) => {
      let list = [];

      target.map((t) => {
        let targetObj = {};
        simple.value.map((s) => {
          if (s.children && s.children.length > 0) {
            s.children.map((o) => {
              if (o.children && o.children.length > 0) {
                o.children.map((c) => {
                  if (t === c.value) {
                    targetObj.value = t;
                    targetObj.label = c.label;
                  }
                });
              }
            });
          }
        });
        list.push(targetObj);
      });
      targetList.value = [...list];
    };

    watch(
      () => props.baseUrl,
      () => {
        loadData();
      }
    );

    watch(
      () => ticked.value,
      (nVal) => {
        emits.emit('update:modelValue', targetList.value);
      }
    );

    watch(
      () => targetList.value,
      (nVal) => {
        let data = [];
        let list = [];
        nVal.map((n) => {
          list.push(n.value);
          data.push(n.value.split('-')[0]);
        });
        // expanded.value = data.map(Number);
        expanded.value = [1, 1, 6];

        ticked.value = [...list];

        // expanded.value.push();
      }
    );

    //
    onMounted(() => {
      if (props.baseUrl) {
        loadData();
        targetList.value = props.modelValue;
      }
    });

    return {
      ticked,
      targetList,
      expanded,
      simple,
      handleTicked,
    };
  },
});
</script>
