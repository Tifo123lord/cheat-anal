import type { Metadata } from 'next';
import DashboardView from './DashboardView';

export const metadata: Metadata = { title: 'Author dashboard', robots: { index: false } };

export default function DashboardPage() {
  return <DashboardView />;
}
