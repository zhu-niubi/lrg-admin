<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>会员权益</q-toolbar-title>

      <q-btn flat round icon="las la-plus" to="/welfare/new" />
    </q-toolbar>

    <div v-if="couponTypeList" class="q-mb-xl">
      <div class="q-pa-md">
        <q-table
          flat
          title="会员权益表格"
          :rows="rows"
          :columns="columns"
          row-key="id"
        >
          <template v-slot:body-cell-level="props">
            <q-td :props="props">
              {{
                props.row.level === 1
                  ? '等级一'
                  : props.row.level === 2
                  ? '等级二'
                  : props.row.level === 3
                  ? '等级三'
                  : props.row.level === 4
                  ? '等级四'
                  : props.row.level === 5
                  ? '等级五'
                  : props.row.level === 6
                  ? '等级六'
                  : props.row.level === 7
                  ? '等级七'
                  : props.row.level === 8
                  ? '等级八'
                  : props.row.level === 9
                  ? '等级九'
                  : props.row.level === 10
                  ? '等级十'
                  : ''
              }}
            </q-td>
          </template>
          <template v-slot:body-cell-image="props">
            <q-td :props="props">
              <q-img class="image-xs" :ratio="1" :src="props.row.image" />
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
      <q-btn fab icon="las la-plus" color="primary" to="/welfare/new" />
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
  title: '会员权益',
};

export default {
  name: 'welfare-index',

  components: {},

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();
    const $router = useRouter();

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
        name: 'name',
        align: 'center',
        label: '权益名称',
        field: 'name',
        sortable: true,
      },
      {
        name: 'level',
        align: 'center',
        label: '权益等级',
        field: 'level',
        sortable: true,
      },
      {
        name: 'image',
        align: 'center',
        label: '图片',
        field: 'image',
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

    // 删除提示弹框
    const isDelConfirm = ref(false);
    // 行id
    const rowId = ref(null);

    const couponTypeList = ref([]);

    const loadData = () => {
      $q.loading.show();

      api
        .get('/welfare')
        .then((payload) => {
          // console.log(payload);

          // let { totalNumber, list } = payload;

          const couponType = payload.map((o) => {
            const createdAt = date.formatDate(
              o.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );

            return Object.assign({}, o, {
              createdAt,
            });
          });

          rows.value = couponTypeList.value.concat(couponType);
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
        .delete(`/welfare/${id}`)
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
        name: 'welfare-edit',
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
      queryForm,
      couponTypeList,
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
