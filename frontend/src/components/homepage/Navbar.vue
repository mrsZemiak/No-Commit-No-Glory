<template>
  <v-app-bar
    app
    color="rgba(210, 233, 227, 0.8)"
    elevate-on-scroll
    flat
  >
    <!-- Logo -->
    <v-app-bar-title>
      <img src="@/assets/images/logo_h.png" alt="Logo" height="50" />
    </v-app-bar-title>

    <!-- Spacer -->
    <v-spacer></v-spacer>

    <!-- GitHub Icon -->
    <v-btn
      href="https://github.com/Elfonator/No-Commit-No-Glory"
      target="_blank"
      variant="text"
    class="github-icon"
    >
    <v-icon size="36" color="#2C3531">mdi-github</v-icon>
    </v-btn>

    <!-- Login Button -->
    <v-btn outlined class="login-button me-4" @click="loginDialog = true">
      Prihlásenie
      <v-icon left>mdi-login</v-icon>
    </v-btn>

    <!-- Login/Registration Modal -->
    <v-dialog v-model="loginDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">{{ activeTab === 'login' ? 'Prihlásiť sa' : 'Registrovať sa' }}</v-card-title>
        <v-card-text>
          <v-tabs v-model="activeTab" grow>
            <v-tab value="login">Prihlásenie</v-tab>
            <v-tab value="register">Registrácia</v-tab>
          </v-tabs>
          <div v-if="activeTab === 'login'">
            <!-- Login Form -->
            <v-form ref="loginForm" @submit.prevent="handleLogin">
              <v-text-field v-model="loginEmail" label="Email" type="email" required></v-text-field>
              <v-text-field
                v-model="loginPassword"
                :type="showPassword ? 'text' : 'password'"
                label="Heslo"
                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="togglePasswordVisibility"
                required></v-text-field>
              <v-btn color="primary" type="submit" block>Prihlásiť sa</v-btn>
            </v-form>
            <div class="forgot-password">
              <v-btn small @click="activeTab = 'forgotPassword'">Zabudnuté heslo?</v-btn>
            </div>
          </div>
          <div v-if="activeTab === 'register'">
            <v-form ref="registerForm" @submit.prevent="handleRegister">
              <v-text-field
                v-model="registerFirstName"
                label="Meno"
                :error-messages="getError('first_name')"
                required
              ></v-text-field>
              <v-text-field
                v-model="registerLastName"
                label="Priezvisko"
                :error-messages="getError('last_name')"
                required
              ></v-text-field>
              <v-text-field
                v-model="registerEmail"
                label="Email"
                type="email"
                required
              ></v-text-field>
              <v-text-field
                v-model="registerPassword"
                :type="showPassword ? 'text' : 'password'"
                label="Heslo"
                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="togglePasswordVisibility"
                required
              ></v-text-field>
              <!-- Confirm Password Field -->
              <v-text-field
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                label="Zopakujte heslo"
                :append-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="toggleConfirmPasswordVisibility"
                required
              ></v-text-field>
              <v-select
                v-model="registerUniversity"
                :items="universities"
                label="Univerzita"
                :error-messages="getError('university')"
                required
              ></v-select>
              <v-select
                v-model="registerRole"
                :items="roles"
                label="Role"
                :error-messages="getError('role')"
                required
              ></v-select>
              <v-btn color="primary" type="submit" block>Registrovať sa</v-btn>
            </v-form>
          </div>
          <div v-if="activeTab === 'forgotPassword'">
            <!-- Forgot Password Form -->
            <v-form ref="forgotPasswordForm" @submit.prevent="handleForgotPassword">
              <v-text-field v-model="forgotPasswordEmail" label="Email" type="email" required></v-text-field>
              <v-btn color="primary" type="submit" block>Obnoviť heslo</v-btn>
              <v-btn small @click="activeTab = 'login'">Späť na prihlásenie</v-btn>
            </v-form>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="loginDialog = false">Zatvoriť</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'Navbar',
  setup() {
    const loginDialog = ref(false);
    const activeTab = ref('login');
    const password = ref('');
    const confirmPassword = ref('');
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const loginEmail = ref('');
    const loginPassword = ref('');
    const forgotPasswordEmail = ref('');
    const registerFirstName = ref('');
    const registerLastName = ref('');
    const registerEmail = ref('');
    const registerPassword = ref('');
    const registerUniversity = ref(null);
    const registerRole = ref(null);
    const universities = ref(['UKF', 'UMB', 'UCM']);
    const roles = ref(['Student', 'Reviewer', 'Admin']);
    const errors = ref<Record<string, string[]>>({});

    const handleLogin = async () => {
      try {
        const response = await axios.post('/api/login', {
          email: loginEmail.value,
          password: loginPassword.value,
        });
        console.log('Login successful:', response.data);
        loginDialog.value = false;
      } catch (error) {
        console.error('Login failed:', error);
      }
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    const toggleConfirmPasswordVisibility = () => {
      showConfirmPassword.value = !showConfirmPassword.value;
    };

    const handleForgotPassword = async () => {
      try {
        const response = await axios.post('/api/forgot-password', {
          email: forgotPasswordEmail.value,
        });
        console.log('Password recovery email sent:', response.data);
        activeTab.value = 'login';
      } catch (error) {
        console.error('Password recovery failed:', error);
      }
    };

    const handleRegister = async () => {
      try {
        const response = await axios.post('/api/register', {
          first_name: registerFirstName.value,
          last_name: registerLastName.value,
          email: registerEmail.value,
          password: registerPassword.value,
          university: registerUniversity.value,
          role: registerRole.value,
        });
        console.log('Registration successful:', response.data);
        loginDialog.value = false;
      } catch (error: unknown) {
        // Assert the error as AxiosError
        if (axios.isAxiosError(error) && error.response && error.response.data.errors) {
          processErrors(error.response.data.errors);
        } else {
          console.error('Unexpected error:', error);
        }
      }
    };

    const processErrors = (serverErrors: any[]) => {
      errors.value = {};
      serverErrors.forEach((error: any) => {
        if (!errors.value[error.path]) {
          errors.value[error.path] = [];
        }
        errors.value[error.path].push(error.msg);
      });
    };

    const getError = (field: string) => {
      return errors.value[field] || [];
    };

    return {
      loginDialog,
      activeTab,
      password,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      loginEmail,
      loginPassword,
      forgotPasswordEmail,
      registerFirstName,
      registerLastName,
      registerEmail,
      registerPassword,
      registerUniversity,
      registerRole,
      universities,
      roles,
      togglePasswordVisibility,
      toggleConfirmPasswordVisibility,
      handleLogin,
      handleForgotPassword,
      handleRegister,
      getError,
    };
  },
});
</script>

<style lang="scss">

.github-icon {
  color: #000;
  &:hover {
    color: #555;
  }
}

.login-button {
  display:flex;
  align-items: center;
  gap:8px;
  font-weight: bold;
  color: #fff !important;
  border: none;
  border-radius: 5px;
  background-color: #BC463A ;
  padding: 6px 12px;
  box-shadow: 0 0 4px rgba( 0, 0, 0, 0.2);

  &:hover {
    background-color: rgba(188, 70, 58, 0.7) !important;
    color: #fff !important;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 4px rgba(188, 70, 58, 0.5);
  }

  .v-icon {
    font-size: 20px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

.v-app-bar {
  box-shadow: none;

  .v-app-bar-title {
    padding-top: 8px;

    img {
      max-height: 50px;
      height: auto;
    }
  }
}

</style>
