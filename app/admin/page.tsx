import type { Metadata } from 'next';
import AdminView from './AdminView';

export const metadata: Metadata = { title: 'Admin panel', robots: { index: false } };

export default function AdminPage() {
  return <AdminView />;
}
