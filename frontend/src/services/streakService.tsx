import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Updates or initializes the user's daily continuous login streak in Firestore.
 * @param uid The authenticated user's unique ID
 * @returns The updated streak number
 */
export const updateUserStreak = async (uid: string): Promise<number> => {
  const userRef = doc(db, "users", uid);
  
  // Generate YYYY-MM-DD based strictly on the user's LOCAL calendar date, not UTC.
  // This guarantees that past midnight local time correctly transitions into the next day tracking index.
  const todayStr = new Date().toLocaleDateString('sv-SE'); 

  try {
    const userSnap = await getDoc(userRef);
    
    let currentStreak = 1;
    let lastLoginDate = "";

    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.currentStreak !== undefined) currentStreak = data.currentStreak;
      if (data.lastLoginDate !== undefined) lastLoginDate = data.lastLoginDate;
    }

    // If they haven't logged in today yet, check the streak history
    if (lastLoginDate !== todayStr) {
      if (lastLoginDate) {
        // Create local date instances by appending midnight time parameters.
        // This avoids variations in UTC offset interpolation when calculating mathematical day gaps.
        const lastLogin = new Date(`${lastLoginDate}T00:00:00`);
        const today = new Date(`${todayStr}T00:00:00`);
        
        // Calculate the difference in absolute days
        const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // Changed to round for pristine day integers

        if (diffDays === 1) {
          // Logged in on consecutive days! Increment streak.
          currentStreak += 1;
        } else if (diffDays > 1) {
          // Chain broken. Reset back to day 1.
          currentStreak = 1;
        }
      } else {
        // Fallback for missing string fields
        currentStreak = 1;
      }

      // Update calculations in the database
      await setDoc(userRef, {
        currentStreak,
        lastLoginDate: todayStr
      }, { merge: true });
    }

    return currentStreak;
  } catch (error) {
    console.error("Failed to sync login streak data:", error);
    return 1; // Safe fallback value
  }
};