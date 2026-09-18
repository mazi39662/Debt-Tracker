import { createRouter, createWebHistory } from "@ionic/vue-router";

import TabsPage from "@/views/TabsPage.vue";

import HomePage from "@/views/HomePage.vue";
import DebtsPage from "@/views/DebtsPage.vue";
import MorePage from "@/views/MorePage.vue";
import CalendarPage from "@/views/CalendarPage.vue";
import PaymentHistoryPage from "@/views/PaymentHistoryPage.vue";

const routes = [
  {
    path: "/",
    redirect: "/tabs/home",
  },

  {
    path: "/tabs/",
    component: TabsPage,

    children: [
      {
        path: "",
        redirect: "/tabs/home",
      },

      {
        path: "home",
        component: HomePage,
      },

      {
        path: "debts",
        component: DebtsPage,
      },

      {
        path: "calendar",
        component: CalendarPage,
      },

      {
        path: "more",
        component: MorePage,
      },

      {
        path: "payment-history",
        component: PaymentHistoryPage,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
