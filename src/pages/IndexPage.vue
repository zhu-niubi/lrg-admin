<template>
  <q-page class="justify-evenly">
    <div class="column">
      <div class="col q-pa-md">
        <div class="q-gutter-md row items-start">
          <q-date v-model="nowDay" minimal :events="deadDays" :event-color="'orange'" style="width: 100%;"
            @navigation="handleNavigation" />
        </div>
      </div>


      <div class="col q-pa-md">
        <q-table :title="nowDay" :rows="rows" :columns="columns" row-key="userName">
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th auto-width />
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand"
                  :icon="props.expand ? 'remove' : 'add'" />
              </q-td>
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.value }}

              </q-td>
              <q-td>
                <q-fab color="amber" text-color="black" icon="keyboard_arrow_left" direction="left">
                  <q-fab-action color="amber" text-color="black" @click="sendMsg(props.row)">发送短信</q-fab-action>
                </q-fab>
              </q-td>

            </q-tr>
            <q-tr v-show="props.expand" :props="props">
              <q-td colspan="100%">
                <q-table :rows="props.row.coupons" :columns="columns_c" row-key="name">

                </q-table>
              </q-td>
            </q-tr>
          </template>

        </q-table>

      </div>
    </div>

  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue';
import { useQuasar, useMeta, date } from 'quasar';
import { dayjs } from 'element-plus';
import { api } from 'boot/axios';

const metaData = {
  title: '首页',
};

export default defineComponent({
  name: 'IndexPage',
  components: {},
  setup() {
    useMeta(metaData);

    const $q = useQuasar();
    const nowDay = ref(date.formatDate(new Date().getTime(), 'YYYY-MM-DD'));


    // const queryForm = ref({
    //   phoneNumber: null,
    //   pagination: {
    //     sortBy: 'desc',
    //     descending: false,
    //     page: 1,
    //     rowsPerPage: 10,
    //     rowsNumber: 10,
    //   },
    // });


    //当月应发短信日期
    const deadDays = ref([]);

    //子表格
    const columns_c = ref([

      {
        name: 'productName',
        align: 'center',
        label: '卡券名称',
        field: 'productName',
        sortable: true,
      },
      {
        name: 'deadline',
        align: 'left',
        label: '截止时间',
        field: 'deadline',
        format: (val) => (dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss')),

        sortable: true,
      },


    ]);

    //父表格
    const columns = ref([

      {
        name: 'userId',
        align: 'center',
        label: '用户ID',
        field: 'userId',
        sortable: true,
      },
      {
        name: 'userName',
        align: 'left',
        label: '用户名',
        field: 'userName',
        sortable: true,
      },
      {
        name: 'phoneNumber',
        align: 'left',
        label: '手机号',
        field: 'phoneNumber',
        sortable: true,
      },
      {
        name: 'lastAtForSend',
        align: 'left',
        label: '短信状态',
        field: 'lastAtForSend',
        format: (val) => (val == 0 ? '未发送' : '已发送'),
        sortable: true,
      },
      {
        name: 'lastAtForSend',
        align: 'left',
        label: '上次发送时间',
        field: 'lastAtForSend',
        format: (val) => (val == 0 ? '' : dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss')),
        sortable: true,
      },

    ]);

    const rows = ref([]);


    const sendMsg = (val) => {
      console.log(val);
      $q.loading.show();
      const params = {
        userId: val.userId,
      };
      // return;
      api
        .post('/sms', params)
        .then((payload) => {
          console.log('发送短信res=>', payload?.data);
          if (payload?.data?.templateCode) {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '发送成功!',
              icon: 'success',
            });
          }


        })
        .catch((e) => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: '发送失败!' + e,
            icon: 'report_problem',
          });
        })
        .finally(() => {
          $q.loading.hide();
        });
    };
    console.log(111)


    //获取当前月份的
    const getDayNums = (nowmonths) => {
      console.log('========', nowmonths)
      let nowmonth = nowmonths;
      if (nowmonths == undefined) {
        nowmonth = dayjs(nowDay.value).format('YYYY-MM');
      }


      const startOfmonth = dayjs(nowmonth).startOf('month').unix();
      const endOfmonth = dayjs(nowmonth).endOf('month').unix();

      console.log('nowmonth', nowmonth, 'startOfmonth', startOfmonth, 'endOfmonth', endOfmonth);
      const params = {
        startAt: startOfmonth,
        endAt: endOfmonth,
      };
      api
        .get('/coupon-form/dead', { params })
        .then((payload) => {
          let arr = [];
          for (const item of payload) {
            item.takeAt = dayjs.unix(item.takeAt).format('YYYY/MM/DD');
            arr.push(item.takeAt);
          }
          ;
          deadDays.value = arr;
          console.log('xxxx', deadDays.value);

        })
        .catch((e) => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: '加载失败!' + e,
            icon: 'report_problem',
          });
        })

    };

    const loadData = (values = {}) => {
      console.log('nowDay', nowDay.value);
      const startOfDay = dayjs(nowDay.value).startOf('day').unix();
      console.log('startOfDay', startOfDay);

      $q.loading.show();
      const params = {
        pageNumber: values.pagination?.page || 1,
        pageSize: values.pagination?.rowsPerPage || 10,
        phoneNumber: values.phoneNumber || undefined,
        takeAt: values.takeAt || startOfDay,
      };

      api
        .get('/coupon-form', { params })
        .then((payload) => {
          console.log(payload);
          rows.value = payload.list;

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
    const handleNavigation = (view) => {
      console.log('Navigation event. Current view:', view);
      const nowmonths = dayjs(`${view.year}-${view.month.toString().padStart(2, '0')}`).format('YYYY-MM');

      getDayNums(nowmonths);
    };

    watch(
      () => nowDay.value,
      (newValue, oldValue) => {
        // This function will be called whenever nowDay changes
        console.log('nowDay changed. New value:', newValue, 'Old value:', oldValue);
        loadData();
        getDayNums();
      }
    );

    onMounted(() => {
      // console.log(startOfDay.value)
      getDayNums();
      loadData();
    });

    return {
      columns,
      rows,
      nowDay,
      columns_c,
      sendMsg,
      deadDays,
      handleNavigation


    };
  },
});
</script>
