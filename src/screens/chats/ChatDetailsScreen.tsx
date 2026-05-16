import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { ChatService } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types/models';
import { AppStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'ChatDetails'>;

const ChatDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { chatId, title, photoURL } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    const unsub = ChatService.listenToMessages(chatId, (msgs) => {
      setMessages(msgs);
      // Mark unread incoming messages as read.
      if (user) {
        const unreadIds = msgs
          .filter((m) => m.senderId !== user.uid && !(m.readBy ?? []).includes(user.uid))
          .map((m) => m.id);
        if (unreadIds.length) {
          ChatService.markAsRead(chatId, user.uid, unreadIds).catch(() => {});
        }
      }
    });
    return unsub;
  }, [chatId, user]);

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
      await ChatService.sendMessage(chatId, user.uid, text);
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  const headerLeft = useMemo(
    () => (
      <View style={styles.headerLeft}>
        <Text style={styles.backChevron}>‹</Text>
        <Avatar uri={photoURL ?? undefined} name={title} size={36} />
      </View>
    ),
    [photoURL, title],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.chatBackground }}>
      <Header
        title={title}
        subtitle="online"
        leftIcon={headerLeft}
        onLeftPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 50 : 0}
      >
        {messages.length === 0 ? (
          <EmptyState
            title="Say hello"
            message="This is the start of your conversation on OfflineSMS."
          />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => (
              <MessageBubble
                text={item.text}
                outgoing={item.senderId === user?.uid}
                createdAt={item.createdAt}
                status={item.status}
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
            placeholder="Message"
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
  listContent: { paddingVertical: spacing.md },
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

export default ChatDetailsScreen;
