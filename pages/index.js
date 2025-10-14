import React, { useContext, useEffect } from "react";
import { UserContext } from '../lib/contexts/UserContext';
import { useRouter } from 'next/router';
import { FaRegUserCircle } from "react-icons/fa";

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

  const {
    firstName,
    lastName,
    email,
    profilePictureUrl
  } = user || {};
  
  return <div className="flex items-center gap-4 p-4 bg-neutral-900 rounded-lg shadow-lg w-full max-w-sm">
    {profilePictureUrl ? (
      <img
        src={profilePictureUrl}
        alt={`${firstName} ${lastName}`}
        className="w-16 h-16 rounded-full object-cover border-2 border-neutral-700"
      />
    ) : (
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-neutral-800 border-2 border-neutral-700">
        <FaRegUserCircle className="text-3xl text-neutral-500" />
      </div>
    )}
    <div className="flex flex-col">
      <span className="text-white text-lg font-semibold leading-tight">{firstName} {lastName}</span>
      <span className="text-neutral-400 text-sm mt-1">{email}</span>
    </div>
  </div>;

}

const Page = () => {

  const userContext = useContext(UserContext);
  const router = useRouter();

  const { user, isLoggedIn, login, logout, loading } = userContext;

  useEffect(() => {

    if( !loading && !isLoggedIn ) {
        router.push(`/login?returnUrl${router.asPath}`);
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