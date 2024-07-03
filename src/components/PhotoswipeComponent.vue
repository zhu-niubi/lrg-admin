<template>
  <div>
    <div>{{ title }}</div>
    <div class="text-body2 flex items-center q-gutter-md">
      <div v-for="(item, index) in items" :key="index" class="bg-grey-3 rounded-borders relative-position">
        <q-img :src="`${item}`" style="width: 120px; height: 120px" fit="cover" @click="handleDialog(index)" />
      </div>
    </div>

    <!-- 幻灯片弹窗 -->
    <q-dialog ref="dialogRef" full-width>
      <q-card v-if="dialogSlides && dialogSlides.length !== 0">
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1">[图集]{{ title }}</div>
          </q-toolbar-title>
          <q-btn round flat icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
          <div class="q-pa-md">
            <q-carousel swipeable animated v-model="qialogSlideIndex" thumbnails infinite>
              <q-carousel-slide v-for="(itemSlide, indexSlide) in dialogSlides" :key="indexSlide" :name="indexSlide"
                :img-src="itemSlide">
              </q-carousel-slide>
            </q-carousel>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default defineComponent({
  name: 'PhotoswipeComponent',
  props: ['modelValue', 'title', 'items'],

  setup(props) {
    const $q = useQuasar();

    const dialogRef = ref(null);
    const qialogSlideIndex = ref(0);
    const dialogSlides = ref([]);

    const handleDialog = (index) => {
      qialogSlideIndex.value = index;
      dialogSlides.value = props.items;
      dialogRef.value.show();
    };

    // watch(
    //   () => props.baseUrl,
    //   () => {
    //     loadData();
    //   }
    // );

    //
    // onMounted(() => {

    // });
    return {
      dialogRef,
      qialogSlideIndex,
      dialogSlides,
      handleDialog,
    };
  },
});
</script>
