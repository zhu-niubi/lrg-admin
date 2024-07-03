<template>
    <q-page class="q-pa-md">
        <!-- content -->
        <q-toolbar class="q-py-md">
            <q-toolbar-title>权益卡/商品包配置</q-toolbar-title>

            <q-btn flat round icon="las la-plus" to="/benefit-card-disposition/new" />
        </q-toolbar>

        <div v-if="formDataList" class="q-mb-xl">
            <div class="q-pa-md">
                <div class="row q-col-gutter-md">
                    <div class="col-xs-12 col-sm-3">
                        <q-input outlined label="权益卡/商品包名称" v-model="queryForm.name" />
                    </div>

                    <div v-if="whoInfo === 'admin'" class="col-xs-12 col-sm-3">
                        <GoodsOption title="所属门店" v-model="queryForm.storeId" baseUrl="/store" />
                    </div>
                    <div class="col-xs-12 col-sm-3">
                        <q-btn class="q-px-xl q-py-md" color="primary" @click="onQuery" label="查询" />
                    </div>
                </div>
            </div>

            <div class="q-pa-md">
                <q-table flat title="权益卡/商品包信息" :rows="rows" :columns="columns" v-model:pagination="queryForm.pagination"
                    row-key="id" @request="onRequest">
                    <template v-slot:body-cell-pictrue="props">
                        <q-td :props="props">
                            <q-img class="image-xs" :ratio="1" :src="props.row.pictrue" />
                        </q-td>
                    </template>

                    <template v-slot:body-cell-saleStatus="props">
                        <q-td :props="props">
                            {{
                                props.row.saleStatus === 0
                                ? '停售'
                                : props.row.saleStatus === 1
                                    ? '售卖中'
                                    : ''
                            }}
                        </q-td>
                    </template>
                    <template v-slot:body-cell-type="props">
                        <q-td :props="props">
                            {{
                                props.row.type === 1
                                ? '商品包'
                                : props.row.type === 2
                                    ? '权益卡'
                                    : ''
                            }}
                        </q-td>
                    </template>

                    <template v-slot:body-cell-applyStore="props">
                        <q-td :props="props">
                            <div v-for="store in props.row.applyStore" :key="store.id">
                                <div v-if="store.id === 0">
                                    全部门店
                                </div>
                                <div v-else-if="store.name">
                                    {{ store.name }}
                                </div>
                            </div>
                        </q-td>
                    </template>


                    <template v-slot:body-cell-todo="props">
                        <q-td :props="props">
                            <div>
                                <q-btn flat round color="grey" icon="las la-edit"
                                    :to="`/benefit-card-disposition/${props.row.id}/edit`" />

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
            <q-btn fab icon="las la-plus" color="primary" to="/benefit-card-disposition/new" />
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
    title: '商品',
};

export default {
    name: 'product-index',

    components: { GoodsOption },

    setup() {
        const $q = useQuasar();
        const store = useBaseStore();
        const $route = useRoute();
        const $router = useRouter();

        const params = ref({});

        const queryForm = ref({
            name: '',
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
                label: '序号',
                align: 'left',
                field: (row) => row.id,
                format: (val) => `${val}`,
                sortable: true,
            },
            {
                name: 'pictrue',
                align: 'center',
                label: '封面',
                field: 'pictrue',
                sortable: true,
            },
            {
                name: 'type',
                align: 'center',
                label: '类型',
                field: 'type',
                sortable: true,
            },
            {
                name: 'price',
                align: 'center',
                label: '单价',
                field: 'price',
                format: (val) => `￥${val}`,
                sortable: true,
            },
            {
                name: 'name',
                align: 'center',
                label: '名称',
                field: 'name',
                sortable: true,
            },
            {
                name: 'deadlineDay',
                align: 'center',
                label: '名称',
                field: 'deadlineDay',
                sortable: true,
            },
            {
                name: 'memo',
                align: 'center',
                label: '描述',
                field: 'memo',
                sortable: true,
            },
            {
                name: 'products',
                align: 'center',
                label: '商品包/权益卡内容',
                field: 'products',
                format: (val) => {
                    return val.map((product) => `${product.productName} (数量: ${product.quantity})`).join(', ');
                },
                sortable: true,
            },
            {
                name: 'saleStatus',
                align: 'center',
                label: '售卖状态',
                field: 'saleStatus',
                sortable: true,
            },
            {
                name: 'createdAt',
                label: '创建时间',
                align: 'center',
                field: 'createdAt',
            },
            {
                name: 'updatedAt',
                label: '修改时间',
                align: 'center',
                field: 'updatedAt',
            },
            {
                name: 'applyStore',
                label: '所属门店',
                align: 'center',
                field: 'applyStore',
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

        let whoInfo = ref(null)

        const loadData = (values = {}) => {
            $q.loading.show();
            const { name, pagination, storeId } = values;
            // console.log('values',values)

            const params = {
                pageNumber: pagination?.page || 1,
                pageSize: pagination?.rowsPerPage || 10,
                name: name || undefined,
                storeId: storeId || undefined
            };
            // console.log('params',params)

            api
                .get('/product-pack', { params })
                .then((payload) => {
                    console.log('获取全部列表', payload);
                    // return;
                    let { totalNumber, list } = payload;

                    const formData = list.map((o) => {
                        const createdAt = date.formatDate(
                            o.createdAt * 1000,
                            'YYYY-MM-DD HH:mm:ss'
                        );
                        const updatedAt = date.formatDate(
                            o.updatedAt * 1000,
                            'YYYY-MM-DD HH:mm:ss'
                        );

                        const price = parseFloat((o.price / 100).toFixed(2));

                        return Object.assign({}, o, {
                            createdAt,
                            updatedAt,
                            price,
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
                .delete(`/product-pack/${id}`)
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

        // needs to be called in setup()
        useMeta(metaData);

        //挂载
        onMounted(() => {

            whoInfo = localStorage.getItem('website');
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
            onQuery,
            onRequest,
            whoInfo,
        };
    },
};
</script>
