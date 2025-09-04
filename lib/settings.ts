interface UserSettings {
    displayName: string;
    defaultTemplate: string;
}

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const defaultSettings: UserSettings = {
  displayName: "",
  defaultTemplate: "modern",
};

export async function getUserSettings(email: string): Promise<UserSettings> {
  try {
    const docRef = doc(db, "users", email, "settings", "preferences");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserSettings;
    }
    return defaultSettings;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return defaultSettings;
  }
}

export async function saveUserSettings(email: string, settings: UserSettings): Promise<void> {
  try {
    const docRef = doc(db, "users", email, "settings", "preferences");
    await setDoc(docRef, settings);
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving user settings:", error);
    throw error;
  }
}