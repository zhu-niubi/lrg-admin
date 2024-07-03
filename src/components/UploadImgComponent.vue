<template>
  <div>
    <q-card flat>
      <q-card-section>
        <div class="row q-col-gutter-lg">
          <div class="col">
            <q-toolbar>
              <q-toolbar-title> {{ title }} </q-toolbar-title>
              <div>共 {{ curAttachments.length }}个</div>
            </q-toolbar>

            <q-uploader
              url=""
              :headers="[
                { name: 'Content-Type', value: 'multipart/form-data' },
              ]"
              ref="uploaderRef"
              label="上传文件"
              color="grey-3"
              text-color="grey-10"
              class="full-width"
              :max-file-size="10 * 1024 * 1024"
              accept=".jpg,.jpeg,.png,.gif,.webp,.glb,.mp4"
              @added="onAdded"
              auto-upload
              multiple
            >
              <template v-slot:list>
                <q-card-section v-if="curAttachments.length > 0">
                  <q-scroll-area style="height: 130px">
                    <Container orientation="horizontal" @drop="onDrop">
                      <Draggable
                        v-for="(item, index) in curAttachments"
                        :key="index"
                      >
                        <div
                          class="q-ma-xs bg-grey-3 rounded-borders relative-position"
                          v-if="item.isImg"
                        >
                          <q-img
                            :src="`${item.url}`"
                            style="width: 120px; height: 120px"
                            fit="contain"
                            @click="handleDialog(index)"
                          />

                          <q-btn
                            flat
                            round
                            size="sm"
                            icon="las la-times"
                            class="absolute-top-right"
                            @click="onAttachRemove(index)"
                          />
                        </div>
                        <div
                          v-if="!item.isImg && item.url.indexOf('.mp4') === -1"
                          class="q-ma-xs bg-grey-3 rounded-borders relative-position"
                        >
                          <div class="q-pa-md">
                            {{ item.url }}
                          </div>
                          <q-btn
                            flat
                            round
                            size="sm"
                            icon="las la-times"
                            class="absolute-top-right"
                            @click="onAttachRemove(index)"
                          />
                        </div>
                        <div
                          v-if="item.url.indexOf('.mp4') !== -1"
                          class="q-ma-xs bg-grey-3 rounded-borders relative-position"
                        >
                          <video
                            :src="item.url"
                            style="width: 120px; height: 120px"
                            fit="cover"
                            @click="handleDialog(index)"
                          />
                          <q-btn
                            flat
                            round
                            size="sm"
                            icon="las la-times"
                            class="absolute-top-right"
                            @click="onAttachRemove(index)"
                          />
                        </div>
                      </Draggable>
                    </Container>
                  </q-scroll-area>
                </q-card-section>
              </template>
            </q-uploader>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 幻灯片弹窗 -->
    <q-dialog ref="dialogRef" full-width>
      <q-card v-if="dialogSlides.length !== 0 || dialogSlidesVideo !== 0">
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1">[图集]{{ title }}</div>
          </q-toolbar-title>
          <q-btn round flat icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
          <div class="q-pa-md">
            <q-carousel
              v-if="dialogSlides.length !== 0"
              swipeable
              animated
              v-model="qialogSlideIndex"
              thumbnails
              infinite
            >
              <q-carousel-slide
                v-for="(itemSlide, indexSlide) in dialogSlides"
                :key="indexSlide"
                :name="indexSlide"
                :img-src="itemSlide.url"
              >
              </q-carousel-slide>
            </q-carousel>

            <div v-if="dialogSlidesVideo.length !== 0" class="q-pt-md">
              <q-parallax
                v-for="(itemSlideV, indexSlideV) in dialogSlidesVideo"
                :key="indexSlideV"
              >
                <template v-slot:media>
                  <video width="720" height="440" autoplay loop muted>
                    <source type="video/mp4" :src="itemSlideV.url" />
                  </video>
                </template>

                <h3 class="text-white">Video</h3>
              </q-parallax>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, defineComponent, onMounted, watch } from 'vue';
import { useBaseStore } from 'stores/base';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import * as _ from 'lodash';

import { Container, Draggable } from 'vue3-smooth-dnd';

