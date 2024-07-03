<template>
  <div v-if="options">
    <q-select
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
  name: 'SelectInputFiler',
  props: ['modelValue', 'title', 'baseUrl', 'optionsVal', 'searchName'],

  setup(props) {
    // console.log(props);
    const $q = useQuasar();

    const options = ref(null);
    const stringOptions = ref(null);

    // 搜索值
    const keyword = ref('');

    const loadData = () => {
      // $q.loading.show()

      let searchName =
        props.searchName.indexOf(',') !== -1
          ? isNaN(Number(keyword.value))
            ? props.searchName.split(',')[1]
            : props.searchName.split(',')[0]
          : props.searchName;

      // return;
      let params = {
        position: 2,
        pageNumber: 1,
        pageSize: 1000,
        [searchName]: keyword.value ? keyword.value : undefined,
      };
      api
        .get(props.baseUrl, { params })
        .then((payload) => {
          // console.log(payload);
          const { list } = payload;

          if (props.baseUrl === '/product') {
            options.value = list.map((o) => {
              const label = o.id + o.name;
              return { label, value: o.id };
            });
          } else if (props.baseUrl.indexOf('/roll') !== -1) {
            options.value = list.map((o) => {
              const label = o.rollNumber + ' ' + o.productName;
              return { label, value: o.id };
            });
          } else {
            options.value = list.map((o) => {
              const label = o.name
                ? o.id + ' ' + o.name
                : o.nickname
                ? o.name
                  ? o.id + ' ' + o.name
                  : o.id + ' ' + o.nickname
                : '车型：' + o.carBrand + o.carName + ' 车牌号：' + o.carNumber;

              return { label, value: o.id };
            });
          }

          stringOptions.value = options.value;
        })
        .finally(() => {
          // $q.loading.hide()
        });
    };

    const filterFn = (val, update) => {
      keyword.value = val;

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

    watch(
      () => keyword.value,
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
      keyword,
      filterFn,
    };
  },
});
</script>
