import { useEffect, useState } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { GroupService } from '@/services/groupService';
import { Group } from '@/types/models';

/**
 * Subscribe to the current user's groups. Returns `null` while the first
 * snapshot is in flight, then a sorted array (pinned first, then by
 * lastMessageAt desc — sorting handled by the service).
 */
export function useGroups(uid: string | undefined): Group[] | null {
  const [groups, setGroups] = useState<Group[] | null>(null);

  useEffect(() => {
    if (!uid) {
      setGroups(null);
      return;
    }
    let unsub: Unsubscribe | undefined;
    setGroups(null);
    unsub = GroupService.listenToUserGroups(uid, setGroups);
    return () => unsub?.();
  }, [uid]);

  return groups;
}
