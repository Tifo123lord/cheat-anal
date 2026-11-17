import type { Metadata } from 'next';
import { TwoColumn } from '@/components/Layout';
import FreeFiles from './FreeFiles';

export const metadata: Metadata = {
  title: 'Free files',
  description: 'Free files from Cheat & Anal. Unlock with your email.',
  alternates: { canonical: '/free-files/' },
};

export default function FreeFilesPage() {
  return (
    <TwoColumn>
      <div className="frame on-paper mb-[14px] p-3">
        <h1 className="page-title !text-[19px]">Free files</h1>
        <p className="text-[12px] text-ink-muted">
          Free files under the Personal licence, unlocked with your email.
        </p>
      </div>
      <FreeFiles />
    </TwoColumn>
  );
}
