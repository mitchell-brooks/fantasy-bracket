// ABOUTME: Root layout with custom fonts, Supabase auth provider, and app shell
// ABOUTME: Wraps all pages with SupabaseProvider, auth listener, header, and grid layout
import "server-only";

import "./theme.css";
import "./globals.css";
import styles from "./layout.module.css";

import localFont from "next/font/local";
import { Quicksand, Playfair_Display, Lora, DM_Serif_Display, Bitter } from "next/font/google";

import SupabaseListener from "@/components/supabase-listener";
import SupabaseProvider from "@/components/supabase-provider";
import { createClient } from "@utils/supabase-server";
import { Redirect } from "@components/redirect/redirect";
import { AuthCheck } from "@components/auth-check/auth-check";
import { Header } from "@components/header/header";
import Grid from "@components/grid/grid";

const tiltWarp = localFont({
  src: "../assets/fonts/TiltWarp-Regular.ttf",
  variable: "--font-tilt-warp",
  display: "swap"
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  display: "swap",
  subsets: ["latin"]
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  display: "swap",
  subsets: ["latin"]
});

const lora = Lora({
  variable: "--font-lora",
  display: "swap",
  subsets: ["latin"]
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  display: "swap",
  weight: "400",
  subsets: ["latin"]
});

const bitter = Bitter({
  variable: "--font-bitter",
  display: "swap",
  subsets: ["latin"]
});

export const revalidate = 0;
export const metadata = {
  title: "Bracketude",
  description: "Live your bracket fantasy"
};

export default async function RootLayout({
                                           children
                                         }: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const user_id = user?.id;

  return (
    <html lang="en" className={`${tiltWarp.variable} ${quicksand.variable} ${playfair.variable} ${lora.variable} ${dmSerif.variable} ${bitter.variable}`}>
    {/*
      <head /> will contain the components returned by the nearest parent
      head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
    */}
    <body>
    <SupabaseProvider>
      <SupabaseListener />
      <Header user_id={user_id} />
      <AuthCheck user_id={user_id} />
      <Grid leftContent={children} />
      {/*{children}*/}
    </SupabaseProvider>
    <div className="paperOverlay" />
    </body>
    </html>
  );
}
