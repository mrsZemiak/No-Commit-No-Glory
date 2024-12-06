import { createRouter, createWebHistory } from 'vue-router';
import AdminView from '@/views/AdminView.vue';
import ReviewerView from '@/views/ReviewerView.vue';
import ParticipantView from '@/views/ParticipantView.vue';
import HomeView from '../views/HomeView.vue';
import SubmissionView from "@/views/SubmissionView.vue";
import ReviewForm from "@/components/Reviewer/ReviewForm.vue";
import UserCard from "@/views/UserProfile/UserCard.vue";

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/profile', name: 'Profile', component: UserCard },
  { path: '/studentSubmission', name: 'studentSubmission', component: SubmissionView },
  { path: '/reviewForm', name: 'reviewForm', component: ReviewForm},
  { path: '/participantView', name: 'ParticipantView', component: ParticipantView},

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
