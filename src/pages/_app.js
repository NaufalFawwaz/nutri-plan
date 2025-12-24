import "@/styles/globals.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [showNavbar, setShowNavbar] = useState(false);
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    const noNavbar = ["/login", "/register"];
    const noFooter = ["/login", "/register"];

    setShowNavbar(!noNavbar.includes(router.pathname));
    setShowFooter(!noFooter.includes(router.pathname));
  }, [router.pathname]);

  return (
    <>
      {showNavbar && <Navbar />}
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        {showFooter && <Footer />}
      </div>
    </>
  );
}