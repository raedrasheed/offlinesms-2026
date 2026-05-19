import { Timestamp } from 'firebase/firestore';

/** Render a presence label like "online", "last seen 5m ago",
 *  "last seen yesterday", "last seen 12 Mar". */
export const formatLastSeen = (lastSeen?: Timestamp | null): string => {
  if (!lastSeen) return '';
  const date = lastSeen.toDate();
  const now = Date.now();
  const diffMs = now - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 2) return 'online';
  if (minutes < 60) return `last seen ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `last seen ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 2) return 'last seen yesterday';
  if (days < 7) return `last seen ${days}d ago`;
  return `last seen ${date.toLocaleDateString([], { day: '2-digit', month: 'short' })}`;
};
