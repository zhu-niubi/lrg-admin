<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>推荐管理</q-toolbar-title>
    </q-toolbar>

    <div v-if="formDataList" class="q-mb-xl">
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-3">
            <SelectInputFiler
              title="推荐人 *(请输入手机号)"
              v-model="queryForm.recommenderId"
              baseUrl="/user"
              searchName="phoneNumber"
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
          title="推荐管理表格"
          :rows="rows"
          :columns="columns"
          v-model:pagination="queryForm.pagination"
          row-key="id"
          @request="onRequest"
        >
          <template v-slot:body-cell-usedCoupon="props">
            <q-td :props="props">
              {{
                props.row.usedCoupon === 0
                  ? '未使用'
                  : props.row.usedCoupon === 1
                  ? '已使用'
                  : ''
              }}
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useBaseStore } from 'stores/base';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar, useMeta, date } from 'quasar';
import { api } from 'boot/axios';

import SelectInputFiler from 'components/SelectInputFiler.vue';

const metaData = {
  // sets document title
  title: '推荐管理',
};

export default {
  name: 'recommend-index',

  components: { SelectInputFiler },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();
    const $router = useRouter();

    const params = ref({});
    const queryForm = ref({
      recommenderId: '',
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
        name: 'userId',
        align: 'center',
        label: '被推荐人ID',
        field: 'userId',
        sortable: true,
      },
      {
        name: 'userName',
        align: 'center',
        label: '被推荐人',
        field: 'userName',
        sortable: true,
      },
      {
        name: 'recommenderId',
        align: 'center',
        label: '推荐人ID',
        field: 'recommenderId',
        sortable: true,
      },
      {
        name: 'recommenderName',
        align: 'center',
        label: '推荐人',
        field: 'recommenderName',
        sortable: true,
      },
      {
        name: 'usedCoupon',
        align: 'center',
        label: '是否使用优惠券',
        field: 'usedCoupon',
      },
      {
        name: 'createdAt',
        label: '创建时间',
        align: 'center',
        field: 'createdAt',
      },
    ]);
    const rows = ref([]);

    const formDataList = ref([]);

    const loadData = (values = {}) => {
      $q.loading.show();

      const params = {
        pageNumber: values.pagination?.page || 1,
        pageSize: values.pagination?.rowsPerPage || 10,
        recommenderId: values.recommenderId?.value || undefined,
      };

      api
        .get('/recommend', { params })
        .then((payload) => {
          // console.log(payload);
          // return;
          let { totalNumber, list } = payload;

          const formData = list.map((o) => {
            const createdAt = date.formatDate(
              o.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );

            return Object.assign({}, o, {
              createdAt,
            });
          });

          rows.value = formDataList.value.concat(formData);

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
      formDataList,
      columns,
      rows,
      loadData,
      onQuery,
      onRequest,
    };
  },
};
</script>
