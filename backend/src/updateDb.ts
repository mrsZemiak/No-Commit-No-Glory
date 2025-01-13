import mongoose from "mongoose";
import Confernce from "./models/Conference";

const updateDatabase = async () => {
  try {
    // Connect to your MongoDB database
    await mongoose.connect("mongodb+srv://sciAdmin:sciAdminPwd123@scisubmit.stdc0.mongodb.net/scisubmit?retryWrites=true&w=majority", {
      dbName: "scisubmit",
    });

    console.log("Connected to the database.");

    // Update all existing documents to include new fields
    const result = await Confernce.updateMany(
      {}, // Match all documents
      {
        $set: {
          date: "", // Default value for 'faculty'
        },
      }
    );

    console.log(`${result.modifiedCount} updated successfully.`);
  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

// Run the script
(async () => {
  try {
    await updateDatabase(); // Ensure the Promise is handled
  } catch (error) {
    console.error("Error running the database update script:", error);
  }
})();