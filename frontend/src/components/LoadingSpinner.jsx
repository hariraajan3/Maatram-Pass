import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-gray-500">
      <Loader2 className="animate-spin text-blue-500" size={36} />
      <p className="text-sm">{message}</p>
    </div>
  );
}
