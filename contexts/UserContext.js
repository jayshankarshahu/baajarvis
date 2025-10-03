import { createContext, useState, useEffect } from 'react';
import authVerificationCodes from "@/lib/authVerificationCodes";

// Create the context
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setLoggedIn] = useState(false);

    /**
     * Makes refresh auth token request and returns the response json object
     */
    const refreshAuthToken = async () => {

        console.log("Trying to refresh authtoken");

        try {

            const resp = await fetch('/api/auth/refresh');
            return await resp.json();

        } catch (error) {

            console.log("Error in refreshAuthToken: ", error);
            return {
                success: false,
                errorCode: authVerificationCodes.UNKNOWN_ERROR
            }

        }

    }

    const retrieveAuthTokenData = async (authtoken) => {

        try {

            const resp = await fetch('/api/auth/user', {
                headers: {
                    'Authorization': `Bearer ${authtoken}`
                }
            });
            return await resp.json();

        } catch (error) {

            console.log("Error in retrieveAuthTokenData: ", error);
            return {
                success: false,
                errorCode: authVerificationCodes.UNKNOWN_ERROR
            }

        }

    }

    const login = async () => {

        setLoading(true);

        // try with authtoken first
        let authtoken = localStorage.getItem('AuthToken');

        if (authtoken) {
            
            const { success, data, errorCode } = await retrieveAuthTokenData(authtoken);

            if (success) {

                console.log("Setting user in context" , data);
                setUser(data);
                setLoading(false);
                setLoggedIn(true);
                return true;
                

            } else {
                console.log("Error Retrieving Auth Token Data: ", errorCode);
            }

        }
        
        console.log("Retriving user data didn't work");

        // if authtoken doesn't work it will reach here and try to refresh auth token
        const { success, errorCode, data } = await refreshAuthToken();

        if (success && data) {

            localStorage.setItem('AuthToken', data.authtoken);
            setUser(data.userData);
            setLoading(false);
            setLoggedIn(true);
            return true;

        }

        // if nothing works just logout
        setLoading(false);
        logout();
        return;

    };

    const logout = () => {
        setUser(null);
        setLoggedIn(false);
    };

    useEffect(() => {
        login();
    }, []);

    return (
        <UserContext.Provider value={{
            user,
            login,
            logout,
            loading,
            isLoggedIn
        }}>
            {children}
        </UserContext.Provider>
    );
};
