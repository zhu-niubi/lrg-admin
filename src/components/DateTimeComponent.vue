<template>
  <div>
    <q-input :label="title" v-model="value">
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-date v-model="value" mask="YYYY-MM-DD HH:mm" :options="options">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>

      <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-time v-model="value" mask="YYYY-MM-DD HH:mm" format24h>
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script>
import { ref, defineComponent, computed, watch, onMounted } from 'vue';
import { useBaseStore } from 'stores/base';
import { date, useQuasar } from 'quasar';

export default defineComponent({
  name: 'DateTimeComponent',
  props: ['modelValue', 'title', 'options'],
  emits: ['update:modelValue'],

  setup(props) {
    const $q = useQuasar();
    const store = useBaseStore();

    //
    const modelVal = ref('');

    modelVal.value = props.modelValue ? props.modelValue : '';

    //
    return {
      modelVal,
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
