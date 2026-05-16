export default function PageContentFallback() {
  return (
    <div aria-busy="true" className="w-full px-4 py-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-48 max-w-full bg-muted rounded-lg animate-pulse" />
        <div className="h-48 bg-muted rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
