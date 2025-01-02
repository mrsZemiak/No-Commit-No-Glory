import { createRouter, createWebHistory } from 'vue-router';
import AdminView from '@/views/AdminView.vue';
import ReviewerView from '@/views/ReviewerView.vue';
import ParticipantView from '@/views/ParticipantView.vue';
import HomeView from '@/views/HomeView.vue';
import SubmissionView from "@/views/SubmissionView.vue";
import ReviewForm from "@/components/reviewer/ReviewForm.vue";
import UserCard from "@/views/profile/UserCard.vue";
import GuestLayout from "@/layouts/GuestLayout.vue";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout.vue";
import ReviewTable from "@/components/reviewer/ReviewTable.vue";
import ConferenceTable from "@/components/admin/ConferenceTable.vue";
import CategoryTable from "@/components/admin/CategoryTable.vue";
import UserTable from "@/components/admin/UserTable.vue";
import WorksTable from "@/components/admin/WorksTable.vue";
import ReviewResult from "@/components/participant/ReviewResult.vue";
import ParticipantWorksTable from '@/components/participant/ParticipantWorksTable.vue'
import EmailVerification from '@/views/auth/EmailVerification.vue'


const routes = [
  {
    path: '/',
    name: 'GuestLayout',
    component: GuestLayout,
    children: [
      { path: '', name: 'HomeView', component: HomeView },
    ],
  },
  { path: '/verify-email', component: EmailVerification },
  {
    path: '/auth',
    component: AuthenticatedLayout,
    children: [
      { path: '', name: 'HomeView', component: HomeView },
      { path: 'home', name: 'Home', component: HomeView },
      { path: 'profile', name: 'Profile', component: UserCard },
      { path: 'submit', name: 'StudentSubmission', component: SubmissionView },
      { path: 'reviews', name: 'ReviewTable', component: ReviewTable },
      { path: 'conferences', name: 'ConferenceTable', component: ConferenceTable },
      { path: 'categories', name: 'CategoryTable', component: CategoryTable },
      { path: 'users', name: 'UserTable', component: UserTable },
      {
        path: "works", // Add this route for Papers
        name: "Works",
        component: WorksTable, // Adjust component if needed
      },
      {
        path: "participant", // Add this route for participant
        name: "ParticipantView",
        component: ParticipantView,
      },
      {
        path: "participant/my-works",
        name: "ParticipantWorks",
        component: ParticipantWorksTable,
      },
      {
        path: '/review/:id',
        name: 'ReviewForm',
        component: ReviewForm,
        props: true
      },
      {
        path: 'review-result/:id',
        name: 'ReviewResult',
        component: ReviewResult,
        props: true,
      },
      {
        path: '/edit/:workId',
        name: 'EditSubmission',
        component: SubmissionView,
        props: true,
      },
    ],
  },

  {
    path: '/admin',
    component: AdminView,
    meta: { role: 'admin' },
  },
  {
    path: '/reviewer',
    component: ReviewerView,
    meta: { role: 'reviewer' },
  },
  {
    path: '/participant',
    component: ParticipantView,
    meta: { role: 'participant' },
  },
/*
  // Unauthorized route
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('./UnauthorizedView.vue'),
  },
 */
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Role-based navigation guard
router.beforeEach((to, from, next) => {
  const userRole = localStorage.getItem('role');
  if (to.meta.role && to.meta.role !== userRole) {
    next('/unauthorized');
  } else {
    next();
  }
});

export default router;
