import { TwoColumn } from './Layout';
import { GridSkeleton } from './ProductGrid';

export default function ShopSkeleton({ title }: { title: string }) {
  return (
    <TwoColumn
      aside={
        <div className="frame hidden h-[600px] p-3 lg:block">
          <div className="skeleton h-full w-full" />
        </div>
      }
    >
      <div className="frame on-paper mb-[14px] p-3">
        <h1 className="page-title !text-[19px]">{title}</h1>
        <div className="skeleton mt-1 h-3 w-24" />
      </div>
      <GridSkeleton count={6} />
    </TwoColumn>
  );
}
