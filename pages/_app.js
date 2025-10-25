import "../styles/globals.css";
import Head from "next/head";
import { ThemeProvider } from "../components/ThemeProvider";
import Layout from "../components/Layout";

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Head>
        <title>CELPIP Writing Practice ✍️</title>
        <meta
          name="description"
          content="Practice CELPIP Task 1 and Task 2 writing with timed prompts, autosave, and AI-powered evaluation."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
