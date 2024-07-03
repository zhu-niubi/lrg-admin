<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>用户管理</q-toolbar-title>
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

          <template v-slot:body-cell-totalMoney="props">
            <q-td :props="props">
              {{
                props.rows?.totalMoney ? props.rows?.totalMoney : ''
              }}
            </q-td>
          </template>
<!--TODO:总金额控制等级，目前人为控制-->
          <template v-slot:body-cell-level="props">
            <q-td :props="props">
              {{
                props.row.level === 1
                  ? '车衣小白'
                  : props.row.level === 2
                  ? '车衣新人'
                  : props.row.level === 3
                  ? '车衣潮人'
                  : props.row.level === 4
                  ? '车衣达人'
                  : props.row.level === 5
                  ? '车衣王者'
                  : ''
              }}
            </q-td>
          </template>
          <template v-slot:body-cell-gender="props">
            <q-td :props="props">
              {{
                props.row.gender == 1 ? '男' : props.row.gender == 2 ? '女' : ''
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-region="props">
            <q-td :props="props">
              <q-item
                >{{ props.row.country }} {{ props.row.province }}
                {{ props.row.city }} {{ props.row.area }}</q-item
              >
            </q-td>
          </template>

          <template v-slot:body-cell-avatarUrl="props">
            <q-td :props="props">
              <q-img class="image-xs" :ratio="1" :src="props.row.avatarUrl" />
            </q-td>
          </template>

          <template v-slot:body-cell-todo="props">
            <q-td :props="props">
              <q-fab  color="amber" text-color="black" icon="keyboard_arrow_left" direction="left">
                <q-fab-action color="amber" text-color="black" @click="goto(props.row)" icon="las la-edit" />
                <q-fab-action color="amber" text-color="black" @click="gotoCoupon(props.row.id)" icon="credit_card" />
                <q-fab-action color="amber" text-color="black" @click="onPoints(props.row.id)" icon="las la-coins" />
              </q-fab>
            </q-td>

          </template>
        </q-table>
      </div>
    </div>
  </q-page>


    <q-dialog v-model="issuePoints" persistent >

      <q-card style="min-width: 350px" >
        <q-form
          ref="myForm"
          autocorrect="off"
          autocapitalize="off"
          autocomplete="off"
          spellcheck="false"
        >
        <q-card-section>
          <div class="text-h6">积分数量 *</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="fromData.integral" autofocus @keyup.enter="issuePoints = false"
                   :rules="[validate1]"
          />
        </q-card-section>
        <q-card-section>
          <div class="text-h6">发放理由 *</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="fromData.reason" autofocus @keyup.enter="issuePoints = false"
                   :rules="[validate2]"
          />
        </q-card-section>


        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="发放"  @click="onSumbit"/>
        </q-card-actions>

        </q-form>
      </q-card>
    </q-dialog>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

import { useRouter } from 'vue-router';
import { useQuasar, useMeta, date } from 'quasar';
import { api } from 'boot/axios';

const metaData = {
  // sets document title
  title: '用户管理',
};

export default {
  name: 'user-index',

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
        name: 'nickname',
        align: 'center',
        label: '昵称',
        field: 'nickname',
        sortable: true,
      },
      {
        name: 'name',
        align: 'left',
        label: '姓名',
        field: 'name',
        sortable: true,
      },
      {
        name: 'totalMoney',
        align: 'left',
        label: '消费总金额',
        field: 'totalMoney',
        sortable: true,
      },
      {
        name: 'pointQuantity',
        align: 'left',
        label: '账户积分',
        field: 'pointQuantity',
        sortable: true,
      },
      { name: 'level', label: '会员等级', align: 'center', field: 'level' },
      { name: 'gender', label: '性别', align: 'center', field: 'gender' },
      {
        name: 'phoneNumber',
        label: '手机号',
        align: 'center',
        field: 'phoneNumber',
      },
      { name: 'birthday', label: '生日', align: 'center', field: 'birthday' },
      { name: 'region', label: '地区', align: 'center', field: 'region' },
      {
        name: 'avatarUrl',
        label: '头像',
        align: 'center',
        field: 'avatarUrl',
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

    const couponList = ref([]);

    const loadData = (values = {}) => {
      $q.loading.show();
      const params = {
        pageNumber: values.pagination?.page || 1,
        pageSize: values.pagination?.rowsPerPage || 10,
        phoneNumber: values.phoneNumber || undefined,
      };

      api
        .get('/user', { params })
        .then((payload) => {
          // return;
          let { totalNumber, list } = payload;
          //console.log(list)

          const couponData = list.map((o) => {
            const createdAt = date.formatDate(
              o.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );
            const birthday = date.formatDate(
              o.birthday * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );

            return Object.assign({}, o, {
              createdAt,
              birthday,
            });
          });
          //console.log(couponData)

          rows.value = couponList.value.concat(couponData);

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
    const onSumbit = () => {
        myForm.value.validate().then((success) => {
          if (success){
            const bodyData = Object.assign({}, fromData.value);

            bodyData.action = 2;
            bodyData.userId = parseInt(rowId.value);
            bodyData.quantity = parseInt(bodyData.integral);
            //此方式为门店发放
            bodyData.memo = bodyData.reason;
            // //console.log(typeof action)
            api
              .post('/point', bodyData)
              .then((payload) => {
                $q.notify({
                  color: 'success',
                  position: 'top',
                  message: '积分发送成功!',
                  icon: 'lar la-check-circle',
                });
                // history.back();
              })
              .finally(() => {
                // $q.loading.hide()
            });
            issuePoints.value = false
          }else {
            //console.log('填写有误');
            //console.log('fail_userid',rowId.value)
          }
        });

    };
    // 查询
    const onQuery = () => {
      params.value = { ...queryForm.value };
      loadData(params.value);
    };

    // 跳转详情页
    const goto = (val) => {
      //console.log('goto_val',val)
      $router.push({
        name: 'user-edit',
        params: val,
      });
    };

    // 跳转发送卡券页面 查找当前用户的卡券信息
    const gotoCoupon = (val) => {
      let data = {
        userId: val,
      };
      $router.push({
        path: '/coupon',
        query: data,
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

    //
    onBeforeUnmount(() => {
      // we do cleanup
    });

    //点击送送积分的icon
    const  onPoints = (val)=>{
      issuePoints.value = true;
      //将id存到rowId
      rowId.value = val
    }

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



    const validate1 = (val) => {
      if (val && val.trim() !== '') {
        if (/^\d+$/.test(val)) {
          if (!/^0/.test(val)) {
            if (!/\s/.test(val)) {
              return true;
            } else {
              return '不能包含空格';
            }
          } else {
            return '开头不能为零';
          }
        } else {
          return '必须为数字';
        }
      }
      return '输入不能为空';
    };
    const validate2 = (val) => {
      if (val && val.trim() !== '') {
        return true;
      }
      return '输入不能为空';
    };

    return {
      params,
      queryForm,
      couponList,
      columns,
      rows,
      loadData,
      goto,
      gotoCoupon,
      onQuery,
      onRequest,
      alert,
      confirm,
      issuePoints,
      fromData,
      myForm,
      onPoints,
      onSumbit,
      validate1,
      validate2,


    };
  },
};
</script>
