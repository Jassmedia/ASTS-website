import React from 'react';
import { useLocation } from 'react-router-dom';
import Seo from '../components/Seo';
import NewHome from '../components/home/NewHome';
import SearchResults from './SearchResults';
import pagesSeo from '../data/pages-seo.json';

/**
 * Homepage (redesign). SEO metadata is unchanged (pages-seo.json '/').
 * "/?s=term" is answered by WordPress on the server; the client-side
 * SearchResults template stays as a fallback for in-app navigation.
 */
export default function Home() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  if (params.has('s')) return <SearchResults />;

  return (
    <>
      <Seo seo={pagesSeo['/']} />
      <NewHome />
    </>
  );
}
