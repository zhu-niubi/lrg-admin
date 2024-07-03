<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>积分明细</q-toolbar-title>
    </q-toolbar>

    <div v-if="couponList" class="q-mb-xl">
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-3">
            <q-input outlined label="手机号" v-model="queryForm.phoneNumber" />
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
          title="用户管理表格"
          :rows="rows"
          :columns="columns"
          v-model:pagination="queryForm.pagination"
          row-key="id"
          @request="onRequest"
        >
          <template v-slot:body-cell-action="props">
            <q-td :props="props">
              {{
                props.row.action === 1
                  ? '消费'
                  : props.row.action === 2
                  ? '门店发放'
                  : props.row.action === 3
                  ? '活动'
                  : props.row.action === 4
                  ? '退款退回'
                  : props.row.action === 5
                  ? '新客户介绍'
                  : props.row.action === 6
                  ? '转发施工案例' : ''
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-quantity="props">
            <q-td :props="props">
              <span class="text-red" v-if=" props.row.action === 1">{{  "-"+ props.row.quantity }}</span>
              <span class="text-green" v-else>{{ "+"+ props.row.quantity }}</span>
            </q-td>
          </template>

        </q-table>
      </div>
    </div>
  </q-page>

</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

import { useRouter } from 'vue-router';
import { useQuasar, useMeta, date } from 'quasar';
import { api } from 'boot/axios';

const metaData = {
  // sets document title
  title: '积分明细',
};

export default {
  name: 'points-details-index',

  components: {},

  setup() {
    const $q = useQuasar();

    const $router = useRouter();

    const params = ref({});

    const fromData = ref({
      integral:0,
      reason:''
    });
    const alert = ref(false);
    const confirm = ref(false);
    //发送积分弹窗开关
    const issuePoints = ref(false);

    //行id
    const rowId = ref();

    const myForm = ref(null);

    const queryForm = ref({
      phoneNumber: null,
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10,
      },
    });

    //用户管理表格栏目定义
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
        name: 'userName',
        align: 'left',
        label: '姓名',
        field: 'userName',
        sortable: true,
      },

      {
        name: 'phoneNumber',
        label: '手机号',
        align: 'center',
        field: 'phoneNumber',
      },

      {
        name: 'quantity',
        align: 'left',
        label: '积分增减',
        field: 'quantity',
        sortable: true,
      },

      {
        name: 'sum',
        align: 'left',
        label: '剩余积分',
        field: 'sum',
        sortable: true,
      },

      {
        name: 'orderNumber',
        label: '订单号',
        align: 'center',
        field: 'orderNumber',
      },

      {
        name: 'action',
        label: '方式',
        align: 'center',
        field: 'action',
      },
      {
        name: 'memo',
        label: '详情',
        align: 'center',
        field: 'memo',
      },

      {
        name: 'createdAt',
        label: '日期',
        align: 'center',
        field: 'createdAt',
      },

    ]);

    const rows = ref([]);

    const couponList = ref([]);

    const loadData = (values = {}) => {
      $q.loading.show();
      const params = {
        pageNumber: values.pagination?.page || 1,
        pageSize: values.pagination?.rowsPerPage || 10,
        phoneNumber: values.phoneNumber || undefined,
      };

      api
        .get('/point-record', { params })
        .then((payload) => {
          // return;
          let { totalNumber, list } = payload;

          const couponData = list.map((o) => {
            const createdAt = date.formatDate(
              o.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );

            return Object.assign({}, o, {
              createdAt,
            });
          });
          console.log(couponData)

          rows.value = couponList.value.concat(couponData);
          console.log(rows.value)

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

    // 按手机号查询
    const onQuery = () => {
      params.value = { ...queryForm.value };
      loadData(params.value);
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
      couponList,
      columns,
      rows,
      loadData,
      onQuery,
      onRequest,
      alert,
      confirm,
      issuePoints,
      fromData,
      myForm

    };
  },
};
</script>
