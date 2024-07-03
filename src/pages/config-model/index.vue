<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>3D模型配置</q-toolbar-title>

      <q-btn
        flat
        round
        icon="las la-plus"
        :to="'/config-model/new/' + configVal"
        v-show="configVal !== 'three'"
      />
    </q-toolbar>

    <div class="q-mb-xl">
      <div class="q-pa-md">
        <div>
          <q-btn-toggle
            v-model="configVal"
            push
            glossy
            toggle-color="primary"
            :options="[
              { label: '车型', value: 'one' },
              { label: '车膜', value: 'two' },
              { label: '视频', value: 'three' },
            ]"
          />
        </div>
      </div>

      <div class="q-pa-md" v-show="configVal === 'one'">
        <q-table
          flat
          title="车型配置表格"
          :rows="rows"
          :columns="columns"
          v-model:pagination="queryForm.pagination"
          row-key="id"
          @request="onRequest"
        >
          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              {{
                props.row.type == 1
                  ? '车型'
                  : props.row.type == 3
                  ? '场景'
                  : props.row.type == 4
                  ? '视频'
                  : ''
              }}
            </q-td>
          </template>
          <template v-slot:body-cell-resource="props">
            <q-td :props="props">
              <q-img
                class="image-xs"
                :ratio="1"
                :src="props.row.resource"
                v-show="props.row.type !== 2"
              />
              <div v-show="props.row.type === 2">{{ props.row.resource }}</div>
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

                <q-btn
                  v-show="props.row.type === 1"
                  flat
                  round
                  color="grey"
                  icon="lab la-youtube"
                  :to="'/config-model/new/' + props.row.id"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>

      <div class="q-pa-md" v-show="configVal === 'two'">
        <q-table
          flat
          title="车膜配置表格"
          :rows="rowsM"
          :columns="columnsM"
          v-model:pagination="queryForm.pagination"
          row-key="id"
          @request="onRequest"
        >
          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              {{ props.row.type == 2 ? '车膜' : '' }}
            </q-td>
          </template>
          <template v-slot:body-cell-resource="props">
            <q-td :props="props">
              <q-img
                v-if="props.row.type === 2 && !props.row.parentId"
                class="image-xs"
                :ratio="1"
                :src="props.row.resource"
              />
              <div v-else>{{ props.row.resource }}</div>
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

      <div class="q-pa-md" v-show="configVal === 'three'">
        <q-table
          flat
          title="视频表格"
          :rows="rowsVideo"
          :columns="columnsVideo"
          v-model:pagination="queryForm.pagination"
          row-key="id"
          @request="onRequest"
        >
          <template v-slot:body-cell-title="props">
            <q-td :props="props">
              <q-img class="image-xs" :ratio="1" :src="props.row.title" />
            </q-td>
          </template>
          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              {{ props.row.type == 4 ? '视频' : '' }}
            </q-td>
          </template>
          <template v-slot:body-cell-resource="props">
            <q-td :props="props">
              <video
                class="image-md"
                :ratio="1"
                :src="props.row.resource"
                v-show="props.row.type === 4"
              />
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

                <q-btn
                  v-show="props.row.type === 1"
                  flat
                  round
                  color="grey"
                  icon="lab la-youtube"
                  :to="'/config-model/new/' + props.row.id"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- delete dialog -->
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
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
      v-show="configVal !== 'three'"
    >
      <q-btn
        fab
        icon="las la-plus"
        color="primary"
        :to="'/config-model/new/' + configVal"
      />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useBaseStore } from 'stores/base';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar, useMeta, date } from 'quasar';
import { api } from 'boot/axios';

const metaData = {
  // sets document title
  title: '3D模型配置',
};

