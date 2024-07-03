<template>
  <div v-if="options">
    <!-- {{ value }} -->
    <q-select
      filled
      map-options
      emit-value
      :options="options"
      :label="title"
      :disable="disable"
      :modelValue="modelValue"
      @update:modelValue="(event) => $emit('update:modelValue', event)"
    />
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default defineComponent({
  name: 'GoodsOption',
  props: ['modelValue', 'title', 'baseUrl', 'type', 'optionsVal', 'disable'],

  setup(props) {
    const $q = useQuasar();

    const options = ref(null);
    // //console.log('type',props.type);

    const loadData = () => {
      // $q.loading.show()

      let params = {
        pageNumber: 1,
        pageSize: 1000,
      };

      // 如果提供了type属性，则将其包含在请求参数中
      if (props.type !== undefined) {
        params.type = props.type;
      }
      // //console.log('type',params.type)
      api
        .get(props.baseUrl, { params })
        .then((payload) => {
          // //console.log(payload);
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

    watch(
      () => props.baseUrl,
      () => {
        loadData();
      }
    );

    watch(
      () => props.optionsVal,
      () => {
        options.value = [...props.optionsVal];
      }
    );

    //
    onMounted(() => {
      if (props.baseUrl) {
        loadData();
      } else {
        options.value = [...props.optionsVal];
      }
    });
    return {
      options,
    };
  },
});
</script>
