<template>
  <v-app>
  <div class="homepage">
    <!-- Navbar -->
    <Navbar />

    <!-- Banner -->
    <div class="banner-container">
      <div class="banner-overlay"></div>
      <img
        src="@/assets/images/banner.jpg"
        alt="Banner"
        class="banner-image"
      />
      <!-- Logos Section -->
      <div class="logos-section">
        <v-container>
          <v-row justify="space-around" align="center">
            <v-col cols="12" sm="4" md="3" class="logo-item">
              <img src="@/assets/images/umb.png" alt="Logo 1" />
            </v-col>
            <v-col cols="12" sm="4" md="3" class="logo-item">
              <img src="@/assets/images/ukf.png" alt="Logo 2" />
            </v-col>
            <v-col cols="12" sm="4" md="3" class="logo-item">
              <img src="@/assets/images/ucm.png" alt="Logo 3" />
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>

    <div class="event-info-section">
      <v-container>
        <v-row justify="center" align="center">
          <v-col cols="6" class="event-info-item">
            <v-icon left>mdi-calendar</v-icon>
            <span>{{ eventData.date }}</span>
          </v-col>
          <v-col cols="6" class="event-info-item">
            <v-icon left>mdi-map-marker</v-icon>
            <span>{{ eventData.location }}</span>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <TabsSection />

    <div class="call-to-action-section">
    <v-container >
      <h3 class="cta-title">TAK NEVÁHAJTE!</h3>
      <p class="cta-description">
        Zúčastnite sa študentskej vedeckej konferencie, ktorá je súťažnou prehliadkou vedeckých prác študentov.
      </p>
    </v-container>
    </div>

    <CardsSection />
    <Footer />
  </div>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import Navbar from '@/components/homepage/Navbar.vue';
import axios from 'axios'
import TabsSection from '@/components/homepage/TabsSection.vue'
import CardsSection from '@/components/homepage/CardSection.vue'
import Footer from '@/components/homepage/Footer.vue'

export default defineComponent({
  name: 'Homepage',
  components: {
    Footer,
    CardsSection,
    TabsSection,
    Navbar,
  },
  setup() {
    const eventData = ref({
      date: '',
      location: '',
    });

    const getHomepageData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/homepage');
        const ongoingConference = response.data.ongoingConference;

        if (ongoingConference) {
          const rawDate = new Date(ongoingConference.date);

          // Format date as dd.mm.yyyy
          const formattedDate = rawDate.toLocaleDateString('sk-SK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });

          eventData.value = {
            date: formattedDate,
            location: ongoingConference.location,
          };
        } else {
          eventData.value = {
            date: 'No conference date available',
            location: 'No location available',
          };
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
        eventData.value = {
          date: 'Unavailable',
          location: 'Unavailable',
        };
      }
    };

    onMounted(() => {
      getHomepageData();
    });
    return { eventData };
  },
});
</script>

<style lang="scss" scoped>
/* General Styling */
.banner-container {
  position: relative;
  width: 100%;
  height: min(70vh, 400px);
  overflow: hidden;

  @media (min-width: 768px) {
    height: 400px;
  }

  @media (min-width: 1200px) {
    height: 50vh;
  }


  .banner-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
  }

  .banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.3),
        rgba(0, 0, 0, 0.7)
    );
  }

  .logos-section {
    position: absolute;
    bottom: 0;
    width: 100%;
    max-height: 80px;
    background-color: rgba(210, 233, 227, 0.8);
    text-align: center;
    z-index: 3;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .logo-item img {
      max-width: 100%;
      max-height: 50px;
      height: auto;
    }
  }
}

.event-info-section {
  background-color: rgba(16, 100, 102, 0.9);
  color: white;
  text-align: center;


  .event-info-item {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    padding: 2px;

    v-icon {
      margin-right: 8px;
      font-size: 36px;
    }
  }
}

.call-to-action-section {
  background-color: rgba(210, 233, 227, 0.8);
  text-align: center;
  width: 100%;
  max-height: 80px;
  margin-bottom: 30px;

  .cta-title {
    margin-top: -5px;
    font-size: 24px;
    font-weight: bold;
    color: #28655c;

  }

  .cta-description {
    font-size: 18px;
    color: #28655c;
    line-height: 1.2;
  }
}

</style>
