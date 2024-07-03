<template>
  <div>
    <q-input outlined :label="title" v-model="rangeDateTime">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy
            ref="qDateProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date v-model="value" range>
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
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
  name: 'RangeDateTime',
  props: ['modelValue', 'title'],
  emits: ['update:modelValue'],

  setup(props) {
    const $q = useQuasar();
    const store = useBaseStore();

    //
    const modelVal = ref('');

    const loadData = () => {
      modelVal.value = props.modelValue ? props.modelValue : '';
    };

    //
    onMounted(() => {
      loadData();
    });
    //
    return {
      modelVal,
    };
  },

  computed: {
    value: {
      get() {
        console.log(this.modelVal);

        return this.modelVal;
      },
      set(value) {
        console.log(value);

        this.modelVal = value;

        this.$emit('update:modelValue', value);
      },
    },
    rangeDateTime: {
      get() {
        let newRangeDateTime = this.modelVal
          ? this.modelVal.from + ' - ' + this.modelVal.to
          : '';
        return newRangeDateTime;
      },
    },
  },
});
</script>
