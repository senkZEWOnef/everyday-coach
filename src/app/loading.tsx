import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-400" />
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Loading...</h2>
          <p className="text-white/60 text-sm">Please wait while we prepare your content</p>
        </div>
      </div>
    </div>
  );
}