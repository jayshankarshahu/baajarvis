"use client";

import { useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { UserContext } from "../contexts/UserContext";

const useAuthGuard = () => {

  const router = useRouter();
  const { isLoggedIn } = useContext(UserContext);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

};

export default useAuthGuard;
