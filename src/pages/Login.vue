<template>
    <q-page class="flex flex-center">
        <q-card v-if="userObj" flat style="min-width: 360px">
            <q-toolbar>
                <q-avatar icon="las la-user" />
                <q-toolbar-title>
                    <div class="text-h6">用户登录</div>
                </q-toolbar-title>

                <div>
                    <q-chip label="@纳管家" class="transparent text-grey" />
                </div>
            </q-toolbar>

            <q-card-section>
                <GoodsOption title="端口 *" v-model="accountType" :optionsVal="accountList" />
            </q-card-section>

            <q-form ref="myForm" @submit="onSubmit">
                <q-card-section>
                    <q-input label="用户名 *" v-model="userObj.username" lazy-rules :rules="[
                        (val) => (val && val.length > 2) || 'Please type something',
                    ]" />
                    <q-input label="密码 *" type="password" v-model="userObj.password" lazy-rules :rules="[
                        (val) => (val && val.length > 5) || 'Please type something',
                    ]" />
                </q-card-section>

                <q-card-section class="text-center">
                    <q-btn rounded color="primary" class="q-px-xl q-py-md" type="submit" label="登录" />
                </q-card-section>
            </q-form>
        </q-card>
    </q-page>
</template>

<script lang="ts">
import { Account } from 'components/models';
import {
    defineComponent,
    ref,
    onMounted,
    onBeforeUnmount,
    watch,
    computed,
} from 'vue';
import { useRouter } from 'vue-router';
import { useBaseStore } from 'stores/base';
import { useQuasar, useMeta } from 'quasar';
import { api } from 'boot/axios';
import GoodsOption from 'components/GoodsOption.vue';

const metaData = {
    title: '用户登录',
};

export default defineComponent({
    name: 'LoginPage',
    components: { GoodsOption },
    setup() {
        const $q = useQuasar();
        const router = useRouter();
        const store = useBaseStore();

        const isLogin = localStorage.getItem('userToken');

        const myForm = ref();
        const userObj = ref<Account>();

        const loadData = () => {
            userObj.value = { username: '', password: '' };
        };

        // 账户
        const accountType = ref('store');
        const accountList = ref([
            { label: '门店端', value: 'store' },
            { label: '总后台管理端', value: 'admin' },
        ]);

        const submitData = (data: any) => {
            // $q.loading.show();
            api
                .post(accountType.value === 'admin' ? '/login' : '/login/store', data)
                .then((payload: any) => {
                    console.log('登录', payload);

                    const { token, storeId, id, website } = payload;
                    let userToken = token;

                    if (!userToken) {
                        $q.notify({
                            color: 'red',
                            position: 'top',
                            message: '登录失败!',
                            icon: 'las la-frown',
                        });

                        return;
                    }
                    // save
                    store.login(userToken);

                    window.location.href = '/'

                    // 把登陆类型存进本地
                    localStorage.setItem('accountType', accountType.value);
                    localStorage.setItem('storeId', storeId);
                    localStorage.setItem('id', id);
                    localStorage.setItem('website', website);
                })
                .finally(() => {
                    // $q.loading.hide();
                });
        };

        const onSubmit = () => {
            myForm.value.validate().then((success: any) => {
                if (success) {
                    const bodyData = Object.assign({}, userObj.value);

                    // console.log(bodyData);

                    submitData(bodyData);
                } else {
                    $q.notify({
                        color: 'negative',
                        position: 'top',
                        message: '数据输入不完整!',
                        icon: 'las la-bug',
                    });
                }
            });
        };

        //
        watch(
            () => isLogin,
            (val, preVal) => {
                console.log('watch.userToken', val, preVal);

                if (val) {
                    router.replace({
                        path: '/',
                    });
                }
            },
            { immediate: true }
        );

        //
        onMounted(() => {
            loadData();
        });

        onBeforeUnmount(() => {
            // we do cleanup
        });

        // needs to be called in setup()
        useMeta(metaData);

        //
        return { isLogin, myForm, userObj, accountList, accountType, onSubmit };
    },
});
</script>
