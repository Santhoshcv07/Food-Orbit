// src/lib/auth.ts
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserRole, UserProfile } from './types';

// 1. Sign Up and create a Role Document in Firestore
export async function signUpWithRole(email: string, password: string, name: string, role: UserRole, organizationName: string): Promise<UserProfile | null> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user: User = userCredential.user;

    const profile: UserProfile = {
      id: user.uid,
      email: user.email || email,
      name: name,
      role: role,
      organizationName: organizationName,
      createdAt: new Date().toISOString()
    };

    // Save user profile metadata in Firestore under 'users' collection
    await setDoc(doc(db, 'users', user.uid), profile);
    return profile;
  } catch (error: any) {
    console.error("Sign Up Error:", error.message);
    throw error;
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
      return docSnap.data() as UserProfile;
    } else {
      // Fallback if profile doc is missing
      return {
        id: user.uid,
        email: user.email || email,
        name: "Verified User",
        role: "organizer"
      };
    }
  } catch (error: any) {
    console.error("Sign In Error:", error.message);
    throw error;
  }
}

// 3. Sign Out
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error("Sign Out Error:", error.message);
  }
}

// 4. Get Current User Profile Metadata
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  } catch (error) {
    return null;
  }
}