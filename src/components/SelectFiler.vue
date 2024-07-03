<template>
  <div>
    <q-select
      map-options
      emit-value
      clearable
      filled
      use-input
      input-debounce="0"
      :label="title"
      :options="options"
      @filter="filterFn"
      :modelValue="modelValue"
      @update:modelValue="(event) => $emit('update:modelValue', event)"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey"> No results </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
// import { watch } from 'fs';

export default defineComponent({
  name: 'SelectFiler',
  props: ['modelValue', 'title', 'baseUrl', 'optionsVal'],

  setup(props) {
    // console.log(props);
    const $q = useQuasar();

    const options = ref(null);
    const stringOptions = ref(null);

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
            const label = o.name ? o.name : o.nickname;

            return { label, value: o.id };
          });

          stringOptions.value = options.value;
        })
        .finally(() => {
          // $q.loading.hide()
        });
    };

    const filterFn = (val, update) => {
      if (val === '') {
        update(() => {
          options.value = stringOptions.value;
        });
        return;
      }

      update(() => {
        options.value = stringOptions.value.filter((v) => {
          return v.label.indexOf(val) !== -1;
        });
      });
    };

    watch(
      () => props.baseUrl,
      () => {
        loadData();
      }
    );

    //
    onMounted(() => {
      if (props.baseUrl) {
        loadData();
      } else {
        options.value = [...props.optionsVal];
        stringOptions.value = [...props.optionsVal];
      }
    });

    return {
      options,
      stringOptions,
      filterFn,
    };
  },
});
</script>
