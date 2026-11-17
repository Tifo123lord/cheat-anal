import type { Metadata } from 'next';
import { TwoColumn } from '@/components/Layout';
import NewReleases from './NewReleases';

export const metadata: Metadata = {
  title: 'New releases',
  description: 'The newest digital files on Cheat & Anal, freshly reviewed and ready to download.',
  alternates: { canonical: '/new-releases/' },
};

export default function NewReleasesPage() {
  return (
    <TwoColumn>
      <NewReleases />
    </TwoColumn>
  );
}
