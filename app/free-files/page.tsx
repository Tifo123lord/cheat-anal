import type { Metadata } from 'next';
import { TwoColumn } from '@/components/Layout';
import FreeFiles from './FreeFiles';

export const metadata: Metadata = {
  title: 'Free files',
  description: 'Free templates, mockups, textures and ebooks from leafpress authors. Unlock with your email.',
  alternates: { canonical: '/free-files/' },
};

export default function FreeFilesPage() {
  return (
    <TwoColumn>
      <div className="frame on-paper mb-[14px] p-3">
        <h1 className="page-title !text-[19px]">Free files</h1>
        <p className="text-[12px] text-ink-muted">
          A fresh handful of free files every month, under the Personal licence.
        </p>
      </div>
      <FreeFiles />
    </TwoColumn>
  );
}
