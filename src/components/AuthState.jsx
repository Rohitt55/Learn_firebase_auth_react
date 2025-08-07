import React, { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from '../firebase/firebase.config';

const AuthState = () => {
    const [user, setUser] = useState(null)

    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {

                console.log( currentUser)
                setUser(currentUser)
            } else {
                console.log("User not found")
            }
        });

        return () => unsubscribe()

    }, [auth])

    return (
        <div>
            {
                user ? <p>Welcome, {user?.email}!</p> : <p>Please login here</p>
            }
        </div>
    )
}

export default AuthState