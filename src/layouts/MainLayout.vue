<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2">
    <q-header v-if="isLogin" reveal class="bg-transparent text-black">
      <q-toolbar class="q-mt-xs">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <GoBack />

        <q-toolbar-title>
          <!-- <div>
            <span class="text-subtitle1">{{ dealerDoc.name }}</span>
          </div> -->
          <!-- {{ appPredata.dealerDocs }} -->
        </q-toolbar-title>

        <div class="flex flex-center q-gutter-sm">
          <!-- <q-btn flat rounded label="品牌标签" to="/brand-label" /> -->

          <!-- <q-separator vertical /> -->

          <q-btn-dropdown flat rounded dropdown-icon="las la-cog">
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <q-btn flat rounded icon="las la-home" to="/" />
                <div class="text-subtitle2 q-mt-md">个人信息</div>
                <div class="text-subtitle2 q-mt-md">
                  <a
                    href="http://backend-ngj.oss-cn-shanghai.aliyuncs.com/ngj.docx"
                    >后台说明文档下载</a
                  >
                </div>
              </div>

              <q-separator vertical inset class="q-mx-lg" />

              <div class="column items-center">
                <q-avatar size="72px" color="grey-2">
                  <q-icon name="las la-user" />
                  <!-- <q-icon name="bar_chart"/> -->
                </q-avatar>

                <div class="text-subtitle1 q-mt-md q-mb-xs"></div>

                <!-- <q-btn
                      color="primary"
                      label="Logout"
                      push
                      size="sm"
                      v-close-popup
                    /> -->
                <q-btn
                  flat
                  rounded
                  color="primary"
                  icon="las la-sign-out-alt"
                  label="退出"
                  @click="logout"
                />
              </div>
            </div>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-toolbar>
        <q-toolbar-title>
          <div>
            <q-img
              src="../assets/ICON.svg"
              spinner-color="white"
              style="height: 50px; max-width: 50px; margin-left: 50px;cursor: pointer;"
              @click="navigateToHomePage"
            >
              <!-- <div class="absolute-bottom text-subtitle1 text-center">看板</div> -->
            </q-img>
          </div>
        </q-toolbar-title>
        <div v-if="hostUri == 'https://wxapp.ngj.nkdppf.com'">测试环境</div>
        <div class="text-caption text-grey">Quasar v{{ $q.version }}</div>
      </q-toolbar>

      <q-list>
        <q-item-label header> Essential Links</q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, watch, computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBaseStore } from 'stores/base';
import { useQuasar, useMeta } from 'quasar';

import GoBack from 'components/GoBack.vue';
import EssentialLink from 'components/EssentialLink.vue';

const linksList = [
  {
    title: '图片管理',
    caption: 'image',
    icon: 'las la-image',
    link: '/img-manage',
  },
  {
    title: '用户管理',
    caption: 'users',
    icon: 'school',
    link: '/user',
  },
  {
    title: '员工管理',
    caption: 'employee manage',
    icon: 'las la-user-lock',
    link: '/employee-manage',
  },
  {
    title: '积分明细',
    caption: 'points details',
    icon: 'las la-coins',
    link: '/points-details',
  },
  {
    title: '门店管理',
    caption: 'store manage',
    icon: 'las la-store',
    link: '/store-manage',
  },
  {
    title: '会员权益',
    caption: 'user welfare',
    icon: 'las la-birthday-cake',
    link: '/welfare',
  },
  {
    title: '权益卡管理',
    caption: 'benefit card manage',
    icon: 'credit_card',
    link: '',
    isExpand: true,
    children: [
      {
        title: '权益卡/商品包配置',
        caption: 'benefit card disposition',
        link: '/benefit-card-disposition',
      },
      {
        title: '用户权益卡',
        caption: 'User benefit cards',
        link: '/user-benefit-cards',
      },
    ],
  },

  {
    title: '车辆管理',
    caption: 'car',
    icon: 'las la-car',
    link: '',
    isExpand: true,
    children: [
      {
        title: '汽车品牌',
        caption: 'car brand',
        link: '/car-brand',
      },
      {
        title: '汽车型号',
        caption: 'car model',
        link: '/car-model',
      },
      {
        title: '用户车库',
        caption: 'user car',
        link: '/user-car',
      },
    ],
  },
  {
    title: '商品管理',
    caption: 'product',
    icon: 'lab la-product-hunt',
    link: '',
    isExpand: true,
    children: [
      {
        title: '商品类型',
        caption: 'product type',
        link: '/product-type',
      },
      {
        title: '商品系列',
        caption: 'product model',
        link: '/product-model',
      },
      {
        title: '商品部位',
        caption: 'product position',
        link: '/product-position',
      },
      {
        title: '商品',
        caption: 'product',
        link: '/product',
      },
    ],
  },
  {
    title: '卡券管理',
    caption: 'coupon',
    icon: 'chat',
    link: '',
    isExpand: true,
    children: [
      {
        title: '卡券模板',
        caption: 'coupon board',
        link: '/coupon-board',
      },
      {
        title: '用户卡券',
        caption: 'send coupon',
        link: '/coupon',
      },
    ],
  },
  {
    title: '膜卷管理',
    caption: 'roll',
    icon: 'las la-scroll',
    link: '/roll',
  },
  {
    title: '施工单',
    caption: 'construction',
    icon: 'las la-file-alt',
    link: '/construction',
  },
  {
    title: '案例中心管理',
    caption: 'case manage',
    icon: 'las la-bookmark',
    link: '/case-manage',
  },
  {
    title: '订单',
    caption: 'order form',
    icon: 'las la-user',
    link: '/order',
  },
  {
    title: '推荐管理',
    caption: 'recommend',
    icon: 'las la-thumbs-up',
    link: '/recommend',
  },
  {
    title: '3D模型配置',
    caption: '3D Model',
    icon: 'las la-cube',
    link: '/config-model',
  },
  {
    title: '公告',
    caption: 'notice',
    icon: 'las la-bullhorn',
    link: '/notice',
  },
];

