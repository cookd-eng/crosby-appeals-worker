'use client';

import Head from 'next/head';
import * as React from 'react';
import '@/lib/env';

import ButtonLink from '@/components/links/ButtonLink';

/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

export default function HomePage() {
  return (
    <main>
      <Head>
        <title>Crosby Health - Medical Claims Documentation Pipeline</title>
      </Head>
      <section className='bg-white'>
        <div className='layout relative flex min-h-screen flex-col items-center justify-center py-12 text-center'>
          <h1 className='text-4xl font-bold'>Welcome to Crosby Health</h1>
          <p className='mt-4 text-gray-700'>
            Medical Claims Documentation Pipeline Interview Challenge
          </p>
          
          <ButtonLink className='mt-6' href='/components' variant='light'>
            View Components
          </ButtonLink>

          <footer className='absolute bottom-2 text-gray-700'>
            © {new Date().getFullYear()} Crosby Health
          </footer>
        </div>
      </section>
    </main>
  );
}
