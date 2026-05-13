export default function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-saffron border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm font-body">Loading...</p>
      </div>
    </div>
  );
}
