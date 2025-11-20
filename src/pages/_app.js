// src/pages/_app.js
import "@/styles/globals.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const noNavbar = ["/login", "/register"];
    setShowNavbar(!noNavbar.includes(router.pathname));
  }, [router.pathname]);

  return (
    <>
      {showNavbar && <Navbar />}
      <Component {...pageProps} />
    </>
  );
}