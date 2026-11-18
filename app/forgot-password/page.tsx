import type { Metadata } from 'next';
import { PaperPage } from '@/components/Layout';
import ForgotForm from './ForgotForm';

export const metadata: Metadata = { title: 'فراموشی رمز عبور', robots: { index: false } };

export default function ForgotPage() {
  return (
    <PaperPage
      title="رمز عبورت را فراموش کرده‌ای؟"
      intro="یک لینک برایت می‌فرستیم تا رمز جدیدی انتخاب کنی."
      wide={false}
    >
      <ForgotForm />
    </PaperPage>
  );
}
