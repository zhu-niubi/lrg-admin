<template>
  <div v-if="options" class="row">
    <!-- {{ value }} -->
    <div v-for="(item, index) in cascadeList" :key="index" class="col q-pa-xs">
      <q-select
        filled
        map-options
        emit-value
        :options="item.options"
        v-model="item.value"
        :label="item.title"
      />
    </div>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default defineComponent({
  name: 'CascaderSelect',
  props: ['modelValue', 'cascadeTitle', 'baseUrl', 'optionsVal'],
  emits: ['update:modelValue'],

  setup(props) {
    const $q = useQuasar();

    const modelVal = ref('');
    const cascadeList = ref([]);
    const options = ref([]);

    cascadeList.value = props.cascadeTitle ? props.cascadeTitle : '';

    options.value = props.optionsVal ? props.optionsVal : '';

    modelVal.value = props.modelValue
      ? props.modelValue._id || props.modelValue
      : '';

    const loadData = () => {
      // $q.loading.show()

      let params = {
        pageNumber: 1,
        pageSize: 1000,
      };
      api
        .get(props.baseUrl, { params })
        .then((payload) => {
          // console.log(payload);
          const { list } = payload;

          options.value = list.map((o) => {
            const label = o.nickname ? o.nickname : o.name;

            return { label, value: o.id };
          });
        })
        .finally(() => {
          // $q.loading.hide()
        });
    };

    const loadCascader = () => {
      cascadeList.value[0].options = options.value;

      // 处理编辑时返回的数据
      if (modelVal.value) {
        cascadeList.value[0].value = modelVal.value.substring(0, 2);
        cascadeList.value[1].value = modelVal.value.substring(2, 6);
        cascadeList.value[2].value = modelVal.value.substring(6, 12);
      }
    };

    //
    onMounted(() => {
      if (props.baseUrl) {
        loadData();
      } else {
        loadCascader();
      }
    });
    //cascadeList

    watch(cascadeList.value, (nowData, oldData) => {
      options.value.map((o) => {
        // console.log(o);
        // console.log(nowData);
        if (o.value === nowData[0].value) {
          cascadeList.value[1].options = o.children;
          cascadeList.value[1].value = cascadeList.value[1].value
            ? cascadeList.value[1].value
            : cascadeList.value[1].options[0].value;
          cascadeList.value[1].label = cascadeList.value[1].label
            ? cascadeList.value[1].label
            : cascadeList.value[1].options[0].label;

          o.children.map((c) => {
            if (c.value === nowData[1].value) {
              cascadeList.value[2].options = c.children;
              cascadeList.value[2].value = cascadeList.value[2].value
                ? cascadeList.value[2].value
                : cascadeList.value[2].options[0].value;

              cascadeList.value[2].label = cascadeList.value[2].label
                ? cascadeList.value[2].label
                : cascadeList.value[2].options[0].label;
            }
          });
        }
      });

      let region =
        cascadeList.value[0].value +
        cascadeList.value[1].value +
        cascadeList.value[2].value;

      modelVal.value = region ? region : modelVal.value;
    });

    return {
      modelVal,
      options,
      cascadeList,
    };
  },

  watch: {
    modelVal(value, o) {
      this.$emit('update:modelValue', value);
    },
  },
});
</script>
