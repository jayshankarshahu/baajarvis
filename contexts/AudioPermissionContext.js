import { createContext, useEffect, useState, useCallback } from "react";

export const AudioPermissionContext = createContext();

export const AudioPermissionProvider = function ({ children }) {

    const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);
    const [userAudioStream, setUserAudioStream] = useState(null);

    const getAndSetPermission = useCallback(async () => {

        await navigator.mediaDevices.getUserMedia({ audio: true })
            .then(audioStream => {
                setAudioPermissionGranted(true);
                setUserAudioStream(audioStream);
            })
            .catch(error => {

                if (error.name === 'NotAllowedError') {
                    console.log("Audio not allowed");
                }

                setAudioPermissionGranted(false);
                setUserAudioStream(null);
            });

        return true;

    }, []);

    useEffect(() => {

        let permissionStatus;
        let handleChange;

        // Request audio on initial load
        getAndSetPermission()
            .then(() => {


                navigator.permissions.query({ name: "microphone" })
                    .then(status => {

                        permissionStatus = status;

                        // Handler for permission changes
                        handleChange = () => {

                            if (permissionStatus.state === 'granted') {
                                getAndSetPermission();
                            } else if (permissionStatus.state === 'denied') {
                                setAudioPermissionGranted(false);
                                setUserAudioStream(null);
                            }

                        };

                        permissionStatus.addEventListener('change', handleChange);

                    })
                    .catch(error => {
                        console.error('Error querying microphone permission:', error);
                    });

            })


        // Cleanup listener on unmount
        return () => {
            permissionStatus && handleChange && permissionStatus.removeEventListener('change', handleChange);
        };

    }, []);

    return (

        <AudioPermissionContext value={{
            audioPermissionGranted,
            userAudioStream
        }}>
            {children}
        </AudioPermissionContext>
        
    );

}