import React, { useContext, useEffect } from "react";
import { UserContext } from '../contexts/UserContext';

const google_oauth_url = new URL(process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL);
google_oauth_url.searchParams.append('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
google_oauth_url.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_DOMAIN}${process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL}`);
google_oauth_url.searchParams.append('access_type', 'offline');
google_oauth_url.searchParams.append('response_type', 'code');
google_oauth_url.searchParams.append('scope', `openid email profile`);

const AuthComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="w-full max-w-sm bg-gray-900/90 rounded-xl p-8 shadow-lg flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-white mb-6 tracking-wide">
        Sign In
      </h2>
      <button
        className="w-full py-3 px-4 flex items-center justify-center gap-3 rounded-lg bg-white hover:bg-gray-200 transition-colors text-gray-900 font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
        type="button"
        onClick={() => {
          window.location.replace(`${google_oauth_url.toString()}`);
        }}
      >
        <span>Login with Google</span>
      </button>
    </div>
  </div>
);

function LandingComponent({ user }) {
  return <h1>Hii user , {JSON.stringify(user)}</h1>
}

const Page = () => {

  const userContext = useContext(UserContext);

  const { user, isLoggedIn, login, logout, loading } = userContext;

  if( loading ) {
    return <h1>Please wait..</h1>;
  }

  if (isLoggedIn) {

    return <LandingComponent user={user}></LandingComponent>

  } else {

    return <AuthComponent></AuthComponent>

  }


}

export default Page;