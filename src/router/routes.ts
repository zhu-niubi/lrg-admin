import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'HOME',
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { isHome: true },
      },
      {
        //膜卷
        path: '/roll',
        children: [
          {
            path: 'new',
            component: () => import('pages/roll/new.vue'),
          },
          {
            path: 'edit',
            component: () => import('pages/roll/edit.vue'),
            name: 'roll-edit',
          },
          {
            path: '',
            component: () => import('pages/roll/index.vue'),
          },
        ],
      },
      // 公告notice
      {
        path: '/notice',
        children: [
          {
            path: 'new',
            component: () => import('pages/notice/new.vue'),
          },
          {
            path: 'edit',
            component: () => import('pages/notice/edit.vue'),
            name: 'notice-edit',
          },
          {
            path: '',
            component: () => import('pages/notice/index.vue'),
          },
        ],
      },
    ],
  },

  {
    path: '/login',
    component: () => import('layouts/BlankLayout.vue'),
    children: [{ path: '', component: () => import('pages/Login.vue') }],
  },
  // config-model
  {
    path: '/config-model',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new/:pamars',
        component: () => import('pages/config-model/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/config-model/edit.vue'),
        name: 'config-model-edit',
      },
      {
        path: '',
        component: () => import('pages/config-model/index.vue'),
      },
    ],
  },
  // recommend
  {
    path: '/recommend',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/recommend/index.vue'),
      },
    ],
  },
  // construction
  {
    path: '/construction',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/construction/new.vue'),
      },
      {
        path: ':id/edit',
        component: () => import('pages/construction/edit.vue'),
      },
      {
        path: ':id/detail',
        component: () => import('pages/construction/detail.vue'),
      },
      {
        path: ':id/saleSlip',
        component: () => import('pages/construction/saleSlip.vue'),
      },
      {
        path: ':id/start',
        component: () => import('pages/construction/start.vue'),
      },
      {
        path: '',
        component: () => import('pages/construction/index.vue'),
      },
    ],
  },
  // order form
  {
    path: '/order',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: ':id/edit',
        component: () => import('pages/order/edit.vue'),
      },
      {
        path: ':id/detail',
        component: () => import('pages/order/detail.vue'),
      },
      {
        path: '',
        component: () => import('pages/order/index.vue'),
      },
    ],
  },
  // product
  {
    path: '/product',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/product/new.vue'),
      },
      {
        path: ':id/edit',
        component: () => import('pages/product/edit.vue'),
      },
      {
        path: '',
        component: () => import('pages/product/index.vue'),
      },
    ],
  },
  // benefit-card-disposition
  {
    path: '/benefit-card-disposition',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/benefit-card-disposition/new.vue'),
      },
      {
        path: ':id/edit',
        component: () => import('pages/benefit-card-disposition/edit.vue'),
        name: 'benefit-card-manage-edit',
      },
      {
        path: '',
        component: () => import('pages/benefit-card-disposition/index.vue'),
      },
    ],
  },
  // user-benefit-cards
  {
    path: '/user-benefit-cards',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: ':id/detail',
        component: () => import('pages/user-benefit-cards/detail.vue'),
      },
      {
        path: '',
        component: () => import('pages/user-benefit-cards/index.vue'),
      },
    ],
  },
  // product-position
  {
    path: '/product-position',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/product-position/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/product-position/edit.vue'),
        name: 'product-position-edit',
      },
      {
        path: '',
        component: () => import('pages/product-position/index.vue'),
      },
    ],
  },
  // product-model
  {
    path: '/product-model',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/product-model/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/product-model/edit.vue'),
        name: 'product-model-edit',
      },
      {
        path: '',
        component: () => import('pages/product-model/index.vue'),
      },
    ],
  },
  // product-type
  {
    path: '/product-type',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/product-type/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/product-type/edit.vue'),
        name: 'product-type-edit',
      },
      {
        path: '',
        component: () => import('pages/product-type/index.vue'),
      },
    ],
  },
  // case-manage
  {
    path: '/case-manage',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/case-manage/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/case-manage/edit.vue'),
        name: 'case-manage-edit',
      },
      {
        path: '',
        component: () => import('pages/case-manage/index.vue'),
      },
    ],
  },
  // employee-manage
  {
    path: '/employee-manage',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/employee-manage/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/employee-manage/edit.vue'),
        name: 'employee-manage-edit',
      },
      {
        path: '',
        component: () => import('pages/employee-manage/index.vue'),
      },
    ],
  },
  // points-details
  {
    path: '/points-details',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      /*{
        path: 'new',
        component: () => import('pages/points-details/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/employee-manage/edit.vue'),
        name: 'employee-manage-edit',
      },*/
      {
        path: '',
        component: () => import('pages/points-details/index.vue'),
      },
    ],
  },

  // store-manage
  {
    path: '/store-manage',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/store-manage/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/store-manage/edit.vue'),
        name: 'store-manage-edit',
      },
      {
        path: '',
        component: () => import('pages/store-manage/index.vue'),
      },
    ],
  },
  // coupon-board
  {
    path: '/coupon-board',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/coupon-board/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/coupon-board/edit.vue'),
        name: 'coupon-board-edit',
      },
      {
        path: '',
        component: () => import('pages/coupon-board/index.vue'),
      },
    ],
  },
  // img - manage
  {
    path: '/img-manage',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/img-manage/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/img-manage/edit.vue'),
        name: 'image-edit',
      },
      {
        path: '',
        component: () => import('pages/img-manage/index.vue'),
      },
    ],
  },
  // coupon-type
  {
    path: '/welfare',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/welfare/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/welfare/edit.vue'),
        name: 'welfare-edit',
      },
      {
        path: '',
        component: () => import('pages/welfare/index.vue'),
      },
    ],
  },
  // coupon-type
  {
    path: '/coupon-type',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/coupon-type/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/coupon-type/edit.vue'),
        name: 'coupon-type-edit',
      },
      {
        path: '',
        component: () => import('pages/coupon-type/index.vue'),
      },
    ],
  },
  // coupon
  {
    path: '/coupon',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/coupon/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/coupon/edit.vue'),
        name: 'coupon-edit',
      },
      {
        path: '',
        component: () => import('pages/coupon/index.vue'),
      },
    ],
  },
  // user
  {
    path: '/user',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'edit',
        component: () => import('pages/user/edit.vue'),
        name: 'user-edit',
      },
      {
        path: '',
        component: () => import('pages/user/index.vue'),
      },
    ],
  },
  // user-car
  {
    path: '/user-car',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/user-car/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/user-car/edit.vue'),
        name: 'user-car-edit',
      },
      {
        path: '',
        component: () => import('pages/user-car/index.vue'),
      },
    ],
  },
  // car brand
  {
    path: '/car-brand',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/car-brand/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/car-brand/edit.vue'),
        name: 'car-brand-edit',
      },
      {
        path: '',
        component: () => import('pages/car-brand/index.vue'),
      },
    ],
  },
  // car model
  {
    path: '/car-model',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'new',
        component: () => import('pages/car-model/new.vue'),
      },
      {
        path: 'edit',
        component: () => import('pages/car-model/edit.vue'),
        name: 'car-model-edit',
      },
      {
        path: '',
        component: () => import('pages/car-model/index.vue'),
      },
    ],
  },

  // other routes ...

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
