import { useContext, useEffect , Suspense} from "react";
import { UserContext } from '@/contexts/UserContext';
import { useRouter } from 'next/router';
import { AudioPermissionContext } from "@/contexts/AudioPermissionContext";
import AudioMorphingMesh from "../_3d/components/AudioMorphingMesh";
import { Canvas, useFrame } from '@react-three/fiber'
import BasicMorphingSphere from "../_3d/components/BasicMorphingSphere";
import MorphingSphere from "../_3d/components/MorphinSphere";

function AudioChat({ user }) {

    const { audioPermissionGranted, userAudioStream } = useContext(AudioPermissionContext);

    if (!audioPermissionGranted) {
        return <MicPermissionPrompt />;
    }

    return <NewChatGreeting userAudioStream={userAudioStream} />;

}



function NewChatGreeting({ userAudioStream }) {

    // return <h1>Hii {user.firstName} , How can I help you today? </h1>;

    return <Canvas shadows style={{ width: '100%', height: '100vh' }}>
        <Suspense fallback={null}>

            <MorphingSphere />
        </Suspense>
    </Canvas>;

}

function MicPermissionPrompt() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90">
            <div className="relative w-80 p-6 border border-gray-700 rounded-lg shadow-lg text-white font-sans text-center">
                <p className="text-base leading-relaxed">
                    Please grant microphone permission to continue.
                </p>
            </div>
        </div>
    );
}

function Page() {

    const userContext = useContext(UserContext);
    const router = useRouter();

    const { user, isLoggedIn, loading: userLoading } = userContext;

    useEffect(() => {

        if (!userLoading && !isLoggedIn) {
            router.push(`/login?${router.asPath}`);
        }

    }, [isLoggedIn, userLoading, router]);

    if (userLoading) {
        return <h1>Authenticating...</h1>;
    }

    return <AudioChat user={user} />;

}

export default Page;