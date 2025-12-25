/**
 * SSR Polyfill for browser globals
 * Prevents "location is not defined" errors during static generation
 */

if (typeof window === 'undefined') {
  // @ts-ignore
  global.location = {
    href: '',
    protocol: 'https:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
    origin: 'https://localhost',
    reload: () => {},
    replace: () => {},
    assign: () => {},
    toString: () => 'https://localhost/',
  };
}

export {};
