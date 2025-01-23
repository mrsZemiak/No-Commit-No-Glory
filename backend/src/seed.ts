import dotenv from "dotenv";
import Role from "./models/Role";
import Category from "./models/Category";
import User from "./models/User";
import Conference from "./models/Conference";
import Paper from "./models/Paper";
import Review from "./models/Review";
import Question from "./models/Question";
import Database from "./config/db";
import mongoose from "mongoose";

dotenv.config();

const SEED_LOG_COLLECTION = "seeding_log";

// Function to check if seeding has already been performed
const hasAlreadySeeded = async (): Promise<boolean> => {
  const connection = Database.getInstance().getConnection();
  const log = await connection
    .collection(SEED_LOG_COLLECTION)
    .findOne({ seedName: "initialSeed" });
  return !!log; // Returns true if the log exists
};

// Function to mark seeding as complete
const markAsSeeded = async (): Promise<void> => {
  const connection = Database.getInstance().getConnection();
  await connection
    .collection(SEED_LOG_COLLECTION)
    .insertOne({ seedName: "initialSeed", date: new Date() });
};

const prepareDatabase = async () => {
  try {
    const db = Database.getInstance();
    await db.connect();
    console.log("Connected to MongoDB.");

    // Check if seeding has already been performed
    if (await hasAlreadySeeded()) {
      console.log("Database already seeded. Skipping...");
      return;
    }

    console.log("Seeding database...");

    // Insert roles
    await Role.insertMany([
      {
        name: "admin",
        permissions: [
          "manage_users",
          "create_conferences",
          "create_categories",
          "assign_reviewers",
          "view_all_papers",
          "view_reports",
        ],
        ui_components: [
          "/admin_dashboard",
          "/users",
          "/categories",
          "/conferences",
          "/reports",
          "/profile",
        ],
      },
      {
        name: "participant",
        permissions: [
          "manage_papers",
          "submit_paper",
          "edit_paper",
          "view_reviews",
        ],
        ui_components: ["/participant_dashboard", "/upload_paper", "/profile"],
      },
      {
        name: "reviewer",
        permissions: [
          "view_assigned_papers",
          "submit_reviews",
          "download_papers",
        ],
        ui_components: ["/reviewer_dashboard", "/paper_reviews", "/profile"],
      },
    ]);

    console.log("Roles inserted successfully.");

    // Insert categories
    await Category.insertMany([
      { name: "Biológia, ekológia a environmentalistika" },
      { name: "Geografia a regionálny rozvoj a geológia" },
      { name: "Informatika" },
      { name: "Chémia, fyzika a matematika" },
      { name: "Odborová didaktika" },
      { name: "PhD" },
    ]);

    // Initialize empty collections without data and ensure they exist
    await User.createCollection();
    await Conference.createCollection();
    await Paper.createCollection();
    await Review.createCollection();
    await Question.insertMany([
      {
        text: "Aktuálnosť a náročnosť práce.",
        type: "rating",
        options: { min: 1, max: 6 },
        category: "Obsah práce",
      },
      {
        text: "Zorientovanie sa študenta v danej problematike prostredníctvom analýzou domácej a zahraničnej literatúry.",
        type: "rating",
        options: { min: 1, max: 6 },
        category: "Obsah práce",
      },
      {
        text: "Vhodnosť zvolených metód spracovania riešenej problematiky.",
        type: "rating",
        options: { min: 1, max: 6 },
        category: "Obsah práce",
      },
      {
        text: "Rozsah a úroveň dosiahnutých výsledkov.",
        type: "rating",
        options: { min: 1, max: 6 },
        category: "Obsah práce",
      },
      {
        text: "Analýza a interpretácia výsledkov a formulácia záverov práce.",
        type: "rating",
        options: { min: 1, max: 6 },
        category: "Obsah práce",
      },
      {
        text: "Prehľadnosť a logická štruktúra práce.",
        type: "rating",
        options: { min: 1, max: 6 },
        category: "Štruktúra práce",
      },
      {
        text: "Formálna, jazyková a štylistická úroveň práce.",
        type: "rating",
        options: { min: 1, max: 6 },
        category: "Štruktúra práce",
      },
      {
        text: "Práca zodpovedá šablóne určenej pre ŠVK.",
        type: "yes_no",
        category: "Dodržiavanie pravidiel",
      },
      {
        text: "Chýba názov práce v slovenskom alebo anglickom jazyku.",
        type: "yes_no",
        category: "Dodržiavanie pravidiel",
      },
      {
        text: "Chýba meno autora alebo školiteľa.",
        type: "yes_no",
        category: "Dodržiavanie pravidiel",
      },
      {
        text: "Chýba pracovná emailová adresa autora alebo školiteľa.",
        type: "yes_no",
        category: "Dodržiavanie pravidiel",
      },
      {
        text: "Chýba abstrakt v slovenskom alebo anglickom jazyku.",
        type: "yes_no",
        category: "Dodržiavanie pravidiel",
      },
      {
        text: "Abstrakt nespĺňa rozsah 100–150 slov.",
        type: "yes_no",
        category: "Dodržiavanie pravidiel",
      },
      {
        text: "Chýbajú kľúčové slová v slovenskom alebo anglickom jazyku.",
        type: "yes_no",
        category: "Dodržiavanie pravidiel",
      },
      {
        text: "Chýba „Úvod“, „Výsledky a diskusia“ alebo „Záver“.",
        type: "yes_no",
        category: "Dodržiavanie pravidiel",
      },
      {
        text: "Nie sú uvedené zdroje a použitá literatúra.",
        type: "yes_no",
        category: "Dodržiavanie pravidiel",
      },
      {
        text: "V texte chýbajú referencie na zoznam bibliografie.",
        type: "yes_no",
        category: "Dodržiavanie pravidiel",
      },
      {
        text: "V texte chýbajú referencie na použité obrázky a/alebo tabuľky.",
        type: "yes_no",
        category: "Dodržiavanie pravidiel",
      },
      {
        text: "Obrázkom a/alebo tabuľkám chýba popis.",
        type: "yes_no",
        category: "Dodržiavanie pravidiel",
      },
      {
        text: "Prínos (silné stránky) práce.",
        type: "text",
        category: "Hodnotenie",
      },
      {
        text: "Nedostatky (slabé stránky) práce.",
        type: "text",
        category: "Hodnotenie",
      },
    ]);

    console.log("Questions inserted successfully.");

    console.log("Database preparation complete.");

    // Mark as seeded
    await markAsSeeded();
    console.log("Seeding marked as complete.");

    // Disconnect from the database
    await mongoose.disconnect();

    // Exit the script successfully
    process.exit(0);
  } catch (error) {
    console.error("Error preparing the database", error);
    process.exit(1);
  }
};

// IIFE to handle the async prepareDatabase function
(async () => {
  try {
    await prepareDatabase();
    console.log("Database prepared successfully.");
  } catch (error) {
    console.error("Error in preparing the database:", error);
  }
})();
