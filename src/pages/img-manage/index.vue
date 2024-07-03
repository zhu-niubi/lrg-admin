<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>图片管理</q-toolbar-title>

      <q-btn flat round icon="las la-plus" to="/img-manage/new" />
    </q-toolbar>

    <div v-if="imageList" class="q-mb-xl">
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-3">
            <GoodsOption
              title="图片类型"
              v-model="queryForm.type"
              :optionsVal="imageType"
            />
          </div>
          <div class="col-xs-12 col-sm-3">
            <q-btn
              class="q-px-xl q-py-md"
              color="primary"
              @click="onQuery"
              label="查询"
            />
          </div>
        </div>
      </div>

      <div class="q-pa-md">
        <q-table
          flat
          title="图片表格"
          :rows="rows"
          :columns="columns"
          v-model:pagination="queryForm.pagination"
          row-key="id"
          @request="onRequest"
        >
          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              {{
                imageType.find((o) => {
                  return o.value === props.row.type;
                }).label
              }}
            </q-td>
          </template>
          <template v-slot:body-cell-url="props">
            <q-td :props="props">
              <q-img
                class="image-xs"
                :ratio="1"
                :src="props.row.url"
                v-if="
                  props.row.url.slice(
                    props.row.url.lastIndexOf('.'),
                    props.row.url.length
                  ) !== '.mp4'
                "
              />
              <video class="image-xs" :ratio="1" :src="props.row.url" v-else />
            </q-td>
          </template>
          <template v-slot:body-cell-todo="props">
            <q-td :props="props">
              <div>
                <q-btn
                  flat
                  round
                  color="grey"
                  icon="las la-edit"
                  @click="goto(props.row)"
                />
                <q-btn
                  flat
                  round
                  color="grey"
                  icon="las la-trash-alt"
                  @click="delRowData(props.row.id)"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- dialog -->
    <q-dialog v-model="isDelConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar
            icon="las la-exclamation-triangle"
            color="primary"
            text-color="white"
          />
          <span class="q-ml-sm">此操作将不可撤销，确定要删除吗？</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn
            flat
            label="确定"
            color="primary"
            v-close-popup
            @click="delRowDataOk"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- add -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="las la-plus" color="primary" to="/img-manage/new" />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useBaseStore } from 'stores/base';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar, useMeta, date } from 'quasar';
import { api } from 'boot/axios';

import GoodsOption from 'components/GoodsOption.vue';

const metaData = {
  // sets document title
  title: '图片管理',
};

export default {
  name: 'img-manage-index',

  components: { GoodsOption },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();
    const $router = useRouter();

    const params = ref({});

    const queryForm = ref({
      type: '',
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10,
      },
    });

    const columns = ref([
      {
        name: 'id',
        required: true,
        label: '#',
        align: 'left',
        field: (row) => row.id,
        format: (val) => `${val}`,
        sortable: true,
      },
      {
        name: 'type',
        align: 'center',
        label: '图片类型',
        field: 'type',
        sortable: true,
      },
      {
        name: 'url',
        align: 'center',
        label: '图片',
        field: 'url',
      },
      {
        name: 'createdAt',
        label: '创建时间',
        align: 'center',
        field: 'createdAt',
      },
      {
        name: 'todo',
        label: '操作',
        align: 'center',
        field: 'todo',
        sortable: true,
      },
    ]);
    const rows = ref([]);

    // 图片类型
    const imageType = ref([
      { label: '开机屏轮播图', value: 1 },
      { label: '授权登录背景图', value: 2 },
      { label: '我的-页面背景', value: 3 },
      { label: '个人档案背景图', value: 4 },
      { label: '卡券背景图', value: 5 },
      { label: '商城-banner图', value: 6 },
      { label: '首页-活动分享背景图', value: 7 },
      { label: '活动分享-页面展示图', value: 8 },
      { label: '首页-banner背景底图', value: 9 },
      { label: '首页-品牌故事视频', value: 10 },
      { label: '首页-星级技师默认图片', value: 11 },
      {label: '首页-星级技师展开图片', value: 12},
      {label: '首页-公司信息及介绍', value: 13},
      {label: '活动分享-纳分享有好礼', value: 14},
      {label: '活动分享-我的奖励', value: 15},
      {label: '活动分享-活动须知', value: 16},
      {label: '质保查询背景图', value: 17},
      {label: '商城背景图', value: 18},
      {label: '施工单案例分享-背景图', value: 19},
      {label: '施工单案例分享-海报背景', value: 20},
      {label: '施工单案例分享-海报banner', value: 21},
      {label: 'NFC识别GIF', value: 22},

    ]);

    // 删除提示弹框
    const isDelConfirm = ref(false);
    // 行id
    const rowId = ref(null);

    const imageList = ref([]);

    const loadData = (values = {}) => {
      $q.loading.show();

      const params = {
        pageNumber: values.pagination?.page || 1,
        pageSize: values.pagination?.rowsPerPage || 10,
        type: values.type || undefined,
      };

      api
        .get('/image', { params })
        .then((payload) => {
          console.log(payload);
          // return;
          let { totalNumber, list } = payload;

          const images = list.map((o) => {
            const createdAt = date.formatDate(
              o.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );

            return Object.assign({}, o, {
              createdAt,
            });
          });

          rows.value = imageList.value.concat(images);

          queryForm.value.pagination.rowsNumber = totalNumber;
        })
        .catch((e) => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: '加载失败!' + e,
            icon: 'report_problem',
          });
        })
        .finally(() => {
          $q.loading.hide();
        });
    };

    // 查询
    const onQuery = () => {
      params.value = { ...queryForm.value };
      loadData(params.value);
    };

    // 删除
    const delRowData = (index) => {
      // 弹框打开
      isDelConfirm.value = true;
      // 保存删除的行id
      rowId.value = index;
    };

    const delRowDataOk = () => {
      let id = rowId.value;
      api
        .delete(`/image/${id}`)
        .then((payload) => {
          $q.notify({
            color: 'success',
            position: 'top',
            message: '删除成功!',
            icon: 'lar la-check-circle',
          });
          loadData(params.value);
          // return;
        })
        .catch((e) => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: '删除失败!' + e,
            icon: 'report_problem',
          });
        })
        .finally(() => {
          // $q.loading.hide();
        });
    };

    // 跳转详情页
    const goto = (val) => {
      $router.push({
        name: 'image-edit',
        params: val,
      });
    };

    // needs to be called in setup()
    useMeta(metaData);

    //挂载
    onMounted(() => {
      loadData();
    });

    //
    onBeforeUnmount(() => {
      // we do cleanup
    });

    const onRequest = (props) => {
      const { page, rowsPerPage, sortBy, descending, rowsNumber } =
        props.pagination;

      // don't forget to update local pagination object
      queryForm.value.pagination.page = page;
      queryForm.value.pagination.rowsPerPage = rowsPerPage || rowsNumber;
      queryForm.value.pagination.sortBy = sortBy;
      queryForm.value.pagination.descending = descending;

      params.value.pagination = queryForm.value.pagination;

      loadData(params.value);
    };

    return {
      params,
      imageType,
      queryForm,
      imageList,
      columns,
      rows,
      loadData,
      delRowData,
      isDelConfirm,
      delRowDataOk,
      goto,
      onQuery,
      onRequest,
    };
  },
};
</script>