export default defineComponent({
  name: 'UploadImgComponent',

  props: {
    title: { type: String, default: '图片' },
    modelValue: {
      type: Array,
      default: () => {
        return [];
      },
    }, // [ObjectId]
  },

  emits: ['update:modelValue'],

  components: { Container, Draggable },

  setup(props, context) {
    const $q = useQuasar();
    const store = useBaseStore();
    const userToken = computed(() => store.userToken);
    const hostUri = computed(() => store.hostUri);

    const dialogRef = ref(null);
    const qialogSlideIndex = ref(0);
    const dialogSlides = ref([]);

    const uploadUri = computed(() => {
      return `${hostUri.value}/upload`;
    });

    const curValues = props.modelValue ? props.modelValue : [];
    const curAttachments = ref([]);

    const dialogSlidesVideo = ref(null);

    const uploaderRef = ref(null);
    const upfiles = ref();
    const updir = 'file';

    const newValues = ref([]);

    watch(
      curAttachments,
      (val, preVal) => {
        // console.log("watch.newValues", val, preVal);
        if (!val) {
          newValues.value = [];
          return;
        }
        //
        newValues.value = curAttachments.value.map((o) => o._id || o);
      },
      { deep: true }
    );

    watch(newValues, (val, preVal) => {
      // console.log("watch.newValues", val, preVal);
      //
      context.emit('update:modelValue', val);
    });

    const loadData = () => {
      if (curValues?.length) {
        // console.log(curValues);
        // return;
        curValues?.map((o) => {
          let imgType = o?.url.substring(o?.url.lastIndexOf('.') + 1);
          o.imgType = imgType;
          o.isImg = isAssetTpeImg(imgType);
        });
        // console.log(curValues);

        curAttachments.value = curValues;
      }
    };

    // dnd
    const onDrop = (dropResult) => {
      curAttachments.value = applyDrag(curAttachments.value, dropResult);
    };

    const applyDrag = (arr, dragResult) => {
      const { removedIndex, addedIndex, payload } = dragResult;

      if (removedIndex === null && addedIndex === null) return arr;
      const result = [...arr];
      let itemToAdd = payload;

      if (removedIndex !== null) {
        itemToAdd = result.splice(removedIndex, 1)[0];
      }
      if (addedIndex !== null) {
        result.splice(addedIndex, 0, itemToAdd);
      }
      return result;
    };

    //
    // upload
    const onAdded = (files) => {
      files.map((f) => {
        const formData = new FormData();
        formData.append('file', f);

        api
          .post('/upload', formData)
          .then((payload) => {
            // console.log(payload);
            let imgType = payload?.url.substring(
              payload?.url.lastIndexOf('.') + 1
            );

            payload.isImg = isAssetTpeImg(imgType);

            // console.log(payload);

            curAttachments.value.push(payload);

            $q.notify({
              color: 'success',
              position: 'top',
              message: '上传成功!',
              icon: 'lar la-check-circle',
            });
          })
          .finally(() => {
            $q.loading.hide();
          });
      });
    };

    // 判断后缀格式是否为图片
    const isAssetTpeImg = (ext) => {
      return (
        ['png', 'jpg', 'jpeg', 'webp', 'svg'].indexOf(ext.toLowerCase()) !== -1
      );
    };

    //
    const onAttachRemove = (i) => {
      // console.log(i);
      curAttachments.value.splice(i, 1);
    };

    // 放大图片
    const handleDialog = (index) => {
      qialogSlideIndex.value = index;

      // 判断是图片还是视频
      let imageList = [],
        videoList = [];
      curAttachments.value.map((c) => {
        if (c.url.indexOf('.mp4') !== -1) {
          videoList.push(c);
        } else {
          imageList.push(c);
        }
      });
      dialogSlidesVideo.value = videoList;
      dialogSlides.value = imageList;
      dialogRef.value.show();
    };

    //
    onMounted(() => {
      loadData();
    });

    return {
      hostUri,
      newValues,
      curValues,
      curAttachments,
      uploaderRef,
      upfiles,
      updir,
      uploadUri,
      userToken,
      dialogRef,
      qialogSlideIndex,
      dialogSlides,
      dialogSlidesVideo,
      handleDialog,
      onDrop,
      onAdded,
      onAttachRemove,
    };
  },

  computed: {
    value: {
      get() {
        return this.modelValue.map((o) => o._id || o);
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
  },
});
</script>
