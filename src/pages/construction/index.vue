<template>
  <q-page class="q-pa-md">
    <!-- content -->
    <q-toolbar class="q-py-md">
      <q-toolbar-title>施工单</q-toolbar-title>

      <q-btn flat round icon="las la-plus" to="/construction/new" />
    </q-toolbar>

    <div v-if="formDataList" class="q-mb-xl">
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-3">
            <q-input outlined label="手机号" v-model="queryForm.phoneNumber" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <q-input outlined label="车牌号" v-model="queryForm.carNumber" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <SelectInputFiler title="用户 *" v-model="queryForm.userId" baseUrl="/user" searchName="phoneNumber" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <GoodsOption title="门店" v-model="queryForm.storeId" baseUrl="/store" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <GoodsOption title="商品" v-model="queryForm.productId" baseUrl="/product" />
          </div>
          <div class="col-xs-12 col-sm-3">
            <q-btn class="q-px-xl q-py-md" color="primary" @click="onQuery" label="查询" />
          </div>
        </div>
      </div>

      <div class="q-pa-md">
        <q-table flat title="施工单表格" :rows="rows" :columns="columns" v-model:pagination="queryForm.pagination" row-key="id"
          @request="onRequest">
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              {{
                props.row.status === 1
                ? '待客户确认'
                : props.row.status === 2
                  ? '客户已确认'
                  : props.row.status === 3
                    ? '质检员已确认'
                    : props.row.status === 4
                      ? '开始施工'
                      : props.row.status === 5
                        ? '施工完成'
                        : props.row.status === 6
                          ? '用户提车确认'
                          : props.row.status === 7
                            ? '店长已确认'
                            : ''
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-todo="props">
            <q-td :props="props">
              <div>
                <q-btn v-if="props.row.settlementId !== 0 && props.row.status === 7" flat color="primary" label="查看销售单"
                  :to="`/construction/${props.row.id}/saleSlip`" />
                <q-btn v-if="props.row.settlementId == 0 && props.row.status === 7" flat color="primary" label="新建销售单"
                  @click="newSaleSlip(props.row)" />
                <q-btn flat color="primary" :label="props.row.status === 3 ? '开始施工' : '施工确认'"
                  :to="`/construction/${props.row.id}/start`" v-if="props.row.status === 3 || props.row.status === 4" />


                <q-btn flat color="primary" :label="props.row.statusName" @click="constructionOk(props.row)"
                  v-if="props.row.statusName" />

                <q-btn flat round color="grey" icon="las la-undo" @click="constructionOk(props.row, 'back')"
                  v-if="props.row.status > 1" />

                <q-btn flat round color="grey" icon="las la-eye" :to="`/construction/${props.row.id}/detail`" />

                <q-btn flat round color="grey" icon="las la-trash-alt" @click="delRowData(props.row.id)" />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- 施工确认 dialog -->
    <q-dialog v-model="constructionStatusOk" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="las la-exclamation-triangle" color="primary" text-color="white" />
          <span class="q-ml-sm" v-if="constructionBack">请谨慎操作施工流程，是否回退？</span>
          <span class="q-ml-sm" v-else>请谨慎操作施工流程，是否确认？</span>
        </q-card-section>

        <q-card-section v-if="constructionInfo.status === 5" class="row items-center">
          <div class="text-subtitle2">注意事项:</div>
          <div class="text-grey q-gutter-sm">
            <div>1、补漆、掉漆的部位，施工时可能会出现局部掉漆</div>
            <div>2、发生碰撞部位，揭膜时可能出现局部掉漆</div>
            <div>
              3、安装完成后48小时内不能清洗车身，不能超过80公里/小时高速行驶，避免雨中行驶
            </div>
            <div>
              4、洗车时，避免用力过大地擦洗保护膜的边缘，避免用高压水枪直援冲洗保护膜边緣,避免高压水枪长时间中洗同一个小块区域
            </div>
            <div>5、日常清洁维护时不能使用掉色毛巾和其他易掉色物品擦拭</div>
            <div>6、不可使用吸ー吸附膜表面</div>
            <div>
              7、膜面上若有雨渍、鸟屎、虫尸、柏油、空调水或铁锈水等有腐蚀性的污渍，请在24小时内及时清洗
            </div>
            <div>
              8、安装后若膜面有雾感、小水泡，为正常现象，十天左右会自动消失
            </div>
            <div>
              9、安装后三天内若有起边、翘边现象，立即联系施工方回店检查维护
            </div>
            <div>
              <div>10、建议2-3个月做一次膜面养护</div>
              <div>质保范围：</div>
              <div>隐形车衣在质保期间：</div>
              <div>·不起泡 ·不龟裂 ·不脱胶</div>
              <div>在以下非质保范围内造成的损失，将无法承诺质保：</div>
              <div>·对隐形车衣不恰当清洗、保养或维护</div>
              <div>·事故或人为导致的隐形车衣的损坏</div>
              <div class="text-subtitle2 text-red">
                ·本人已确认车辆按照服务内容已全部施工完毕，并检查车辆完好无损，车内无任何物品丢失，同意验收！
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="确定" color="primary" v-close-popup @click="constructionValOk" />
        </q-card-actions>
      </q-card>
    </q-dialog>

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

    <!-- 新建销售单 -->
    <q-dialog v-model="isNewSaleConfirm" persistent>
      <q-card style="width: 368px;padding:10px">
        <q-select v-model="saleFormData.paymentMethod" :options="paymentOptions" map-options emit-value label="支付方式"
          :rules="[
            (val) => val?.toString().length || 'Please type something',
          ]" />

        <q-input v-model="saleFormData.price" label="价格" type="number" filled :rules="[
          (val) => val?.toString().length || 'Please type something',
        ]" />
        <q-input v-model="saleFormData.otherPrice" label="其他价格" type="number" filled :rules="[
          (val) => val?.toString().length || 'Please type something',
        ]" />


        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="确定" color="primary" v-close-popup @click="submitSale" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- add -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="las la-plus" color="primary" to="/construction/new" />
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
import SelectInputFiler from 'components/SelectInputFiler.vue';

