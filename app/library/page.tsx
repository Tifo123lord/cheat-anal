import type { Metadata } from 'next';
import LibraryView from './LibraryView';

export const metadata: Metadata = { title: 'My downloads', robots: { index: false } };

export default function LibraryPage() {
  return <LibraryView />;
}