export default {
  name: 'config-model-index',

  components: {},

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();
    const $router = useRouter();

    const modeTypeList = ref([
      { value: 1, label: '车型' },
      { value: 2, label: '车膜' },
      { value: 3, label: '场景' },
      { value: 4, label: '视频' },
    ]);

    const rows = ref([]);
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
        name: 'title',
        align: 'center',
        label: '标题',
        field: 'title',
        sortable: true,
      },
      {
        name: 'type',
        align: 'center',
        label: '类型',
        field: 'type',
        sortable: true,
      },
      {
        name: 'resource',
        align: 'center',
        label: '资源',
        field: 'resource',
        sortable: true,
      },
      {
        name: 'model',
        align: 'center',
        label: '模型',
        field: 'model',
        sortable: true,
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
    const rowsVideo = ref([]);
    const columnsVideo = ref([
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
        label: '类型',
        field: 'type',
        sortable: true,
      },

      {
        name: 'modelName',
        align: 'center',
        label: '车型',
        field: 'modelName',
        sortable: true,
      },
      {
        name: 'parentName',
        align: 'center',
        label: '颜色',
        field: 'parentName',
        sortable: true,
      },
      {
        name: 'title',
        align: 'center',
        label: '封面',
        field: 'title',
        sortable: true,
      },
      {
        name: 'resource',
        align: 'center',
        label: '资源',
        field: 'resource',
        sortable: true,
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
    const rowsM = ref();
    const columnsM = ref([
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
        name: 'title',
        align: 'center',
        label: '名称',
        field: 'title',
        sortable: true,
      },
      {
        name: 'type',
        align: 'center',
        label: '类型',
        field: 'type',
        sortable: true,
      },
      {
        name: 'resource',
        align: 'center',
        label: '颜色',
        field: 'resource',
        sortable: true,
      },
      {
        name: 'parentName',
        align: 'center',
        label: '父级系列',
        field: 'parentName',
        sortable: true,
      },
      {
        name: 'tag',
        align: 'center',
        label: '系列',
        field: 'tag',
        sortable: true,
        format: (val) => {
          return val?.split('/')[0];
        },
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

    const params = ref({});
    const queryForm = ref({
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10,
      },
    });

    // 选择需要配置哪个
    const configVal = ref('one');

    // 删除提示弹框
    const isDelConfirm = ref(false);

    // 添加视频弹框
    const isShowVideo = ref(false);

    // 设置需要添加得视频绑定得是哪个车型
    const carModel = ref(null);

    // 行id
    const rowId = ref(null);

    const loadData = () => {
      $q.loading.show();

      api
        .get('/config_model')
        .then((payload) => {
          // console.log(payload);

          const formData = payload?.map((o) => {
            const createdAt = date.formatDate(
              o.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );

            return Object.assign({}, o, {
              createdAt,
            });
          });

          rows.value = formData.filter((i) => {
            return i.type !== 2 && i.type !== 4;
          });

          rowsM.value = formData.filter((i) => {
            formData.map((r) => {
              if (i.parentId === r.id) {
                i.parentName = r.title;
              }
            });
            return i.type === 2;
            // return i.type === 2 && i.parentId;
          });

          rowsVideo.value = formData.filter((i) => {
            formData.map((r) => {
              if (i.parentId === r.id) {
                i.parentName = r.title;
              }
              if (i.type === 4 && Number(i.model) === r.id) {
                i.modelName = r.title;
              }
            });
            return i.type === 4;
          });

          // console.log(rowsM.value);
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

    // 绑定视频
    const bindVideo = (i) => {
      // 弹框打开
      isShowVideo.value = true;
      carModel.value = i;
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
        .delete(`/config_model/${id}`)
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
        name: 'config-model-edit',
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
      modeTypeList,
      columns,
      columnsM,
      rows,
      rowsM,
      rowsVideo,
      columnsVideo,
      isDelConfirm,
      configVal,
      queryForm,
      isShowVideo,
      carModel,
      bindVideo,
      delRowData,
      loadData,
      delRowDataOk,
      goto,
      onRequest,
    };
  },
};
</script>
