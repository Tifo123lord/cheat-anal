import { TwoColumn } from '@/components/Layout';
import { GridSkeleton } from '@/components/ProductGrid';

export default function Loading() {
  return (
    <TwoColumn
      aside={
        <div className="frame hidden h-[480px] p-3 lg:block">
          <div className="skeleton h-full w-full" />
        </div>
      }
    >
      <div className="frame mb-[14px] p-3" aria-busy="true" aria-label="Loading">
        <div className="skeleton h-6 w-1/3" />
      </div>
      <GridSkeleton count={4} />
    </TwoColumn>
  );
}
