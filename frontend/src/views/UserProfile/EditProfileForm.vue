<template>
  <b-card>
    <div class="pl-lg-4">
      <form @submit.prevent="handleSubmit">
        <!-- First Name and Last Name -->
        <b-row>
          <b-col lg="6">
            <div class="form-group">
              <label for="first-name">Meno</label>
              <input
                type="text"
                id="first-name"
                class="form-control"
                placeholder="Meno"
                v-model="formData.first_name"
                required
              />
            </div>
          </b-col>
          <b-col lg="6">
            <div class="form-group">
              <label for="last-name">Priezvisko</label>
              <input
                type="text"
                id="last-name"
                class="form-control"
                placeholder="Priezvisko"
                v-model="formData.last_name"
                required
              />
            </div>
          </b-col>
        </b-row>

        <b-row>
          <b-col lg="6">
            <div class="form-group">
              <label for="university">Univerzita</label>
              <select
                id="university"
                class="form-control"
                v-model="formData.university"
                required
              >
                <option value="" disabled selected>Vyberte univerzitu</option>
                <option value="UKF">UKF</option>
                <option value="UMB">UMB</option>
                <option value="UCM">UCM</option>
              </select>
            </div>
          </b-col>
        </b-row>

        <hr class="my-4" />

        <b-row>
          <b-col lg="6">
            <div class="form-group">
              <label for="password">Heslo</label>
              <input
                type="password"
                id="password"
                class="form-control"
                placeholder="Zadajte heslo"
                v-model="formData.password"
                @input="validatePassword"
              />
            </div>
          </b-col>
          <b-col lg="6">
            <div class="form-group">
              <label for="repeat-password">Potvrďte heslo</label>
              <input
                type="password"
                id="repeat-password"
                class="form-control"
                placeholder="Zadajte heslo znovu"
                v-model="formData.repeatPassword"
                @input="validatePassword"
              />
              <small v-if="passwordError" class="text-danger">{{ passwordError }}</small>
            </div>
          </b-col>
        </b-row>

        <b-row class="mt-4">
          <b-col lg="12" class="text-center">
            <button type="submit" class="btn btn-primary" :disabled="passwordError">Uložiť zmeny</button>
          </b-col>
        </b-row>
      </form>
    </div>
  </b-card>
</template>

<script>
export default {
  props: {
    profile: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      formData: {
        first_name: this.profile.first_name,
        last_name: this.profile.last_name,
        university: this.profile.university,
        password: "",
        repeatPassword: "",
      },
      passwordError: null,
    };
  },
  watch: {
    profile: {
      handler(newProfile) {
        this.formData = {
          first_name: newProfile.first_name,
          last_name: newProfile.last_name,
          university: newProfile.university,
          password: "",
          repeatPassword: "",
        };
      },
      immediate: true,
    },
  },
  methods: {
    validatePassword() {
      if (this.formData.password && this.formData.repeatPassword) {
        if (this.formData.password !== this.formData.repeatPassword) {
          this.passwordError = "Heslá sa nezhodujú.";
        } else {
          this.passwordError = null;
        }
      } else {
        this.passwordError = null;
      }
    },
    handleSubmit() {
      const {password, repeatPassword, ...updateData} = this.formData;

      if (password && password !== repeatPassword) {
        this.passwordError = "Heslá sa nezhodujú.";
        return;
      }

      if (password) {
        updateData.password = password;
      }
      this.$emit("update", updateData);

      this.formData.password = "";
      this.formData.repeatPassword = "";
    },
  },
};
</script>


<style scoped>

</style>
