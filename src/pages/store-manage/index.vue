<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>门店管理</q-toolbar-title>

      <q-btn flat round icon="las la-plus" to="/store-manage/new" />
    </q-toolbar>

    <div v-if="formDataList" class="q-mb-xl">
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-3">
            <q-input outlined label="门店名称" v-model="queryForm.name" />
          </div>
          <div class="col-xs-12 col-sm-9">
            <CascaderSelect
              :cascadeTitle="[
                { title: '省级' },
                { title: '市级' },
                { title: '区级' },
              ]"
              v-model="queryForm.region"
              :optionsVal="addressList"
            />
          </div>
          <div class="col-xs-12 col-sm-4">
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
          title="门店表格"
          :rows="rows"
          :columns="columns"
          v-model:pagination="queryForm.pagination"
          row-key="id"
          @request="onRequest"
        >
          <template v-slot:body-cell-images="props">
            <q-td :props="props">
              <div
                class="q-py-xs"
                v-for="(item, index) in props.row.images"
                :key="index"
              >
                <q-img class="image-xs" :ratio="1" :src="item" />
              </div>
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
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="las la-plus" color="primary" to="/store-manage/new" />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useBaseStore } from 'stores/base';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar, useMeta, date } from 'quasar';
import { api } from 'boot/axios';
import { region } from '../../utils/china-area';

import CascaderSelect from 'components/CascaderSelect.vue';

const metaData = {
  // sets document title
  title: '门店管理',
};

export default {
  name: 'store-manage-index',

  components: { CascaderSelect },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();
    const $router = useRouter();

    const params = ref({});

    const queryForm = ref({
      name: '',
      region: '',
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10,
      },
    });

    const addressList = region.data;

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
        label: '门店名称',
        field: 'name',
        sortable: true,
      },
      {
        name: 'contact',
        align: 'center',
        label: '联系人',
        field: 'contact',
        sortable: true,
      },
      {
        name: 'phoneNumber',
        align: 'center',
        label: '电话',
        field: 'phoneNumber',
        sortable: true,
      },
      {
        name: 'regionName',
        align: 'center',
        label: '门店地址',
        field: 'regionName',
        sortable: true,
      },
      {
        name: 'fullAddress',
        align: 'center',
        label: '详细地址',
        field: 'fullAddress',
        sortable: true,
      },
      {
        name: 'lat',
        align: 'center',
        label: '纬度',
        field: 'lat',
        sortable: true,
      },
      {
        name: 'lon',
        align: 'center',
        label: '经度',
        field: 'lon',
        sortable: true,
      },
      {
        name: 'images',
        align: 'center',
        label: '门店照片',
        field: 'images',
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
        region: values.region || undefined,
        name: values.name || undefined,
      };

      api
        .get('/store', { params })
        .then((payload) => {
          // console.log(payload);
          // return;
          let { totalNumber, list } = payload;

          const formData = list.map((o) => {
            const createdAt = date.formatDate(
              o.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );

            // 处理地区值
            let addr = '';
            let province = o.region.slice(0, 2);
            let town = o.region.slice(2, 6);
            let district = o.region.slice(6, 12);

            addressList.map((item1) => {
              if (item1.value === province) {
                addr += item1.label;
                item1.children.map((item2) => {
                  if (item2.value === town) {
                    addr += ' ' + item2.label + ' ';
                    item2.children.map((item3) => {
                      if (item3.value === district) {
                        addr += item3.label;
                      }
                    });
                  }
                });
              }
            });

            o.regionName = addr;

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
        .delete(`/store/${id}`)
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
      // return;
      $router.push({
        name: 'store-manage-edit',
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
      addressList,
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
};
</script>
