// src/lib/auth.ts
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  deleteUser,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserRole, UserProfile } from './types';

// 1. Sign Up and create a Role Document in Firestore
export async function signUpWithRole(email: string, password: string, name: string, role: UserRole, organizationName: string): Promise<UserProfile | null> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user: User = userCredential.user;

    console.log("AUTH USER:", user);
    console.log("UID:", user.uid);
    console.log("EMAIL:", user.email);
    console.log("ROLE:", role);
    console.log("CREATING PROFILE...");

    const profile: UserProfile = {
      id: user.uid,
      email: user.email || email,
      name: name,
      role: role,
      organizationName: organizationName,
      createdAt: new Date().toISOString()
    };

    try {
      // Save user profile metadata in Firestore under 'users' collection
      await setDoc(doc(db, 'users', user.uid), profile);
      console.log("PROFILE CREATED");
      return profile;
    } catch (dbError: any) {
      console.error("Firestore Profile Creation Error:", dbError);
      
      // Phase 2: Orphan Cleanup
      // If Firestore fails, we MUST delete the Auth account to prevent orphaned logins.
      try {
        await deleteUser(user);
        console.log("Orphaned Auth account successfully deleted.");
      } catch (deleteErr) {
        console.error("Failed to delete orphaned Auth account:", deleteErr);
      }

      if (dbError?.message?.includes("Missing or insufficient permissions") || dbError?.code === 'permission-denied') {
        throw new Error("Your account profile could not be loaded. Please contact support.");
      }
      throw new Error("Your account profile could not be loaded. Please contact support.");
    }
  } catch (error: any) {
    if (error?.code === 'auth/email-already-in-use') {
      throw new Error("This email is already registered. Please sign in instead.");
    }
    // Pass our custom messages through, otherwise log
    if (error instanceof Error) {
      console.error("Sign Up Error:", error.message);
      throw error;
    }
    throw new Error("Authentication failed.");
  }
}

// 2. Sign In and fetch Role Document from Firestore
export async function signIn(email: string, password: string): Promise<UserProfile | null> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user: User = userCredential.user;

    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("LOGIN SUCCESS");
      return docSnap.data() as UserProfile;
    } else {
      // Phase 5: Profile Recovery
      console.log("Missing Firestore Profile. Attempting recovery...");
      const recoveredProfile: UserProfile = {
        id: user.uid,
        email: user.email || email,
        name: "Recovered User",
        role: "organizer", // Default safe fallback
        organizationName: "Unknown Organization",
        createdAt: new Date().toISOString()
      };
      
      try {
        await setDoc(docRef, recoveredProfile);
        console.log("PROFILE RECOVERED");
        console.log("LOGIN SUCCESS");
        return recoveredProfile;
      } catch (recoveryErr) {
        console.error("Profile recovery failed:", recoveryErr);
        throw new Error("Your account profile could not be loaded. Please contact support.");
      }
    }
  } catch (error: any) {
    console.error("Sign In Error Raw:", error);
    
    // Phase 3 & 7: Login Error UX mapping
    if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password') {
      throw new Error("Invalid email or password.");
    }
    if (error?.code === 'auth/user-not-found') {
      throw new Error("No account found.");
    }
    if (error?.code === 'auth/too-many-requests') {
      throw new Error("Too many attempts. Please wait.");
    }
    
    // If it's our custom error, throw it directly
    if (error instanceof Error && !error.message.includes('Firebase:')) {
      throw error;
    }
    
    throw new Error("Authentication failed. Please try again.");
  }
}

// 3. Sign Out
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: unknown) {
    if (error instanceof Error) console.error("Sign Out Error:", error.message);
  }
}

// 4. Get Current User Profile Metadata
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  } catch {
    return null;
  }
}