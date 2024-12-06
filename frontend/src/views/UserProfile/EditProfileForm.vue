<template>
  <card>
    <div class="pl-lg-4">
      <form @submit.prevent="handleSubmit">
        <b-row>
          <b-col lg="6">
            <div class="form-group">
              <label for="email">Email address</label>
              <input
                  type="email"
                  id="email"
                  class="form-control"
                  placeholder="mike@email.com"
                  v-model="user.email"
                  required
              />
            </div>
          </b-col>
        </b-row>

        <b-row>
          <b-col lg="6">
            <div class="form-group">
              <label for="first-name">First Name</label>
              <input
                  type="text"
                  id="first-name"
                  class="form-control"
                  placeholder="First Name"
                  v-model="user.firstName"
                  required
              />
            </div>
          </b-col>
          <b-col lg="6">
            <div class="form-group">
              <label for="last-name">Last Name</label>
              <input
                  type="text"
                  id="last-name"
                  class="form-control"
                  placeholder="Last Name"
                  v-model="user.lastName"
                  required
              />
            </div>
          </b-col>
        </b-row>

        <hr class="my-4" />

        <b-row>
          <b-col lg="6">
            <div class="form-group">
              <label for="password">Password</label>
              <input
                  type="password"
                  id="password"
                  class="form-control"
                  placeholder="Enter password"
                  v-model="user.password"
                  required
              />
            </div>
          </b-col>
          <b-col lg="6">
            <div class="form-group">
              <label for="repeat-password">Repeat Password</label>
              <input
                  type="password"
                  id="repeat-password"
                  class="form-control"
                  placeholder="Repeat password"
                  v-model="user.repeatPassword"
                  required
              />
            </div>
          </b-col>
        </b-row>

        <b-row class="mt-4">
          <b-col lg="12" class="text-center">
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </b-col>
        </b-row>
      </form>
    </div>
  </card>
</template>
<script>
export default {
  data() {
    return {
      user: {
        company: 'Creative Code Inc.',
        username: 'michael23',
        email: '',
        firstName: 'Mike',
        lastName: 'Andrew',
        address: 'Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09',
        city: 'New York',
        country: 'USA',
        postalCode: '',
        aboutMe: `Lamborghini Mercy, Your chick she so thirsty, I'm in that two seat Lambo.`
      }
    };
  },
  methods: {
    updateProfile() {
      alert('Your data: ' + JSON.stringify(this.user));
    }
  }
};
</script>
<style></style>
