import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/config';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { colors, spacing } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/userService';

const ProfileSetupScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [about, setAbout] = useState(profile?.about ?? 'Available on OfflineSMS');
  const [photoURI, setPhotoURI] = useState<string | null>(profile?.photoURL ?? null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoURI(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uid: string, uri: string): Promise<string> => {
    const res = await fetch(uri);
    const blob = await res.blob();
    const ref = storageRef(storage, `avatars/${uid}.jpg`);
    await uploadBytes(ref, blob, { contentType: 'image/jpeg' });
    return getDownloadURL(ref);
  };

  const onSave = async () => {
    if (!user) return;
    if (name.trim().length < 2) {
      Alert.alert('Name required', 'Please tell us what to call you.');
      return;
    }
    try {
      setLoading(true);
      let photoURL = profile?.photoURL ?? null;
      if (photoURI && photoURI !== profile?.photoURL) {
        photoURL = await uploadPhoto(user.uid, photoURI);
      }
      await UserService.createOrUpdateProfile(user.uid, {
        displayName: name.trim(),
        about: about.trim(),
        phoneNumber: user.phoneNumber ?? profile?.phoneNumber ?? '',
        photoURL,
      });
    } catch (e: any) {
      Alert.alert('Could not save profile', e?.message ?? 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.wrapper, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Your profile</Text>
        <Text style={styles.subtitle}>This is how other people will see you on OfflineSMS.</Text>

        <TouchableOpacity onPress={pickImage} style={styles.avatarWrap} activeOpacity={0.8}>
          <Avatar uri={photoURI} name={name || 'You'} size={108} />
          <View style={styles.cameraBadge}>
            <Text style={{ color: '#fff', fontSize: 16 }}>＋</Text>
          </View>
        </TouchableOpacity>

        <Input label="Display name" value={name} onChangeText={setName} placeholder="Your name" />
        <Input label="About" value={about} onChangeText={setAbout} placeholder="Available" />

        <Button title="Save & continue" fullWidth loading={loading} onPress={onSave} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: spacing.xl },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  avatarWrap: { alignSelf: 'center', marginBottom: spacing.xl },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default ProfileSetupScreen;
