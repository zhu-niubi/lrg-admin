<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>商品系列</q-toolbar-title>

      <q-btn flat round icon="las la-plus" to="/product-model/new" />
    </q-toolbar>

    <div v-if="formDataList" class="q-mb-xl">
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-3">
            <q-input outlined label="系列名称" v-model="queryForm.name" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <q-input outlined label="标签" v-model="queryForm.tag" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <GoodsOption title="商品类型" v-model="queryForm.productTypeId" baseUrl="/product_type" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <q-btn class="q-px-xl q-py-md" color="primary" @click="onQuery" label="查询" />
          </div>
        </div>
      </div>

      <div class="q-pa-md">
        <q-table flat title="商品系列表格" :rows="rows" :columns="columns" v-model:pagination="queryForm.pagination"
          row-key="id" @request="onRequest">
          <template v-slot:body-cell-todo="props">
            <q-td :props="props">
              <div>
                <q-btn flat round color="grey" icon="las la-edit" @click="goto(props.row)" />

                <q-btn flat round color="grey" icon="las la-trash-alt" @click="delRowData(props.row.id)" />
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
          <q-avatar icon="las la-exclamation-triangle" color="primary" text-color="white" />
          <span class="q-ml-sm">此操作将不可撤销，确定要删除吗？</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="确定" color="primary" v-close-popup @click="delRowDataOk" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- add -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="las la-plus" color="primary" to="/product-model/new" />
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
  title: '商品系列',
};

export default {
  name: 'product-model-index',

  components: { GoodsOption },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();
    const $router = useRouter();

    const params = ref({});
    const queryForm = ref({
      name: '',
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
        label: '系列名称',
        field: 'name',
        sortable: true,
      },
      {
        name: 'productTypeName',
        align: 'center',
        label: '商品类型',
        field: 'productTypeName',
        sortable: true,
      },
      {
        name: 'warrantyYear',
        align: 'center',
        label: '质保年限',
        field: 'warrantyYear',
        sortable: true,
      },
      {
        name: 'tag',
        align: 'center',
        label: '标签',
        field: 'tag',
        sortable: true,
      },
      {
        name: 'sort',
        align: 'center',
        label: '排序',
        field: 'sort',
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

    const formDataList = ref([]);

    const loadData = (values = {}) => {
      $q.loading.show();

      const params = {
        pageNumber: values.pagination?.page || 1,
        pageSize: values.pagination?.rowsPerPage || 10,
        name: values.name || undefined,
        tag: values.tag || undefined,
        productTypeId: values.productTypeId || undefined,
      };

      api
        .get('/product_model', { params })
        .then((payload) => {
          console.log(payload);
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
        .delete(`/product_model/${id}`)
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
        name: 'product-model-edit',
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
      formDataList,
      columns,
      rows,
      isDelConfirm,
      delRowData,
      loadData,
      delRowDataOk,
      goto,
      onQuery,
      onRequest,
    };
  },

  computed: {
    pagesMaxNumber: {
      get() {
        return Math.ceil(
          this.pagination.totalNumber / this.pagination.rowsPerPage
        );
      },
      set(value) {
        console.log(value);
        // this.pageNumber = value;
      },
    },
    pageIndex: {
      get() {
        return this.pagination.pageIndex;
      },
      set(value) {
        this.pagination.pageIndex = value;
        this.loadData();
      },
    },
  },
};
</script>
