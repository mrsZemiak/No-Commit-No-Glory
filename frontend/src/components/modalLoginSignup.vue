<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: "modalLoginSignup",
  setup() {

    const activeTab = ref('login');


    const setActiveTab = (tab: string) => {
      activeTab.value = tab;
    };


    const isActiveTab = (tab: string) => {
      return activeTab.value === tab;
    };

    return {
      setActiveTab,
      isActiveTab,
    };
  },
});
</script>

<template>

  <ul class="nav nav-pills nav-justified m-4" id="ex1" role="tablist">
    <li class="nav-item" role="presentation">
      <a
        class="nav-link"
        :class="{'active': isActiveTab('login')}"
        id="tab-login"
        href="#pills-login"
        role="tab"
        aria-controls="pills-login"
        aria-selected="true"
        @click.prevent="setActiveTab('login')">Prihlásiť sa</a>
    </li>
    <li class="nav-item" role="presentation">
      <a
        class="nav-link"
        :class="{'active': isActiveTab('register')}"
        id="tab-register"
        href="#pills-register"
        role="tab"
        aria-controls="pills-register"
        aria-selected="false"
        @click.prevent="setActiveTab('register')">Zaregistrovať sa</a>
    </li>
  </ul>



  <div class="tab-content">
    <div v-show="isActiveTab('login')" class="tab-pane fade show active" id="pills-login" role="tabpanel" aria-labelledby="tab-login">
      <form>


        <div data-mdb-input-init class="form-outline mb-4">
          <input type="email" id="loginName" class="form-control" />
          <label class="form-label" for="loginName">Email</label>
        </div>

        <div data-mdb-input-init class="form-outline mb-4">
          <input type="password" id="loginPassword" class="form-control" />
          <label class="form-label" for="loginPassword">Heslo</label>
        </div>



          <div class="float-end">

            <a href="#!">Zabudnuté heslo?</a>
          </div>


        <button type="submit" data-mdb-button-init data-mdb-ripple-init class="btn btn-primary btn-block mb-4">Prihlásiť sa</button>

      </form>
    </div>

    <!-- registracia -->
    <div v-show="isActiveTab('register')" class="tab-pane fade show active" id="pills-register" role="tabpanel" aria-labelledby="tab-register">
      <form>

        <div data-mdb-input-init class="form-outline mb-4">
          <input type="text" id="registerFirstName" class="form-control" />
          <label class="form-label" for="registerFirstName">Meno</label>
        </div>


        <div data-mdb-input-init class="form-outline mb-4">
          <input type="text" id="registerLastName" class="form-control" />
          <label class="form-label" for="registerLastName">Priezvisko</label>
        </div>


        <div data-mdb-input-init class="form-outline mb-4">
          <input type="email" id="registerEmail" class="form-control" />
          <label class="form-label" for="registerEmail">Email</label>
        </div>


        <div data-mdb-input-init class="form-outline mb-4">
          <input type="password" id="registerPassword" class="form-control" />
          <label class="form-label" for="registerPassword">Heslo</label>
        </div>


        <div data-mdb-input-init class="form-outline mb-4">
          <input type="password" id="registerRepeatPassword" class="form-control" />
          <label class="form-label" for="registerRepeatPassword">Zopakujte heslo</label>
        </div>




        <button type="submit" data-mdb-button-init data-mdb-ripple-init class="btn btn-primary btn-block mb-3">Registrovať sa</button>
      </form>
    </div>
  </div>

</template>

<style scoped>
.nav-link.active {
  background-color: #007bff;
  color: white;
}
</style>
