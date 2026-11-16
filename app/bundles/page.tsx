import type { Metadata } from 'next';
import BundleCard from '@/components/BundleCard';
import { TwoColumn } from '@/components/Layout';
import { bundles } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Bundles',
  description: 'Hand-picked bundles of templates, fonts, icons and mockups at a fraction of the price.',
  alternates: { canonical: '/bundles/' },
};

export default function BundlesPage() {
  return (
    <TwoColumn>
      <div className="frame on-paper mb-[14px] p-3">
        <h1 className="page-title !text-[19px]">Bundles</h1>
        <p className="text-[12px] text-ink-muted">
          Curated sets that work beautifully together. Prices shown for the Personal licence; switch licence
          in your cart.
        </p>
      </div>
      <ul className="space-y-[14px]">
        {bundles.map((b) => (
          <li key={b.id}>
            <BundleCard bundle={b} />
          </li>
        ))}
      </ul>
    </TwoColumn>
  );
}
