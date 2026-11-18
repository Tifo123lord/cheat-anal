import type { Metadata } from 'next';
import LibraryView from './LibraryView';

export const metadata: Metadata = { title: 'دانلودهای من', robots: { index: false } };

export default function LibraryPage() {
  return <LibraryView />;
}
