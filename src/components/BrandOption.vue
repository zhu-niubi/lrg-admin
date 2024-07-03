<template>
  <div class="text-caption text-grey">{{ title }}</div>
  <!-- {{ options }} -->
  <div v-if="options">
    <q-option-group
      inline
      :options="options"
      :type="isMultiple ? 'checkbox' : 'radio'"
      v-model="value"
    />
  </div>
</template>

<script>
import { ref, defineComponent, computed, watch, onMounted } from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'BrandOption',
  props: {
    modelValue: { type: undefined },
    title: { type: String, default: '品牌列表' },
  },
  emits: ['update:modelValue'],

  setup(props) {
    // console.log(props.modelValue);
    const $q = useQuasar();
    const store = useBaseStore();

    //
    const modelVal = ref(null);
    const isMultiple = Array.isArray(props.modelValue);

    modelVal.value = isMultiple ? props.modelValue.map((o) => o._id || o) : '';

    //
    const brandDocs = computed(() =>
      store.appPredata ? store.appPredata.brandDocs || [] : []
    );

    const options = computed(() => {
      return brandDocs.value.map((o) => {
        return { label: `${o.name}`, value: o._id };
      });
    });

    //
    return {
      modelVal,
      isMultiple,
      options,
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
