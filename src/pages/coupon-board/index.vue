<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>卡券模板</q-toolbar-title>

      <q-btn flat round icon="las la-plus" to="/coupon-board/new" />
    </q-toolbar>

    <div v-if="couponBoardList" class="q-mb-xl">
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-3">
            <q-input outlined label="模板名称" v-model="queryForm.name" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <DateTimeComponent title="开始时间" v-model="queryForm.startTime" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <DateTimeComponent title="结束时间" v-model="queryForm.endTime" />
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
          title="卡券模板表格"
          :rows="rows"
          :columns="columns"
          v-model:pagination="queryForm.pagination"
          row-key="id"
          @request="onRequest"
        >
          <template v-slot:body-cell-image="props">
            <q-td :props="props">
              <q-img :ratio="3 / 1" :src="props.row.image" />
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
      <q-btn fab icon="las la-plus" color="primary" to="/coupon-board/new" />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useBaseStore } from 'stores/base';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar, useMeta, date } from 'quasar';
import { api } from 'boot/axios';

import DateTimeComponent from 'components/DateTimeComponent.vue';

const metaData = {
  // sets document title
  title: '卡券模板',
};

export default {
  name: 'coupon-board-index',

  components: { DateTimeComponent },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();
    const $router = useRouter();

    const params = ref({});
    const queryForm = ref({
      name: '',
      startTime: '',
      endTime: '',
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
        label: '模板名称',
        field: 'name',
        sortable: true,
      },
      {
        name: 'productName',
        label: '商品名称',
        align: 'center',
        field: 'productName',
      },
      {
        name: 'image',
        label: '卡券背景图',
        align: 'center',
        field: 'image',
      },
      {
        name: 'deadline',
        label: '截止时间',
        align: 'left',
        field: 'deadline',
      },
      {
        name: 'deadlineDay',
        label: '指定收到后日期',
        align: 'center',
        field: 'deadlineDay',
        sortable: true,
      },
      {
        name: 'amount',
        label: '优惠金额',
        align: 'center',
        field: 'amount',
        sortable: true,
      },
      {
        name: 'productSkuName',
        label: '规格',
        align: 'center',
        field: 'productSkuName',
        sortable: true,
      },
      {
        name: 'memo',
        label: '备注',
        align: 'center',
        field: 'memo',
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
    const rows = ref([]);

    // 删除提示弹框
    const isDelConfirm = ref(false);
    // 行id
    const rowId = ref(null);

    const couponBoardList = ref([]);

    const loadData = (values = {}) => {
      $q.loading.show();

      let startTime = values.startTime
        ? Number(new Date(values.startTime)) / 1000
        : undefined;
      let endTime = values.endTime
        ? Number(new Date(values.endTime)) / 1000
        : undefined;

      const params = {
        pageNumber: values.pagination?.page || 1,
        pageSize: values.pagination?.rowsPerPage || 10,
        name: values.name || undefined,
        startTime,
        endTime,
      };

      api
        .get('/coupon_template', { params })
        .then((payload) => {
          console.log(payload);
          // return;
          let { totalNumber, list } = payload;
          let deadline = null;
          let deadlineDay = null;
          const couponBoard = list.map((o) => {
            const createdAt = date.formatDate(o.createdAt * 1000, 'YYYY-MM-DD');

            // 处理截止日期
            if (o.deadline == 0) {
              deadline = '';
            } else {
              deadline = date.formatDate(
                o.deadline * 1000,
                'YYYY-MM-DD HH:mm:ss'
              );
            }

            // 处理制定后到期日期
            if (o.deadlineDay == 0) {
              deadlineDay = '';
            } else {
              deadlineDay = o.deadlineDay;
            }

            return Object.assign({}, o, {
              createdAt,
              deadline,
              deadlineDay,
            });
          });

          rows.value = couponBoardList.value.concat(couponBoard);

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
        .delete(`/coupon_template/${id}`)
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
        name: 'coupon-board-edit',
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
      couponBoardList,
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
