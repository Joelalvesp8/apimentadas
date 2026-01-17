'use client';

import { Hero } from '@/components/landing/hero';
import { Concept } from '@/components/landing/concept';
import { Mood } from '@/components/landing/mood';
import { Audience } from '@/components/landing/audience';
import { WaitlistForm } from '@/components/landing/waitlist-form';
import { Suspense } from '@/components/landing/suspense';
import { FooterMinimal } from '@/components/landing/footer';
import { LandingHeader } from '@/components/landing/landing-header';

export default function Home() {
  return (
    <main className="bg-black">
      <LandingHeader />
      <Hero />
      <Concept />
      <Mood />
      <Audience />
      <WaitlistForm />
      <Suspense />
      <FooterMinimal />
    </main>
  );
}
