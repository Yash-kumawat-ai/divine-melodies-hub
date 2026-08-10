import { useMemo, useState, Fragment } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface PaginatedListProps<T> {
  items: T[];
  pageSize?: number;
  className?: string;
  listClassName?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey?: (item: T, index: number) => string | number;
}

export function PaginatedList<T>({
  items,
  pageSize = 6,
  className,
  listClassName,
  renderItem,
  getKey = (_item, index) => index,
}: PaginatedListProps<T>) {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const [page, setPage] = useState(1);

  const visible = useMemo(() => items.slice(0, page * pageSize), [items, page, pageSize]);
  const hasMore = visible.length < items.length;

  return (
    <div className={cn("w-full", className)}>
      <div className={listClassName}>
        {visible.map((item, index) => (
          <Fragment key={getKey(item, index)}>{renderItem(item, index)}</Fragment>
        ))}
      </div>
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="btn-royal-secondary min-w-[160px]"
          >
            {isHi ? "और देखें" : "Show more"}
          </button>
        </div>
      )}
    </div>
  );
}

export default PaginatedList;