const storeLinksList = [
  {
    title: '用户管理',
    caption: 'users',
    icon: 'school',
    link: '/user',
  },
  {
    title: '员工管理',
    caption: 'employee manage',
    icon: 'las la-user-lock',
    link: '/employee-manage',
  },
  {
    title: '车辆管理',
    caption: 'car',
    icon: 'las la-car',
    link: '',
    isExpand: true,
    children: [
      {
        title: '汽车品牌',
        caption: 'car brand',
        link: '/car-brand',
      },
      {
        title: '汽车型号',
        caption: 'car model',
        link: '/car-model',
      },
      {
        title: '用户车库',
        caption: 'user car',
        link: '/user-car',
      },
    ],
  },
  {
    title: '商品管理',
    caption: 'product',
    icon: 'lab la-product-hunt',
    link: '',
    isExpand: true,
    children: [
      {
        title: '商品类型',
        caption: 'product type',
        link: '/product-type',
      },
      {
        title: '商品系列',
        caption: 'product model',
        link: '/product-model',
      },
      {
        title: '商品部位',
        caption: 'product position',
        link: '/product-position',
      },
      {
        title: '商品',
        caption: 'product',
        link: '/product',
      },
    ],
  },
  {
    title: '积分明细',
    caption: 'points details',
    icon: 'las la-coins',
    link: '/points-details',
  },
  {
    title: '权益卡管理',
    caption: 'benefit card manage',
    icon: 'credit_card',
    link: '',
    isExpand: true,
    children: [
      {
        title: '权益卡/商品包配置',
        caption: 'benefit card disposition',
        link: '/benefit-card-disposition',
      },
      {
        title: '用户权益卡',
        caption: 'User benefit cards',
        link: '/user-benefit-cards',
      },
    ],
  },
  {
    title: '卡券管理',
    caption: 'coupon',
    icon: 'chat',
    link: '',
    isExpand: true,
    children: [
      {
        title: '卡券模板',
        caption: 'coupon board',
        link: '/coupon-board',
      },
      {
        title: '用户卡券',
        caption: 'send coupon',
        link: '/coupon',
      },
    ],
  },
  {
    title: '膜卷管理',
    caption: 'roll',
    icon: 'las la-scroll',
    link: '/roll',
  },
  {
    title: '施工单',
    caption: 'construction',
    icon: 'las la-file-alt',
    link: '/construction',
  },
  {
    title: '案例中心管理',
    caption: 'case manage',
    icon: 'las la-bookmark',
    link: '/case-manage',
  },
  {
    title: '订单',
    caption: 'order form',
    icon: 'las la-user',
    link: '/order',
  },
  {
    title: '推荐管理',
    caption: 'recommend',
    icon: 'las la-thumbs-up',
    link: '/recommend',
  },
  {
    title: '公告',
    caption: 'notice',
    icon: 'las la-bullhorn',
    link: '/notice',
  },
];

const metaData = {
  title: '管理后台',
};

export default defineComponent({
  name: 'MainLayout',

  components: { GoBack, EssentialLink },

  setup() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const base = useBaseStore();
    const $q = useQuasar();

    const router = useRouter();
    const store = useBaseStore();

    let accountType = localStorage.getItem('accountType');

    const isLogin = computed(() => !!store.userToken);
    const hostUri = computed(() => store.hostUri);
    // console.log('hostUri', hostUri.value)

    const leftDrawerOpen = ref(false);

    const logout = () => {
      store.logout();
    };

    const loadData = () => {
      console.log();
    };

    //
    onMounted(() => {
      // loadData();
    });

    function navigateToHomePage() {
      router.push('/');
    }

    // set status
    $q.dark.set(false); // or false or "auto"

    //
    watch(
      isLogin,
      (val, preVal) => {
        // console.log('isLogin', val, preVal);
        if (!val) {
          router.replace({
            path: '/login',
          });
        }
      },
      { immediate: true }
    );

    //
    useMeta(metaData);
    //
    return {
      essentialLinks: accountType === 'admin' ? linksList : storeLinksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      isLogin,
      logout,
      hostUri,
      navigateToHomePage,
    };
  },
});
</script>
