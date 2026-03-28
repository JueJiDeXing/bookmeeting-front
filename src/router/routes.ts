import {RouteRecordRaw} from 'vue-router';
import AboutView from '@/views/AboutView.vue';
import UserLoginView from '@/views/user/UserLoginView.vue';
import UserRegisterView from '@/views/user/UserRegisterView.vue';
import UserProfileView from '@/views/user/UserProfileView.vue';
import UserPasswordView from '@/views/user/UserPasswordView.vue';

import NoAuth from '@/views/NoAuthView.vue';
import AccessEnum from "@/access/accessEnum";
import HomeView from "@/views/HomeView.vue";
import UserManage from "@/views/admin/UserManage.vue";
import UserUpdate from "@/views/admin/UserUpdate.vue";
import RoomManage from "@/views/admin/RoomManage.vue";
import RoomAdd from "@/views/admin/RoomAdd.vue";
import EquipmentManage from "@/views/admin/EquipmentManage.vue";
import BookingManage from "@/views/admin/BookingManage.vue";
import BookingStatistics from "@/views/admin/BookingStatistics.vue";
import RoomDetailView from "@/views/user/RoomDetailView.vue";
import MyBookingsView from "@/views/user/MyBookingsView.vue";
import BookingDetailView from "@/views/user/BookingDetailView.vue";
import EquipmentCategoryManage from "@/views/admin/EquipmentCategoryManage.vue";

const userRouters: Array<RouteRecordRaw> = [
    {
        path: "/user/login",
        name: "用户登录",
        component: UserLoginView,
        meta: {
            access: AccessEnum.NOT_LOGIN,
            hideInMenu: true,
            layout: ""
        }
    },
    {
        path: "/user/register",
        name: "用户注册",
        component: UserRegisterView,
        meta: {
            access: AccessEnum.NOT_LOGIN,
            hideInMenu: true,
            layout: ""
        }
    },
    {
        path: "/user/profile",
        name: "个人信息",
        component: UserProfileView,
        meta: {
            access: AccessEnum.USER,
            hideInMenu: true,
            layout: "BasicLayout"
        }
    },
    {
        path: "/user/password",
        name: "修改密码",
        component: UserPasswordView,
        meta: {
            access: AccessEnum.USER,
            hideInMenu: true,
            layout: "BasicLayout"
        }
    },
    {
        path: '/room/:id',
        name: '会议室详情',
        component: RoomDetailView,
        meta: {
            access: AccessEnum.USER,
            hideInMenu: true,
            layout: "BasicLayout"
        }
    },
    {
        path: '/my-bookings',
        name: '我的预定',
        component: MyBookingsView,
        meta: {
            access: AccessEnum.USER,
            hideInMenu: false,
            layout: "BasicLayout",
            order: 2
        }
    },
    {
        path: '/booking/:id',
        name: '预定详情',
        component: BookingDetailView,
        meta: {
            access: AccessEnum.USER,
            hideInMenu: true,
            layout: "UserLayout"
        }
    },
    {
        path: '/pending-meetings',
        name: '待响应会议',
        component: () => import('@/views/user/PendingMeetingsView.vue'),
        meta: {
            access: AccessEnum.USER,
            hideInMenu: false,
            layout: "BasicLayout",
            order: 3
        }
    },
    {
        path: '/messages',
        name: '消息中心',
        component: () => import('@/views/user/MessagesView.vue'),
        meta: {
            access: AccessEnum.USER,
            hideInMenu: false,
            layout: "BasicLayout",
            order: 4
        }
    }
];

const adminRouters: Array<RouteRecordRaw> = [
    {
        path: '/admin/user',
        name: '切换到管理员端',
        component: UserManage,
        meta: {
            access: AccessEnum.ADMIN,
            hideInMenu: false,
            layout: "AdminLayout",
            order: -1
        }
    },
    {
        path: '/admin/user/add',
        name: '新增用户',
        component: UserUpdate,
        meta: {
            access: AccessEnum.ADMIN,
            hideInMenu: true,
            layout: "AdminLayout"
        }
    },
    {
        path: '/admin/room',
        name: '会议室列表',
        component: RoomManage,
        meta: {
            access: AccessEnum.ADMIN,
            hideInMenu: true,
            layout: "AdminLayout"
        }
    },
    {
        path: '/admin/room/add',
        name: '新增会议室',
        component: RoomAdd,
        meta: {
            access: AccessEnum.ADMIN,
            hideInMenu: true,
            layout: "AdminLayout"
        }
    },
    {
        path: '/admin/equipment',
        name: '设备列表',
        component: EquipmentManage,
        meta: {
            access: AccessEnum.ADMIN,
            hideInMenu: true,
            layout: "AdminLayout"
        }
    },
    {
        path: '/admin/equipment/category',
        name: '设备分类',
        component: EquipmentCategoryManage,
        meta: {
            access: AccessEnum.ADMIN,
            hideInMenu: true,
            layout: "AdminLayout"
        }
    },
    {
        path: '/admin/booking',
        name: '预定记录',
        component: BookingManage,
        meta: {
            access: AccessEnum.ADMIN,
            hideInMenu: true,
            layout: "AdminLayout"
        }
    },
    {
        path: '/admin/booking/statistics',
        name: '使用统计',
        component: BookingStatistics,
        meta: {
            access: AccessEnum.ADMIN,
            hideInMenu: true,
            layout: "AdminLayout"
        }
    }
];

export const routes: Array<RouteRecordRaw> = [
    ...userRouters,
    ...adminRouters,
    {
        path: '/',
        name: '主页',
        component: HomeView,
        meta: {
            access: AccessEnum.NOT_LOGIN,
            hideInMenu: false,
            layout: "BasicLayout",
            order: 1
        },
    },
    {
        path: '/about',
        name: '关于',
        component: AboutView,
        meta: {
            access: AccessEnum.NOT_LOGIN,
            hideInMenu: false,
            layout: "BasicLayout",
            order: 100
        },
    },
    {
        path: '/noAuth',
        name: '无权限',
        component: NoAuth,
        meta: {
            access: AccessEnum.NOT_LOGIN,
            hideInMenu: true,
        },
    },
];
