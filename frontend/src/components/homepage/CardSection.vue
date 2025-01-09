<template>
  <v-container class="cards-section">
    <v-row justify="space-between">
      <!-- Card 1 -->
      <v-col cols="12" sm="4" class="card-item">
        <v-card>
          <v-card-title>
            <v-icon class="card-icon" left>mdi-file-document-outline</v-icon>
            POKYNY PRE AUTOROV
          </v-card-title>
          <v-card-text>
            Konferencia je určená pre študentov, alebo kolektívy študentov 1., 2. a 3. stupňa vysokoškolského štúdia pod vedením školiteľa.
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="openModal('authorInstructions')">Podrobnosti</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Card 2 -->
      <v-col cols="12" sm="4" class="card-item">
        <v-card>
          <v-card-title>
            <v-icon class="card-icon" left>mdi-account-group-outline</v-icon>
            VÝBORY KONFERENCIE
          </v-card-title>
          <v-card-text>
            Zoznámte sa s odbornými výbormi konferencie z univerzít, ktoré sa podieľajú na organizácii a hodnotení prác.
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="openModal('conferenceCommittees')">Podrobnosti</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Card 3 -->
      <v-col cols="12" sm="4" class="card-item">
        <v-card>
          <v-card-title>
            <v-icon class="card-icon" left>mdi-clock-outline</v-icon>
            PREDCHÁDZAJÚCE ROČNÍKY
          </v-card-title>
          <v-card-text>
            Objavte úspechy a zaujímavé práce z predchádzajúcich ročníkov konferencie.
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="openModal('pastEditions')">Podrobnosti</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modals -->
    <v-dialog v-model="modal.authorInstructions" max-width="500px">
      <v-card>
        <v-card-title>Pokyny pre autorov</v-card-title>
        <v-card-text>
          Tu sú detailné informácie o pokynoch pre autorov...
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="closeModal('authorInstructions')">Zatvoriť</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="modal.conferenceCommittees" max-width="500px">
      <v-card>
        <v-card-title>Výbory konferencie</v-card-title>
        <v-card-text>
          Tu sú detailné informácie o výboroch konferencie...
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="closeModal('conferenceCommittees')">Zatvoriť</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="modal.pastEditions" max-width="500px">
      <v-card>
        <v-card-title>Predchádzajúce ročníky</v-card-title>
        <v-card-text>
          Tu sú detailné informácie o predchádzajúcich ročníkoch konferencie...
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="closeModal('pastEditions')">Zatvoriť</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';

export default defineComponent({
  name: 'CardsSection',
  setup() {
    const modal = reactive({
      authorInstructions: false,
      conferenceCommittees: false,
      pastEditions: false,
    });

    const openModal = (modalName: keyof typeof modal) => {
      modal[modalName] = true;
    };

    const closeModal = (modalName: keyof typeof modal) => {
      modal[modalName] = false;
    };

    return {
      modal,
      openModal,
      closeModal,
    };
  },
});
</script>

<style lang="scss" scoped>

.cards-section {
  margin-top: 20px;
  margin-bottom: 20px;

  .v-card {
    background-color: #f7f7f7 !important;
    color: #444;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    min-height: 200px;

    .v-card-title {
      margin-bottom: 10px !important;
      margin-top: 10px;
    }

    .v-card-text {
      padding: 10px;
      max-width: 300px;
      text-align: justify;
    }
  }


  .card-item {
    margin-bottom: 20px;
  }

  .card-icon {
    margin-right: 10px;
    color: #28655c; /* Dark green color */
  }


  v-btn {
    background-color: #bc463a;
    color: white;
    &:hover {
      background-color: #922e25;
    }
  }
}
</style>
