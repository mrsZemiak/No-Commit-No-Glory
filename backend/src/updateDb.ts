import mongoose from "mongoose";
import User from "./models/User"; // Adjust the path to your User model

const updateDatabase = async () => {
  try {
    // Connect to your MongoDB database
    await mongoose.connect("mongodb+srv://sciAdmin:sciAdminPwd123@scisubmit.stdc0.mongodb.net/scisubmit?retryWrites=true&w=majority", {
      dbName: "scisubmit",
    });

    console.log("Connected to the database.");

    // Update all existing documents to include new fields
    const result = await User.updateMany(
      {}, // Match all documents
      {
        $set: {
          faculty: "", // Default value for 'faculty'
          about: "",   // Default value for 'about'
          avatar: null, // Default value for 'avatar'
        },
      }
    );

    console.log(`${result.modifiedCount} users updated successfully.`);
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