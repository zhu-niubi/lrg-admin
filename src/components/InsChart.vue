<template>
  <q-card flat class="full-width full-height">
    <q-card-section v-if="insObj && insObj.insData">
      <!-- {{ insObj }} -->
      <q-toolbar class="q-px-none q-py-lg">
        <q-toolbar-title class="text-center">
          <div class="text-h4">{{ title }}</div>
          <div class="text-body2">{{ `共${insObj.insCount}条` }}</div>
        </q-toolbar-title>
      </q-toolbar>

      <div class="row q-gutter-md justify-center text-center">
        <div
          v-for="(item, index) in insObj.insData"
          :key="index"
          :style="item.itemStyle"
          class="q-pa-md rounded-borders bg-grey-1"
        >
          <div class="text-subtitle2 q-py-sm">{{ item.name }}</div>
          <div class="text-h4">{{ item.value }}</div>
        </div>
      </div>
    </q-card-section>

    <q-card-section v-if="chartOption">
      <v-chart ref="echartRef" class="mg-chart" :option="chartOption" />
    </q-card-section>

    <!-- <pre>{{ insObj }}</pre> -->
  </q-card>

  <q-resize-observer @resize="onResize" />
</template>

<script>
import { ref, computed, defineComponent } from 'vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'InsChart',

  // props: ['data', 'title'],
  props: {
    title: String,
    data: Object,
  },

  setup(props) {
    const $q = useQuasar();

    const echartRef = ref(null);

    const insObj = computed(() => props.data || {});

    //
    const chartOption = computed(() => {
      return {
        title: {
          text: '状态统计',
          subtext: `共${insObj.value.insCount}条`,
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: '5%',
          left: 'left',
          orient: 'vertical',
        },
        series: [
          {
            name: '状态统计',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '40',
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: insObj.value.insData,
          },
        ],
      };
    });

    //
    const onResize = (size) => {
      // console.log(size);
      // {
      //   width: 20 // width of container (in px)
      //   height: 50 // height of container (in px)
      // }
      echartRef.value.resize();
    };

    return {
      echartRef,
      onResize,
      insObj,
      chartOption,
    };
  },
});
</script>
