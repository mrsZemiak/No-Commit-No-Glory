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
      { path: '', name: 'Homepage', component: () => import('@/views/common/Homepage.vue')},
      { path: 'verify-email',
        name: 'EmailVerification', component: () => import('@/views/verification/EmailVerification.vue')},
      { path: 'email-verified-success',
        name: 'EmailVerifiedSuccess', component: () => import('@/views/verification/EmailVerifiedSuccess.vue')},
      { path: 'email-verified-failure',
        name: 'EmailVerifiedFailure', component: () => import('@/views/verification/EmailVerifiedFailure.vue')},
    ],
  },

  // Authenticated Routes
  {
    path: '/auth',
    component: AuthenticatedLayout,
    meta: { requiresAuth: true }, // Global auth check for this layout
    children: [
      // Common routes for all authenticated users
      { path: 'profile', name: 'Profile', component: () => import('@/views/profile/ProfileView.vue')},

      // Admin Routes
      {
        path: 'admin',
        meta: { role: 'admin' },
        children: [
          // Redirect /auth/admin to /auth/admin/conferences
          { path: '', redirect: { name: 'ConferenceTable' } },
          { path: 'conferences', name: 'ConferenceTable', component: () => import('@/components/admin/ConferenceTable.vue')},
          { path: 'categories', name: 'CategoryTable', component: () => import('@/components/admin/CategoryTable.vue')},
          { path: 'users', name: 'UserTable', component: () => import('@/components/admin/UserTable.vue')},
          { path: 'papers-list', name: 'PapersList', component: () => import('@/components/admin/WorksTable.vue')},
          { path: 'questions', name: 'QuestionsTable', component: () => import('@/components/admin/QuestionTable.vue')},
          {
            path: 'conference-papers/:conferenceId',
            name: 'ConferencePapers',
            component: () => import('@/components/admin/WorksTable.vue'),
            props: true
          },
          {
            path: 'users/edit/:id',
            name: 'EditUser',
            component: () => import('@/components/admin/ModalEditUser.vue'),
            props: true,
          },
          {
            path: 'questions/edit/:id',
            name: 'EditQuestion',
            component: () => import('@/components/admin/ModalQuestion.vue'),
            props: true,
          },
        ],
      },

      // Participant Routes
      {
        path: 'participant',
        meta: { role: 'participant' },
        children: [
          { path: 'submit', name: 'SubmitWork', component: () => import('@/components/participant/SubmissionForm.vue')},
          { path: 'works', name: 'ParticipantWorks', component: () => import('@/components/participant/MyWorksTable.vue')},
          {
            path: 'work/:id/edit',
            name: 'EditSubmission',
            component: () => import('@/components/participant/SubmissionForm.vue'),
            props: true
          },
        ],
      },

      // Reviewer Routes
      {
        path: 'reviewer',
        meta: { role: 'reviewer' },
        children: [
          { path: 'reviews', name: 'ReviewTable', component: () => import('@/components/reviewer/ReviewTable.vue') },
          {
            path: 'review/:id',
            name: 'ReviewForm',
            component: () => import('@/components/reviewer/ReviewForm.vue'),
            props: true
          },
        ],
      },
    ],
  },

  // Fallback Routes
  { path: '/unauthorized', name: 'Unauthorized', component: () => import('@/views/common/UnauthorizedView.vue') },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/common/NotFound.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(); // Access the auth store

  // Set document title
  if (to.meta.title) {
    document.title = `SciSubmit - ${to.meta.title}`;
  }

  // Check authentication for routes that require it
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'Unauthorized' }); // Redirect to Unauthorized page
    }
  }

  //Handle redirection from /auth to role-specific subpaths
  if (to.path === '/auth') {
    if (authStore.isAdmin) {
      return next('/auth/admin');
    } else if (authStore.isParticipant) {
      return next('/auth/participant');
    } else if (authStore.isReviewer) {
      return next('/auth/reviewer');
    } else {
      return next('/auth/profile'); // Default to profile
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
