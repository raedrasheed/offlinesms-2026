import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Collections } from '@/firebase/collections';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationService = {
  async register(uid: string) {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'OfflineSMS',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#0AB3B8',
      });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return null;
    const token = (await Notifications.getDevicePushTokenAsync()).data;
    await updateDoc(doc(db, Collections.users, uid), { fcmToken: token });
    return token;
  },
};
