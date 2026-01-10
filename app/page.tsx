'use client';

import { useRef } from 'react';
import { Hero } from '@/components/landing/hero';
import { Concept } from '@/components/landing/concept';
import { Mood } from '@/components/landing/mood';
import { Audience } from '@/components/landing/audience';
import { WaitlistForm } from '@/components/landing/waitlist-form';
import { Suspense } from '@/components/landing/suspense';
import { FooterMinimal } from '@/components/landing/footer';

export default function Home() {
  const waitlistRef = useRef<HTMLElement>(null);

  const scrollToWaitlist = () => {
    const section = document.getElementById('waitlist');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <main className="bg-black">
      <Hero onCTAClick={scrollToWaitlist} />
      <Concept />
      <Mood />
      <Audience />
      <WaitlistForm />
      <Suspense />
      <FooterMinimal />
    </main>
  );
}
