<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>公告</q-toolbar-title>

      <q-btn flat round icon="las la-plus" to="/notice/new" />
    </q-toolbar>

    <div v-if="rows.length" class="q-mb-xl">
      <div class="q-pa-md">
        <q-table
          flat
          :rows="rows"
          :columns="columns"
          v-model:pagination="queryForm.pagination"
          row-key="id"
          @request="onRequest"
        >
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
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- add -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="las la-plus" color="primary" to="/notice/new" />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar, useMeta, date } from 'quasar';
import { api } from 'boot/axios';

const metaData = {
  // sets document title
  title: '公告',
};

export default {
  name: 'notice-index',

  setup() {
    const $q = useQuasar();

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
        name: 'data',
        align: 'center',
        label: '内容',
        field: 'data',
      },
      {
        name: 'todo',
        label: '操作',
        align: 'center',
        field: 'todo',
      },
    ]);
    const rows = ref([]);

    const loadData = () => {
      $q.loading.show();

      api
        .get('/notice')
        .then((payload) => {
          // return;
          let data = payload;
          if (data) {
            rows.value = [{ data }];
          } else {
            rows.value = [];
          }
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

    // 跳转详情页
    const goto = (val) => {
      $router.push({
        name: 'notice-edit',
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
      columns,
      rows,
      loadData,
      goto,
      onRequest,
    };
  },
};
</script>
