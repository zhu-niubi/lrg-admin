<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>卡券类型</q-toolbar-title>

      <q-btn flat round icon="las la-plus" to="/coupon-type/new" />
    </q-toolbar>

    <div v-if="couponTypeList" class="q-mb-xl">
      <div class="q-pa-md">
        <q-table
          flat
          title="卡券类型
          表格"
          :rows="rows"
          :columns="columns"
          :pagination="pagination"
          row-key="id"
          hide-pagination
        >
          <template v-slot:body-cell-image="props">
            <q-td :props="props">
              <q-img :src="props.row.image" />
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

        <div class="row justify-center q-mt-md">
          <q-pagination
            v-model="pageIndex"
            color="grey-8"
            :max="pagesMaxNumber"
            size="md"
            :max-pages="6"
            boundary-links
            direction-links
          />

          <q-item class="q-mt-sm">共：{{ pagination.totalNumber }} 条</q-item>
        </div>
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
      <q-btn fab icon="las la-plus" color="primary" to="/coupon-type/new" />
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
  title: '卡券类型',
};

export default {
  name: 'coupon-type-index',

  components: {},

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();
    const $router = useRouter();

    const queryForm = ref({
      name: '',
      startTime: '',
      endTime: '',
    });

    const pagination = ref({
      descending: false,
      pageIndex: 1,
      rowsPerPage: 10,
      totalNumber: 1,
    });
    const columns = ref([]);
    const rows = ref([]);

    // 删除提示弹框
    const isDelConfirm = ref(false);
    // 行id
    const rowId = ref(null);

    const couponTypeList = ref([]);

    const loadData = () => {
      $q.loading.show();
      columns.value = [
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
          label: '卡券名称',
          field: 'name',
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
      ];

      const params = {
        pageNumber: pagination.value.pageIndex,
        pageSize: pagination.value.rowsPerPage,
        // name: queryForm.value.name ? queryForm.value.name : undefined,
      };

      api
        .get('/coupon_class', { params })
        .then((payload) => {
          console.log(payload);
          // return;
          let { totalNumber, list } = payload;

          const couponType = list.map((o) => {
            const createdAt = date.formatDate(
              o.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );

            return Object.assign({}, o, {
              createdAt,
            });
          });

          rows.value = couponTypeList.value.concat(couponType);

          pagination.value.totalNumber = totalNumber;
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
      loadData();
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
        .delete(`/coupon_class/${id}`)
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
        name: 'coupon-type-edit',
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

    return {
      queryForm,
      couponTypeList,
      columns,
      rows,
      pagination,
      loadData,
      delRowData,
      isDelConfirm,
      delRowDataOk,
      goto,
      onQuery,
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
