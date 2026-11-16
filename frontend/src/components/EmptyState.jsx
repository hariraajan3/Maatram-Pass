import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here', message = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
      <Icon size={48} strokeWidth={1.2} />
      <p className="text-lg font-medium text-gray-600">{title}</p>
      {message && <p className="text-sm text-gray-400 text-center max-w-xs">{message}</p>}
    </div>
  );
}
