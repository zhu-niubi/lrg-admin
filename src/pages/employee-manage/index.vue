<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>员工管理</q-toolbar-title>

      <q-btn flat round icon="las la-plus" to="/employee-manage/new" />
    </q-toolbar>

    <div v-if="formDataList" class="q-mb-xl">
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-3">
            <q-input outlined label="姓名" v-model="queryForm.name" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <q-input outlined label="手机号" v-model="queryForm.phoneNumber" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <GoodsOption
              title="职位"
              v-model="queryForm.position"
              :optionsVal="positionList"
            />
          </div>
          <div class="col-xs-12 col-sm-3">
            <GoodsOption
              title="门店"
              v-model="queryForm.storeId"
              baseUrl="/store"
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
          title="员工表格"
          :rows="rows"
          :columns="columns"
          v-model:pagination="queryForm.pagination"
          row-key="id"
          @request="onRequest"
        >
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
                  icon="las la-key"
                  @click="updatePassWorld(props.row.id)"
                />

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

    <!-- update-passworld dialog -->
    <q-dialog v-model="isPassWorldDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">密码</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="passWorld"
            autofocus
            @keyup.enter="isPassWorldDialog = false"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确定" v-close-popup @click="updatePassWorldOk" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- add -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="las la-plus" color="primary" to="/employee-manage/new" />
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
  title: '员工管理',
};

export default {
  name: 'employee-manage-index',

  components: { GoodsOption },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();
    const $router = useRouter();

    //
    const params = ref({});

    const queryForm = ref({
      name: '',
      phoneNumber: '',
      position: null,
      storeId: null,
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10,
      },
    });

    const passWorld = ref('');

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
        label: '姓名',
        field: 'name',
        sortable: true,
      },
      {
        name: 'phoneNumber',
        align: 'center',
        label: '手机号',
        field: 'phoneNumber',
        sortable: true,
      },
      {
        name: 'positionName',
        align: 'center',
        label: '职位',
        field: 'positionName',
        sortable: true,
      },
      {
        name: 'username',
        align: 'center',
        label: '账号',
        field: 'username',
        sortable: true,
      },
      {
        name: 'storeName',
        align: 'center',
        label: '门店名称',
        field: 'storeName',
        sortable: true,
      },
      {
        name: 'image',
        align: 'center',
        label: '员工照片',
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

    const positionList = ref([
      { label: '店长', value: 1 },
      { label: '技师', value: 2 },
      { label: '店员', value: 3 },
      { label: '运营', value: 4 },
      { label: '咖啡师', value: 5 },
    ]);

    // 删除提示弹框
    const isDelConfirm = ref(false);
    // 是否弹出修改密码弹框

    const isPassWorldDialog = ref(false);

    // 行id
    const rowId = ref(null);

    const formDataList = ref([]);

    const loadData = (values = {}) => {
      $q.loading.show();
      const params = {
        pageNumber: values.pagination?.page || 1,
        pageSize: values.pagination?.rowsPerPage || 10,
        phoneNumber: values.phoneNumber || undefined,
        storeId: values.storeId || undefined,
        position: values.position || undefined,
        name: values.name || undefined,
      };

      api
        .get('/employee', { params })
        .then((payload) => {
          // console.log(payload);
          // return;
          let { totalNumber, list } = payload;

          const formData = list.map((o) => {
            const createdAt = date.formatDate(
              o.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );

            // 职位
            positionList.value.map((p) => {
              if (o.position === p.value) {
                o.positionName = p.label;
              }
            });

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
        .delete(`/employee/${id}`)
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

    // 修改密码
    const updatePassWorld = (index) => {
      isPassWorldDialog.value = true;
      // 保存删除的行id
      rowId.value = index;
    };

    const updatePassWorldOk = () => {
      let id = rowId.value;
      let data = {
        password: passWorld.value,
      };
      api
        .put(`/employee/${id}`, data)
        .then((payload) => {
          $q.notify({
            color: 'success',
            position: 'top',
            message: '修改密码成功!',
            icon: 'lar la-check-circle',
          });
          loadData();
          // return;
        })
        .catch((e) => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: '修改密码失败!' + e,
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
        name: 'employee-manage-edit',
        params: val,
      });
    };

    // needs to be called in setup()
    useMeta(metaData);

    //挂载
    onMounted(() => {
      loadData();
      // tableRef.value.requestServerInteraction();
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
      positionList,
      formDataList,
      columns,
      rows,
      queryForm,
      isDelConfirm,
      passWorld,
      isPassWorldDialog,
      delRowData,
      loadData,
      updatePassWorld,
      delRowDataOk,
      updatePassWorldOk,
      goto,
      onQuery,
      onRequest,
    };
  },
};
</script>
