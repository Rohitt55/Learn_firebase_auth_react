/* eslint-disable react-refresh/only-export-components */
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from "../firebase/firebase.config";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const auth = getAuth(app);
const db = getFirestore();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          setRole(snap.exists() ? snap.data().role : null);
        } catch (e) {
          console.error("Failed to load role:", e);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateUserProfile = async (newProfile) => {
    if (!user) throw new Error("No user is currently signed in.");
    await updateProfile(user, newProfile);
    setUser((prev) => ({ ...prev, ...newProfile }));
  };

  const value = { user, currentUser: user, role, loading, updateUserProfile };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
