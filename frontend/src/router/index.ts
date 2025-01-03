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
import ConferenceTable from "@/components/Admin/ConferenceTable.vue";
import CategoryTable from "@/components/Admin/CategoryTable.vue";
import UserTable from "@/components/Admin/UserTable.vue";
import WorksTable from "@/components/Admin/WorksTable.vue";
import ReviewResult from "@/components/Participant/ReviewResult.vue";


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
      { path: 'submit', name: 'StudentSubmission', component: SubmissionView },
      { path: 'reviews', name: 'ReviewTable', component: ReviewTable },
      { path: 'participantView', name: 'ParticipantView', component: ParticipantView},
      { path: 'conferences', name: 'ConferenceTable', component: ConferenceTable },
      { path: 'categories', name: 'CategoryTable', component: CategoryTable },
      { path: 'users', name: 'UserTable', component: UserTable },
      { path: 'papers-list', name: 'PapersList', component: WorksTable},
      {
        path: '/conference-papers/:conferenceId',
        name: 'ConferencePapers',
        component: WorksTable,
        props: true
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
