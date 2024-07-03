<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>用户卡券</q-toolbar-title>

      <q-btn flat round icon="las la-plus" to="/coupon/new" />
    </q-toolbar>

    <div v-if="couponList" class="q-mb-xl">
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-3">
            <q-input outlined label="优惠券编号" v-model="queryForm.code" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <q-input outlined label="用户ID" v-model="queryForm.userId" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <GoodsOption
              title="门店"
              v-model="queryForm.storeId"
              baseUrl="/store"
            />
          </div>
          <div class="col-xs-12 col-sm-3">
            <GoodsOption
              title="使用状态"
              v-model="queryForm.status"
              :optionsVal="useStatusList"
            />
          </div>
          <div class="col-xs-12 col-sm-3">
            <GoodsOption
              title="卡券模板"
              v-model="queryForm.couponTemplateId"
              baseUrl="/coupon_template"
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
          title="卡券表格"
          :rows="rows"
          :columns="columns"
          v-model:pagination="queryForm.pagination"
          row-key="id"
          @request="onRequest"
        >
          <template v-slot:body-cell-source="props">
            <q-td :props="props">
              {{
                props.row.source == 1
                  ? '发卡'
                  : props.row.source == 2
                  ? '订单'
                  : props.row.source == 3
                  ? '权益卡'
                  : ''
              }}
            </q-td>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              {{
                props.row.status == 1
                  ? '未使用'
                  : props.row.status == 2
                  ? '已使用'
                  : props.row.status == 3
                  ? '已失效'
                  : ''
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
      <q-btn fab icon="las la-plus" color="primary" to="/coupon/new" />
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
import DateTimeComponent from 'components/DateTimeComponent.vue';

const metaData = {
  // sets document title
  title: '用户卡券',
};

export default {
  name: 'coupon-index',

  components: { GoodsOption, DateTimeComponent },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();
    const $router = useRouter();

    // 传过来的用户id
    const { userId } = $route.query;

    const params = ref({});
    const queryForm = ref({
      userId: userId ? userId : null,
      couponTemplateId: null,
      code: null,
      startTime: null,
      endTime: null,
      status: null,
      storeId: null,
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
        field: 'id',
      },
      {
        name: 'userId',
        align: 'center',
        label: '用户ID',
        field: 'userId',
      },
      {
        name: 'userName',
        align: 'center',
        label: '用户名称',
        field: 'userName',
      },
      {
        name: 'source',
        align: 'center',
        label: '来源',
        field: 'source',
      },
      {
        name: 'couponTemplateName',
        label: '卡券模版/权益卡名称',
        align: 'center',
        field: 'couponTemplateName',
      },
      { name: 'code', label: '优惠券编号', align: 'center', field: 'code' },
      { name: 'status', label: '使用状态', align: 'center', field: 'status' },
      {
        name: 'createdAt',
        label: '创建时间',
        align: 'center',
        field: 'createdAt',
      },
      {
        name: 'deadline',
        label: '截止时间',
        align: 'center',
        field: 'deadline',
      },
      {
        name: 'memo',
        label: '备注',
        align: 'center',
        field: 'memo',
      },
      {
        name: 'todo',
        label: '操作',
        align: 'center',
        field: 'todo',
      },
    ]);
    const rows = ref([]);

    // 使用状态数据
    const useStatusList = ref([
      { label: '未使用', value: 1 },
      { label: '已使用', value: 2 },
      { label: '已过期', value: 3 },
    ]);

    // 删除提示弹框
    const isDelConfirm = ref(false);
    // 行id
    const rowId = ref(null);

    const couponList = ref([]);

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
        userId: values.userId || undefined,
        couponTemplateId: values.couponTemplateId || undefined,
        code: values.code || undefined,
        status: values.status || undefined,
        storeId: values.storeId || undefined,
        startTime,
        endTime,
      };

      api
        .get('/coupon', { params })
        .then((payload) => {
          // return;
          let { totalNumber, list } = payload;
          //console.log(list);
          rows.value = list.map((o) => {
            const createdAt = date.formatDate(
              o.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );
            const deadline = date.formatDate(
              o.deadline * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );
            return {
              ...o,
              createdAt,
              deadline,
            };
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
        .delete(`/coupon/${id}`)
        .then(() => {
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
        name: 'coupon-edit',
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
      couponList,
      columns,
      rows,
      useStatusList,
      isDelConfirm,
      loadData,
      delRowData,
      delRowDataOk,
      goto,
      onQuery,
      onRequest,
    };
  },
};
</script>
