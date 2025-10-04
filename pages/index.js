import React, { useContext, useEffect } from "react";
import { UserContext } from '../contexts/UserContext';
import { useRouter } from 'next/router';

const google_oauth_url = new URL(process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL);
google_oauth_url.searchParams.append('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
google_oauth_url.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_DOMAIN}${process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL}`);
google_oauth_url.searchParams.append('access_type', 'offline');
google_oauth_url.searchParams.append('response_type', 'code');
google_oauth_url.searchParams.append('scope', `openid email profile`);

const AuthComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="w-full max-w-sm bg-gray-900/90 rounded-xl p-8 shadow-lg flex flex-col items-center">
        Sending you to login page...
    </div>
  </div>
);

function LandingComponent({ user }) {
  return <h1>Hii user , {JSON.stringify(user)}</h1>
}

const Page = () => {

  const userContext = useContext(UserContext);
  const router = useRouter();

  const { user, isLoggedIn, login, logout, loading } = userContext;

  useEffect(() => {

    if( !loading && !isLoggedIn ) {
        router.push(`/login?${router.asPath}`);
    }

  }, [isLoggedIn, loading, router]);

  if (loading) {
    return <h1>Please wait..</h1>;
  }


  if (isLoggedIn) {

    return <LandingComponent user={user}></LandingComponent>

  } else {

    return <AuthComponent />;

  }


}

export default Page;