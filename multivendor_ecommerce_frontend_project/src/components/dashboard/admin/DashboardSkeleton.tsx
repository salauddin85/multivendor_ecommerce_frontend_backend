import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-4 w-64 bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-800" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2 bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2 bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-4 w-56 bg-gray-200 dark:bg-gray-800" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full bg-gray-200 dark:bg-gray-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-gray-200 dark:bg-gray-800" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40 bg-gray-200 dark:bg-gray-800" />
                      <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <Skeleton className="h-8 w-20 bg-gray-200 dark:bg-gray-800" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}