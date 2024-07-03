<template>
  <div v-if="filterOptions">
    <!-- {{ value }} -->
    <q-select
      filled
      hint="Separate multiple values by [,;|]"
      use-input
      use-chips
      multiple
      input-debounce="0"
      @new-value="createValue"
      @filter="filterFn"
      :options="filterOptions"
      v-model="model"
      :label="title"
    />
  </div>
</template>

<script>
import { ref, defineComponent, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default defineComponent({
  name: 'SelectMultiple',
  props: ['modelValue', 'title', 'baseUrl'],
  emits: ['update:modelValue'],

  setup(props) {
    // console.log(props.modelValue);
    const $q = useQuasar();

    const modelVal = ref('');

    modelVal.value = props.modelValue
      ? props.modelValue._id || props.modelValue
      : '';

    const model = ref(null);
    const stringOptions = ref([]);
    const filterOptions = ref([]);

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

          stringOptions.value = list.map((o) => {
            const label = o.nickname ? o.nickname : o.name;

            return { label, value: o.id };
          });

          filterOptions.value = stringOptions.value;
        })
        .finally(() => {
          // $q.loading.hide()
        });
    };

    const createValue = (val, done) => {
      if (val.length > 0) {
        const modelValue = (model.value || []).slice();

        val
          .split(/[,;|]+/)
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
          .forEach((v) => {
            if (stringOptions.value.includes(v) === false) {
              stringOptions.value.push(v);
            }
            if (modelValue.includes(v) === false) {
              modelValue.push(v);
            }
          });

        done(null);
        model.value = modelValue;
      }
    };

    const filterFn = (val, update) => {
      update(() => {
        if (val === '') {
          filterOptions.value = stringOptions.value;
        } else {
          const needle = val;
          filterOptions.value = stringOptions.value.filter((v) => {
            console.log(v.label.indexOf(needle) > -1);
            v.label.indexOf(needle) > -1;
          });
          console.log(filterOptions.value);
        }
      });
    };

    //
    onMounted(() => {
      loadData();
    });

    return {
      model,
      modelVal,
      filterOptions,
      filterFn,
      createValue,
      stringOptions,
    };
  },

  computed: {
    value: {
      get() {
        return this.modelVal;
      },
      set(value) {
        this.modelVal = value;
        this.$emit('update:modelValue', value);
      },
    },
  },
});
</script>
