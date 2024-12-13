import { createRouter, createWebHistory } from 'vue-router';
import AdminView from '@/views/AdminView.vue';
import ReviewerView from '@/views/ReviewerView.vue';
import ParticipantView from '@/views/ParticipantView.vue';
import HomeView from '../views/HomeView.vue';
import SubmissionView from "@/views/SubmissionView.vue";
import ReviewForm from "@/components/Reviewer/ReviewForm.vue";
import UserCard from "@/views/UserProfile/UserCard.vue";
import GuestLayout from "@/layouts/GuestLayout.vue";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout.vue";
import ReviewTable from "@/components/Reviewer/ReviewTable.vue";


const routes = [
  {
    path: '/',
    name: 'GuestLayout',
    component: GuestLayout,
    children: [
      { path: '', name: 'HomeView', component: HomeView },
    ],
  },
  {
    path: '/auth',
    component: AuthenticatedLayout,
    children: [
      { path: '', name: 'HomeView', component: HomeView },
      { path: 'home', name: 'Home', component: HomeView },
      { path: 'profile', name: 'Profile', component: UserCard },
      { path: 'studentSubmission', name: 'StudentSubmission', component: SubmissionView },
      { path: 'participantView', name: 'ParticipantView', component: ParticipantView },
      { path: 'review', name: 'ReviewTable', component: ReviewTable },
      {
        path: '/review/:id',
        name: 'ReviewForm',
        component: ReviewForm,
        props: true
      },
    ],
  },


  {
    path: '/admin',
    component: AdminView,
    meta: { role: 'Admin' },
  },
  {
    path: '/reviewer',
    component: ReviewerView,
    meta: { role: 'Reviewer' },
  },
  {
    path: '/participant',
    component: ParticipantView,
    meta: { role: 'Participant' },
  },

  // Unauthorized route
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('../views/UnauthorizedView.vue'),
  },
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
