import "@/styles/globals.css";
import { UserProvider } from '@/contexts/UserContext';
import { AudioPermissionProvider } from '@/contexts/AudioPermissionContext';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {

  const router = useRouter();

  let childOfUserProvider;

  if( router.pathname == '/chat' ) {

    childOfUserProvider = <AudioPermissionProvider>
      <Component {...pageProps} />
    </AudioPermissionProvider>;

  } else {
    childOfUserProvider = <Component {...pageProps} />;
  }


  return (
    <UserProvider>
      
      {childOfUserProvider}
      
    </UserProvider>
  );
}
