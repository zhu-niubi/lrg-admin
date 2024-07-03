<template>
  <div>
    <div class="text-caption text-grey">{{ title }}</div>
    <!-- {{ options }} -->
    <div v-if="options">
      <q-option-group
        inline
        :options="options"
        :type="type"
        v-model="value"
        :disable="disable"
      />
    </div>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, computed } from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

import { groupBy, keyBy } from 'lodash';

export default defineComponent({
  name: 'CouponboardOption',
  props: [
    'modelValue',
    'title',
    'type',
    'optionValue',
    'defaultVal',
    'disable',
  ],
  emits: ['update:modelValue'],

  setup(props) {
    const $q = useQuasar();
    const store = useBaseStore();

    const modelVal = ref('');

    const options = ref(null);

    const loadData = () => {
      modelVal.value = props.modelValue ? props.modelValue : props.defaultVal;

      options.value = props.optionValue;
    };

    //
    onMounted(() => {
      loadData();
    });

    return {
      modelVal,
      options,
    };
  },

  computed: {
    value: {
      get() {
        return Number(this.modelVal);
      },
      set(value) {
        this.modelVal = value;
        this.$emit('update:modelValue', value);
      },
    },
  },
});
</script>
