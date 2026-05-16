import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import MessageBubble from '@/components/MessageBubble';
import EmptyState from '@/components/EmptyState';
import { colors, radius, spacing } from '@/theme';
import { GroupService } from '@/services/groupService';
import { UserService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage, UserProfile } from '@/types/models';
import { AppStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'GroupChat'>;

const GroupChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { groupId, title, photoURL } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [senders, setSenders] = useState<Record<string, UserProfile>>({});
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => GroupService.listenToGroupMessages(groupId, setMessages), [groupId]);

  useEffect(() => {
    const missing = new Set<string>();
    messages.forEach((m) => !senders[m.senderId] && missing.add(m.senderId));
    missing.forEach(async (uid) => {
      const p = await UserService.getProfile(uid);
      if (p) setSenders((prev) => ({ ...prev, [uid]: p }));
    });
  }, [messages, senders]);

  useEffect(() => {
    if (messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length]);

  const onSend = async () => {
    const text = draft.trim();
    if (!text || !user || sending) return;
    try {
      setSending(true);
      setDraft('');
      await GroupService.sendGroupMessage(groupId, user.uid, text);
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.chatBackground }}>
      <Header
        title={title}
        subtitle="Group chat"
        leftIcon={
          <View style={styles.headerLeft}>
            <Text style={styles.backChevron}>‹</Text>
            <Avatar uri={photoURL ?? undefined} name={title} size={36} />
          </View>
        }
        onLeftPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 50 : 0}
      >
        {messages.length === 0 ? (
          <EmptyState title="No messages yet" message="Be the first to say hi to the group." />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ paddingVertical: spacing.md }}
            renderItem={({ item }) => (
              <MessageBubble
                text={item.text}
                outgoing={item.senderId === user?.uid}
                createdAt={item.createdAt}
                status={item.status}
                showSenderName={
                  item.senderId !== user?.uid ? senders[item.senderId]?.displayName : undefined
                }
              />
            )}
          />
        )}
        <View style={[styles.composer, { paddingBottom: spacing.sm + insets.bottom }]}>
          <TouchableOpacity style={styles.iconBtn} hitSlop={10}>
            <Text style={styles.iconText}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Message group"
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && { opacity: 0.6 }]}
            onPress={onSend}
            disabled={!draft.trim() || sending}
          >
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backChevron: { color: '#fff', fontSize: 26, fontWeight: '700', marginRight: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconBtn: { padding: 10 },
  iconText: { fontSize: 20 },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 15,
    color: colors.textPrimary,
    marginHorizontal: 4,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  sendText: { color: '#fff', fontSize: 18, marginLeft: 2 },
});

export default GroupChatScreen;