const metaData = {
  // sets document title
  title: '施工单',
};

export default {
  name: 'construction-index',

  components: { GoodsOption, SelectInputFiler },

  setup() {
    const $q = useQuasar();
    const store = useBaseStore();
    const $route = useRoute();
    const $router = useRouter();

    const params = ref({});
    const queryForm = ref({
      userId: '',
      phoneNumber: '',
      carNumber: '',
      productId: null,
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
        field: (row) => row.id,
        format: (val) => `${val}`,
        sortable: true,
      },
      {
        name: 'userName',
        align: 'center',
        label: '车主姓名',
        field: 'userName',
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
        name: 'carName',
        align: 'center',
        label: '汽车型号',
        field: 'carName',
        sortable: true,
      },
      // {
      //   name: 'productName',
      //   align: 'center',
      //   label: '产品名称',
      //   field: 'productName',
      //   sortable: true,
      // },
      {
        name: 'memo',
        align: 'center',
        label: '备注',
        field: 'memo',
      },
      {
        name: 'status',
        align: 'center',
        label: '施工状态',
        field: 'status',
      },
      {
        name: 'expectComplete',
        align: 'center',
        label: '预计完成时间',
        field: 'expectComplete',
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
        align: 'right',
        field: 'todo',
        sortable: true,
      },
    ]);
    const rows = ref([]);

    // 支付方式
    const paymentOptions = ref([
      { value: 1, label: '支付宝' },
      { value: 1, label: '微信' },
      { value: 1, label: '线下支付' },
    ]);
    // 新建销售单
    const isNewSaleConfirm = ref(false);

    const newSaleId = ref(null);

    const saleFormData = ref({});

    // 删除提示弹框
    const isDelConfirm = ref(false);

    // 施工单提示框
    const constructionStatusOk = ref(false);
    const constructionInfo = ref({});

    //施工回退
    const constructionBack = ref(false);

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
        userId: values.userId?.value || undefined,
        carNumber: values.carNumber || undefined,
        productId: values.productId || undefined,
      };

      api
        .get('/construction', { params })
        .then((payload) => {
          // console.log(payload);
          // return;
          let { totalNumber, list } = payload;

          const formData = list.map((o) => {
            const createdAt = date.formatDate(
              o.createdAt * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );
            const expectComplete = date.formatDate(
              o.expectComplete * 1000,
              'YYYY-MM-DD HH:mm:ss'
            );

            const statusName =
              o.status == 1
                ? '客户确认'
                : o.status == 2
                  ? '质检员确认'
                  : o.status == 5
                    ? '提车确认'
                    : o.status == 6
                      ? '店长确认'
                      : '';

            return Object.assign({}, o, {
              createdAt,
              expectComplete,
              statusName,
            });
          });
          // console.log('formData=>',formData);

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
    //新建销售单弹窗打开
    const newSaleSlip = (row) => {
      if (!row.userName) {
        $q.notify({
          color: 'negative',
          position: 'top',
          message: '请先完善车主姓名',
          icon: 'report_problem',
        });
        return
      }
      // console.log(index);
      // 弹框打开
      isNewSaleConfirm.value = true;

      //施工单id存储
      newSaleId.value = row.id;

    };

    //提交新建销售单
    const submitSale = () => {
      console.log('submitSale=>', saleFormData.value);
      saleFormData.value.price = parseInt(saleFormData.value.price) * 100;
      saleFormData.value.otherPrice = parseInt(saleFormData.value.otherPrice) * 100;
      saleFormData.value.constructionId = newSaleId.value;

      const data = saleFormData.value;

      api
        .post('/settlement-order', data)
        .then((payload) => {

          console.log('新建销售单结果', payload);
          $q.notify({
            color: 'success',
            position: 'top',
            message: '新建成功!',
            icon: 'lar la-check-circle',
          });
          saleFormData.value = {};
          loadData();
        })
        .catch((e) => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: '新建失败!' + e,
            icon: 'report_problem',
          });
          saleFormData.value = {};
          loadData();
        })
        .finally(() => {
          // $q.loading.hide();
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
        .delete(`/construction/${id}`)
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

    const constructionValOk = () => {
      let rowVal = constructionInfo.value;

      let status = constructionBack.value
        ? rowVal.status - 1
        : rowVal.status + 1;

      let data = {
        constructionId: rowVal.id,
        status,
      };

      if (constructionBack.value) {
        api
          .post('/construction/back', data)
          .then((payload) => {
            $q.notify({
              color: 'success',
              position: 'top',
              message: '回退成功!',
              icon: 'lar la-check-circle',
            });
            // return;
            constructionBack.value = false;

            loadData();
          })
          .catch((e) => {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '失败!' + e,
              icon: 'report_problem',
            });
          })
          .finally(() => {
            // $q.loading.hide();
          });
      } else {
        api
          .put(`/construction/${rowVal.id}`, { status })
          .then((payload) => {
            $q.notify({
              color: 'success',
              position: 'top',
              message: '确认成功!',
              icon: 'lar la-check-circle',
            });
            loadData();
            // return;
          })
          .catch((e) => {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: '失败!' + e,
              icon: 'report_problem',
            });
          })
          .finally(() => {
            // $q.loading.hide();
          });
      }
    };

    // 施工步骤确认
    const constructionOk = (item, back) => {
      constructionStatusOk.value = true;
      constructionInfo.value = item;

      if (back) {
        constructionBack.value = true;
      }
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
      paymentOptions,
      isNewSaleConfirm,
      newSaleSlip,
      params,
      queryForm,
      formDataList,
      columns,
      rows,
      isDelConfirm,
      delRowData,
      loadData,
      delRowDataOk,
      onQuery,
      constructionOk,
      constructionStatusOk,
      constructionValOk,
      constructionInfo,
      constructionBack,
      onRequest,
      submitSale,
      saleFormData,
    };
  },
};
</script>
