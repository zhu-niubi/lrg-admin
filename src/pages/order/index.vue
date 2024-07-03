<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>订单列表</q-toolbar-title>

      <!-- <q-btn flat round icon="las la-plus" to="/order/new" /> -->
    </q-toolbar>

    <div class="q-mb-xl">
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-3">
            <q-input outlined label="订单号" v-model="queryForm.orderNumber" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <SelectInputFiler
              title="商品ID"
              v-model="queryForm.productId"
              baseUrl="/product"
              searchName="productId"
            />
          </div>
          <div class="col-xs-12 col-sm-3">
            <GoodsOption
              title="支付阶段"
              v-model="queryForm.payStage"
              :optionsVal="paymentType"
            />
          </div>
          <div class="col-xs-12 col-sm-3">
            <GoodsOption
              title="支付状态"
              v-model="queryForm.status"
              :optionsVal="statusType"
            />
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
          title="订单列表表格"
          :rows="rows"
          :columns="columns"
          v-model:pagination="queryForm.pagination"
          row-key="id"
          @request="onRequest"
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              {{
                props.row.status === 0
                  ? '交易关闭'
                  : props.row.status === 1
                  ? '正常'
                  : props.row.status === 2
                  ? '已退款'
                  : '交易完成'
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-todo="props">
            <q-td :props="props">
              <div>
                <q-btn
                  flat
                  round
                  color="grey"
                  icon="las la-eye"
                  :to="`/order/${props.row.id}/detail`"
                  title="查看订单详细"
                />

                <q-btn
                  flat
                  round
                  color="grey"
                  icon="las la-trash-alt"
                  @click="delRowData(props.row.id)"
                  title="删除此订单"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
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
  </q-page>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useQuasar, useMeta, date } from 'quasar';
import { api } from 'boot/axios';

import GoodsOption from 'components/GoodsOption.vue';
import SelectInputFiler from 'components/SelectInputFiler.vue';
import DateTimeComponent from 'components/DateTimeComponent.vue';

const metaData = {
  // sets document title
  title: '订单列表',
};

export default {
  name: 'order-index',

  components: {
    // SelectInputFiler,
    GoodsOption,
    DateTimeComponent,
    SelectInputFiler,
  },

  setup() {
    const $q = useQuasar();

    const params = ref({});
    const queryForm = ref({
      userId: '',
      orderNumber: '',
      startTime: null,
      endTime: null,
      user: '',
      payStage: '',
      status: undefined,
      phoneNumber: '',
      carNumber: '',
      productId: '',
      storeId: null,
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10,
      },
    });

    // 支付阶段
    const paymentType = ref([
      { label: '等待支付全额', value: 0 },
      { label: '等待支付定金', value: 1 },
      { label: '等待支付尾款', value: 2 },
      { label: '完成支付', value: 3 },
    ]);
    // 支付状态
    const statusType = ref([
      { label: '交易关闭', value: 0 },
      { label: '正常', value: 1 },
      { label: '已退款', value: 2 },
      { label: '交易完成', value: 3 },
    ]);
    const columns = ref([
      {
        name: 'id',
        required: true,
        label: '#',
        align: 'center',
        field: (row) => row.id,
        format: (val) => `${val}`,
        sortable: true,
      },
      {
        name: 'userId',
        align: 'left',
        label: '用户ID',
        field: 'userId',
        sortable: true,
      },

      {
        name: 'userName',
        align: 'center',
        label: '用户名称',
        field: 'userName',
      },
      {
        name: 'storeName',
        align: 'center',
        label: '支付门店',
        field: 'storeName',
      },
      {
        name: 'orderNumber',
        align: 'center',
        label: '订单号',
        field: 'orderNumber',
      },
      {
        name: 'productName',
        align: 'center',
        label: '商品',
        field: 'productName',
      },
      {
        name: 'deadline',
        align: 'center',
        label: '截止支付时间',
        field: 'deadline',
      },
      {
        name: 'deleteReason',
        align: 'center',
        label: '取消原因',
        field: 'deleteReason',
      },
      {
        name: 'productCount',
        align: 'center',
        label: '商品数量',
        field: 'productCount',
      },
      {
        name: 'memo',
        align: 'center',
        label: '备注',
        field: 'memo',
      },
      {
        name: 'createdAt',
        label: '订单创建时间',
        align: 'center',
        field: 'createdAt',
      },
      {
        name: 'status',
        align: 'center',
        label: '订单状态',
        field: 'status',
      },
      {
        name: 'todo',
        label: '操作',
        align: 'right',
        field: 'todo',
        sortable: true,
      },
    ]);
    const rows = ref([]);

    // 删除提示弹框
    const isDelConfirm = ref(false);

    const orderInfo = ref({});

    // 行id
    const rowId = ref(null);

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
        orderNumber: values.orderNumber || undefined,
        user: values.user || undefined,
        payStage: values.payStage !== '' ? values.payStage : undefined,
        status: values.status !== '' ? values.status : undefined,
        phoneNumber: values.phoneNumber || undefined,
        userId: values.userId?.value || undefined,
        productId: values.productId?.value || undefined,
        startTime,
        endTime,
      };

      api
        .get('/order', { params })
        .then((payload) => {
          let { totalNumber, list } = payload;

          rows.value = list.map((o) => {
            const createdAt = date.formatDate(
              o.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );
            const deadline = o.deadline
              ? date.formatDate(o.deadline * 1000, 'YYYY-MM-DD HH:mm:ss')
              : '';

            const productCount = o.orderSku.length;

            const productName = o.orderSku
              .map((sku) => {
                return sku.productName;
              })
              .join('、');
            return Object.assign({}, o, {
              createdAt,
              deadline,
              productCount,
              productName,
            });
          });
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
        .delete(`/order/${id}`)
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

    const orderValOk = () => {
      let rowVal = orderInfo.value;
    };

    // 施工步骤确认
    const orderOk = (item, back) => {
      console.log(back);
      orderInfo.value = item;
    };
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
      columns,
      rows,
      isDelConfirm,
      delRowData,
      loadData,
      delRowDataOk,
      onQuery,
      orderOk,
      orderValOk,
      orderInfo,
      paymentType,
      statusType,
      onRequest,
    };
  },
};
</script>
