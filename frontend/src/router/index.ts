import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Auth store from Pinia

// Layouts
import GuestLayout from '@/layouts/GuestLayout.vue';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';

const routes = [
  // Guest Routes
  {
    path: '/',
    component: GuestLayout,
    children: [
      { path: '', name: 'HomeView', component: () => import('@/views/common/HomeView.vue')},
      { path: 'verify-email', name: 'EmailVerification', component: () => import('@/views/EmailVerification.vue')},
    ],
  },

  // Authenticated Routes
  {
    path: '/auth',
    component: AuthenticatedLayout,
    meta: { requiresAuth: true }, // Global auth check for this layout
    children: [
      // Common routes for all authenticated users
      { path: 'profile', name: 'Profile', component: () => import('@/views/ProfileView.vue')},

      // Admin Routes
      {
        path: 'admin',
        meta: { role: 'admin' },
        children: [
          { path: 'conferences', name: 'ConferenceTable', component: () => import('@/components/admin/ConferenceTable.vue')},
          { path: 'categories', name: 'CategoryTable', component: () => import('@/components/admin/CategoryTable.vue')},
          { path: 'users', name: 'UserTable', component: () => import('@/components/admin/UserTable.vue')},
          { path: 'works', name: 'WorksTable', component: () => import('@/components/admin/WorksTable.vue')},
          { path: 'questions', name: 'QuestionsTable', component: () => import('@/components/admin/QuestionsTable.vue')},
          // Modal Routes for Editing
          {
            path: 'categories/edit/:id',
            name: 'EditCategory',
            component: () => import('@/components/admin/ModalCategory.vue'),
            props: true,
          },
          {
            path: 'conferences/edit/:id',
            name: 'EditConference',
            component: () => import('@/components/admin/ModalConference.vue'),
            props: true,
          },
          {
            path: 'users/edit/:id',
            name: 'EditUser',
            component: () => import('@/components/admin/ModalEditUser.vue'),
            props: true,
          },
        ],
      },

      // Participant Routes
      {
        path: 'participant',
        meta: { role: 'participant' },
        children: [
          { path: 'submit', name: 'SubmitWork', component: () => import('@/views/participant/SubmitWork.vue')},
          { path: 'works', name: 'ParticipantWorks', component: () => import('@/components/participant/MyWorksTable.vue')},
          {
            path: 'work/:id/edit',
            name: 'EditWork',
            component: () => import('@/views/participant/EditWork.vue'),
            props: true
          },
        ],
      },

      // Reviewer Routes
      {
        path: 'reviewer',
        meta: { role: 'reviewer' },
        children: [
          { path: 'reviews', name: 'ReviewerReviews', component: () => import('@/views/reviewer/ReviewsTable.vue') },
          {
            path: 'review/:id',
            name: 'ReviewerEditReview',
            component: () => import('@/views/reviewer/EditReview.vue'),
            props: true
          },
        ],
      },
    ],
  },

  // Fallback Routes
  { path: '/unauthorized', name: 'Unauthorized', component: () => import('@/views/common/UnauthorizedView.vue') },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(); // Access the auth store

  // Check authentication for routes that require it
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'Unauthorized' }); // Redirect to Unauthorized page
    }
  }
  // Check role-based access control
  if (to.meta.role) {
    const hasAccess =
      (to.meta.role === 'admin' && authStore.isAdmin) ||
      (to.meta.role === 'reviewer' && authStore.isReviewer) ||
      (to.meta.role === 'participant' && authStore.isParticipant);

    if (!hasAccess) {
      return next({ name: 'Unauthorized' }); // Redirect to Unauthorized page
    }
  }
  next();
});


export default router;
