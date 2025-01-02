<template>
  <b-card>
    <div class="pl-lg-4">
      <form @submit.prevent="handleSubmit">
        <b-row>
          <b-col lg="6">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                class="form-control"
                placeholder="email@email.com"
                v-model="profile.email"
                required
              />
            </div>
          </b-col>
        </b-row>

        <b-row>
          <b-col lg="6">
            <div class="form-group">
              <label for="first-name">Meno</label>
              <input
                type="text"
                id="first-name"
                class="form-control"
                placeholder="Meno"
                v-model="profile.firstName"
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
                v-model="profile.lastName"
                required
              />
            </div>
          </b-col>
        </b-row>

        <hr class="my-4" />

        <b-row>
          <b-col lg="6">
            <div class="form-group">
              <label for="position">Univerzita</label>
              <input
                type="text"
                id="position"
                class="form-control"
                placeholder="Vaša pozícia"
                v-model="profile.university"
                required
              />
            </div>
          </b-col>
          <b-col lg="6">
            <div class="form-group">
              <label for="about-me">O mne</label>
              <textarea
                id="about-me"
                class="form-control"
                rows="4"
                placeholder="Povedzte nám o sebe"
                v-model="profile.aboutMe"
                required
              ></textarea>
            </div>
          </b-col>
        </b-row>

        <b-row class="mt-4">
          <b-col lg="12" class="text-center">
            <button type="submit" class="btn btn-primary">Uložiť zmeny</button>
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
      required: true
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('update', this.profile);
    }
  }
};
</script>

<style scoped>

</style>
