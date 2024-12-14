<template>
  <div class="submission-form">
    <h2>Hodnotenie pre ID: {{ id }}</h2>
    <form @submit.prevent="handleSubmit">

      <!-- Prejdenie vsetkych otazok -->
      <div v-for="(question, index) in questions" :key="index" class="form-group">

        <label :for="'question-' + index">{{ question.text }}</label>

        <!-- Rendering na zaklade typu hodnotenia -->
        <div v-if="question.type === 'rating'">
          <select
              :id="'question-' + index"
              v-model="form[question.text]"
              required
          >
            <option disabled value="">Vyberte hodnotenie</option>
            <option v-for="option in getRange(question.options)" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <div v-if="question.type === 'yes_no'">
          <label>
            <input
                type="radio"
                :name="'question-' + index"
                v-model="form[question.text]"
                value="yes"
            />
            Áno
          </label>
          <label>
            <input
                type="radio"
                :name="'question-' + index"
                v-model="form[question.text]"
                value="no"
            />
            Nie
          </label>
        </div>

        <div v-if="question.type === 'text'">
          <textarea
              :id="'question-' + index"
              v-model="form[question.text]"
              placeholder="Vložiť odpoveď"
              rows="3"
              required
          ></textarea>
        </div>

      </div>

      <button type="submit">Odovzdať</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

interface Question {
  text: string;
  type: 'rating' | 'yes_no' | 'text';
  options?: { min: number; max: number };
  category: string;
}
export default defineComponent({
  name: 'ReviewForm',
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      questions: [
        {
          text: 'Aktuálnosť a náročnosť práce.',
          type: 'rating',
          options: { min: 1, max: 6 },
          category: 'Obsah práce',
        },
        {
          text: 'Zorientovanie sa študenta v danej problematike prostredníctvom analýzou domácej a zahraničnej literatúry.',
          type: 'rating',
          options: { min: 1, max: 6 },
          category: 'Obsah práce',
        },
        {
          text: 'Vhodnosť zvolených metód spracovania riešenej problematiky.',
          type: 'rating',
          options: { min: 1, max: 6 },
          category: 'Obsah práce',
        },
        {
          text: 'Rozsah a úroveň dosiahnutých výsledkov.',
          type: 'rating',
          options: { min: 1, max: 6 },
          category: 'Obsah práce',
        },
        {
          text: 'Analýza a interpretácia výsledkov a formulácia záverov práce.',
          type: 'rating',
          options: { min: 1, max: 6 },
          category: 'Obsah práce',
        },
        {
          text: 'Prehľadnosť a logická štruktúra práce.',
          type: 'rating',
          options: { min: 1, max: 6 },
          category: 'Štruktúra práce',
        },
        {
          text: 'Formálna, jazyková a štylistická úroveň práce.',
          type: 'rating',
          options: { min: 1, max: 6 },
          category: 'Štruktúra práce',
        },
        {
          text: 'Práca zodpovedá šablóne určenej pre ŠVK.',
          type: 'yes_no',
          category: 'Dodržiavanie pravidiel',
        },
        {
          text: 'Chýba názov práce v slovenskom alebo anglickom jazyku.',
          type: 'yes_no',
          category: 'Dodržiavanie pravidiel',
        },
        {
          text: 'Chýba meno autora alebo školiteľa.',
          type: 'yes_no',
          category: 'Dodržiavanie pravidiel',
        },
        {
          text: 'Chýba pracovná emailová adresa autora alebo školiteľa.',
          type: 'yes_no',
          category: 'Dodržiavanie pravidiel',
        },
        {
          text: 'Chýba abstrakt v slovenskom alebo anglickom jazyku.',
          type: 'yes_no',
          category: 'Dodržiavanie pravidiel',
        },
        {
          text: 'Abstrakt nespĺňa rozsah 100–150 slov.',
          type: 'yes_no',
          category: 'Dodržiavanie pravidiel',
        },
        {
          text: 'Chýbajú kľúčové slová v slovenskom alebo anglickom jazyku.',
          type: 'yes_no',
          category: 'Dodržiavanie pravidiel',
        },
        {
          text: 'Chýba „Úvod“, „Výsledky a diskusia“ alebo „Záver“.',
          type: 'yes_no',
          category: 'Dodržiavanie pravidiel',
        },
        {
          text: 'Nie sú uvedené zdroje a použitá literatúra.',
          type: 'yes_no',
          category: 'Dodržiavanie pravidiel',
        },
        {
          text: 'V texte chýbajú referencie na zoznam bibliografie.',
          type: 'yes_no',
          category: 'Dodržiavanie pravidiel',
        },
        {
          text: 'V texte chýbajú referencie na použité obrázky a/alebo tabuľky.',
          type: 'yes_no',
          category: 'Dodržiavanie pravidiel',
        },
        {
          text: 'Obrázkom a/alebo tabuľkám chýba popis.',
          type: 'yes_no',
          category: 'Dodržiavanie pravidiel',
        },
        {
          text: 'Prínos (silné stránky) práce.',
          type: 'text',
          category: 'Hodnotenie',
        },
        {
          text: 'Nedostatky (slabé stránky) práce.',
          type: 'text',
          category: 'Hodnotenie',
        },
      ]as Question[],
      form: {} as Record<string, string | number>, // Form data model
    };
  },
  methods: {
    getRange(options: { min: number; max: number } | undefined): number[] {
      // Handle undefined options gracefully
      if (!options) {
        return []; // or throw an error if options are critical
      }

      const range: number[] = [];
      for (let i = options.min; i <= options.max; i++) {
        range.push(i);
      }
      return range;
    },
    handleSubmit() {
      console.log('Form submitted:', this.form);
      alert('Form submitted successfully!');
      this.form = {};
    },
  }
});
</script>

<style>




</style>
