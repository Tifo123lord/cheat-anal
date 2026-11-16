import type { Metadata } from 'next';
import { PaperPage } from '@/components/Layout';
import ForgotForm from './ForgotForm';

export const metadata: Metadata = { title: 'Forgot password', robots: { index: false } };

export default function ForgotPage() {
  return (
    <PaperPage title="Forgot your password?" intro="We'll send you a link to choose a new one." wide={false}>
      <ForgotForm />
    </PaperPage>
  );
}
