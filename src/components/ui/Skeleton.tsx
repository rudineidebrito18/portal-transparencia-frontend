interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className = 'h-28' }: SkeletonProps) {
  return <div className={`bg-neutral-light animate-pulse rounded-xl border border-border/30 ${className}`} />
}
