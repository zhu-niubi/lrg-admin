<template>
    <q-page class="q-pa-md">
        <!-- content -->
        <q-toolbar class="q-py-md">
            <q-toolbar-title>用户权益卡</q-toolbar-title>

            <q-btn flat round icon="las la-plus" @click="isCardPopup = true"/>
        </q-toolbar>


        <div v-if="formDataList" class="q-mb-xl">
            <div class="q-pa-md">
                <div class="row q-col-gutter-md">
                    <div class="col-xs-12 col-sm-4">
                        <q-input outlined label="手机号" v-model="queryForm.phoneNumber"/>
                    </div>
                    <div class="col-xs-12 col-sm-4">
                        <GoodsOption
                                title="选择权益卡"
                                v-model="queryForm.productPackId"
                                baseUrl="/product-pack"
                                :type="2"
                                lazy-rules
                                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
                        />
                    </div>
                    <div v-if="whoInfo === 'admin'" class="col-xs-12 col-sm-4">
                        <GoodsOption
                                title="发放门店"
                                v-model="queryForm.storeId"
                                baseUrl="/store"
                        />
                    </div>
                    <div class="col-xs-12 col-sm-2">
                        <DateTimeComponent title="开始时间" v-model="queryForm.startTime"/>
                    </div>
                    <div class="col-xs-12 col-sm-2">
                        <DateTimeComponent title="结束时间" v-model="queryForm.endTime"/>
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
                        title="权益卡表格"
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
                                        icon="las la-eye"
                                        :to="`/user-benefit-cards/${props.row.id}/detail`"
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
                    <q-btn flat label="取消" color="primary" v-close-popup/>
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
            <q-btn fab icon="las la-plus" color="primary" @click="isCardPopup = true"/>
        </q-page-sticky>
    </q-page>

    <q-dialog v-model="isCardPopup" persistent>

        <q-card style="min-width: 30em;max-width: 50em;">

            <q-card-section v-if="whoInfo === 'admin'">
                <GoodsOption
                        title="选择发放门店"
                        v-model="subForm.storeId"
                        baseUrl="/store"
                        lazy-rules
                        :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
                />
            </q-card-section>
            <q-card-section>
                <GoodsOption
                        title="选择权益卡"
                        v-model="subForm.productPackId"
                        baseUrl="/product-pack"
                        :type="2"
                        lazy-rules
                        :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
                />
            </q-card-section>
            <q-card-section>
                <q-input outlined v-model="subForm.userId"
                         label="用户ID，多用户使用英文”,“隔开"
                         lazy-rules
                         :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
                />
                <q-input outlined v-model="subForm.memo" label="发卡备注"
                         type="textarea"
                         lazy-rules
                         :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
                />
            </q-card-section>
            <q-card-actions align="right" class="text-primary">
                <q-btn flat label="取消" v-close-popup/>
                <q-btn flat label="发放" @click="onSumbit"/>
            </q-card-actions>

        </q-card>
    </q-dialog>

</template>

<script>
import {ref, computed, watch, onMounted, onBeforeUnmount} from 'vue';
import {useBaseStore} from 'stores/base';
import {useRoute, useRouter} from 'vue-router';
import {useQuasar, useMeta, date} from 'quasar';
import {api} from 'boot/axios';

import GoodsOption from 'components/GoodsOption.vue';
import SelectInputFiler from 'components/SelectInputFiler.vue';
import DateTimeComponent from 'components/DateTimeComponent.vue';


const metaData = {
    // sets document title
    title: '用户权益卡',
};

export default {
    name: 'user-benefit-cards',

    components: {DateTimeComponent, GoodsOption},

    setup() {
        const $q = useQuasar();
        const store = useBaseStore();
        const $route = useRoute();
        const $router = useRouter();
        const isCardPopup = ref(false);
        const params = ref({});
        const subForm = ref({});
        const queryForm = ref({
            startTime: '',
            endTime: '',
            code: null,
            userName: null,
            phoneNumber: '',
            storeId: null,
            pagination: {
                sortBy: 'desc',
                descending: false,
                page: 1,
                rowsPerPage: 10,
                rowsNumber: 10,
            },
        });
        let whoInfo = ref(null)

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
                label: '用户ID',
                field: 'userId',
                sortable: true,
            },
            {
                name: 'userName',
                align: 'center',
                label: '用户名称',
                field: 'userName',
                sortable: true,
            },
            {
                name: 'code',
                align: 'center',
                label: '权益卡号',
                field: 'code',
                sortable: true,
            },
            {
                name: 'productPackName',
                align: 'center',
                label: '权益卡名称',
                field: 'productPackName',
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
                name: 'storeName',
                align: 'center',
                label: '发放门店',
                field: 'storeName',
            },
            {
                name: 'employeeName',
                align: 'center',
                label: '发放人',
                field: 'employeeName',
                sortable: true,
            },
            {
                name: 'memo',
                align: 'center',
                label: '发放备注',
                field: 'memo',
                sortable: true,
            },

            {
                name: 'createdAt',
                label: '发放时间',
                align: 'center',
                field: 'createdAt',
            },
            {
                name: 'deadline',
                label: '过期时间',
                align: 'center',
                field: 'deadline',
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

        // 删除提示弹框
        const isDelConfirm = ref(false);

        // 行id
        const rowId = ref(null);

        const formDataList = ref([]);
        const onSumbit = () => {
            const bodyData = Object.assign({}, subForm.value);
            bodyData.userId = bodyData.userId.split(',').map((id) => parseInt(id));
            // console.log('bodyData', bodyData);

            api
                .post('/product-pack/send', bodyData)
                .then((payload) => {
                    $q.notify({
                        color: 'success',
                        position: 'top',
                        message: '权益卡发送成功!',
                        icon: 'lar la-check-circle',
                    });
                    // history.back();
                })
                .finally(() => {
                    // $q.loading.hide()
                });
            isCardPopup.value = false

        };

        const loadData = (values = {}) => {
            $q.loading.show();

            // console.log('values',values)

            const params = {
                pageNumber: values.pagination?.page || 1,
                pageSize: values.pagination?.rowsPerPage || 10,
                storeId: values.storeId || undefined,
                productPackId: values.productPackId || undefined,
                phoneNumber: values.phoneNumber || undefined,
                startTime: values.startTime || undefined,
                endTime: values.endTime || undefined
            };
            if (params.startTime && params.endTime) {
                params.startTime = Math.floor(new Date(params.startTime).getTime() / 1000);
                params.endTime = Math.floor(new Date(params.endTime).getTime() / 1000);
            }


            console.log('用户权益卡筛选参数：', params)

            api
                .get('/user-product-pack', {params})
                .then((payload) => {
                    let {totalNumber, list} = payload;
                    // console.log('payload',payload)

                    const formData = list.map((o) => {
                        const createdAt = date.formatDate(
                            o.createdAt * 1000,
                            'YYYY-MM-DD HH:mm:ss'
                        );
                        const deadline = date.formatDate(
                            o.deadline * 1000,
                            'YYYY-MM-DD HH:mm:ss'
                        );
                        return Object.assign({}, o, {
                            createdAt,
                            deadline
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
            params.value = {...queryForm.value};
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
                .delete(`/user-product-pack/${id}`)
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
            const {page, rowsPerPage, sortBy, descending, rowsNumber} =
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
            isCardPopup,
            subForm,
            onSumbit,
            whoInfo,
        };
    },
};
</script>
