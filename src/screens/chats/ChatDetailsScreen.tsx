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
import { Timestamp } from 'firebase/firestore';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import MessageBubble from '@/components/MessageBubble';
import DateSeparator from '@/components/DateSeparator';
import EmptyState from '@/components/EmptyState';
import { colors, radius, spacing } from '@/theme';
import { ChatService } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types/models';
import { AppStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'ChatDetails'>;

type Item =
  | { kind: 'message'; data: ChatMessage }
  | { kind: 'date'; id: string; label: string };

const dayKey = (ts?: Timestamp | null) => {
  if (!ts) return '';
  const d = ts.toDate();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const dayLabel = (ts?: Timestamp | null) => {
  if (!ts) return '';
  const d = ts.toDate();
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(ts) === dayKey(Timestamp.fromDate(today))) return 'Today';
  if (dayKey(ts) === dayKey(Timestamp.fromDate(yesterday))) return 'Yesterday';
  const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'long' });
  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
};

const ChatDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { chatId, title, photoURL } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Item>>(null);

  useEffect(() => {
    const unsub = ChatService.listenToMessages(chatId, (msgs) => {
      setMessages(msgs);
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

  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    let lastDay = '';
    messages.forEach((m) => {
      const key = dayKey(m.createdAt);
      if (key && key !== lastDay) {
        out.push({ kind: 'date', id: `d-${key}`, label: dayLabel(m.createdAt) });
        lastDay = key;
      }
      out.push({ kind: 'message', data: m });
    });
    return out;
  }, [messages]);

  useEffect(() => {
    if (items.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [items.length]);

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

  const hasDraft = draft.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.chatBackground }}>
      <Header
        title={title}
        subtitle="online"
        leftIcon={
          <View style={styles.headerLeft}>
            <Text style={styles.backChevron}>‹</Text>
            <Avatar uri={photoURL ?? undefined} name={title} size={36} />
          </View>
        }
        onLeftPress={() => navigation.goBack()}
        rightAccessory={
          <View style={styles.headerActions}>
            <TouchableOpacity hitSlop={8} style={styles.iconBtn}>
              <Text style={styles.headerIcon}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity hitSlop={8} style={styles.iconBtn}>
              <Text style={styles.headerIcon}>⋮</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 50 : 0}
      >
        {items.length === 0 ? (
          <EmptyState
            title="Say hello"
            message="This is the start of your conversation on OfflineSMS."
          />
        ) : (
          <FlatList
            ref={listRef}
            data={items}
            keyExtractor={(it) => (it.kind === 'date' ? it.id : `m-${it.data.id}`)}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) =>
              item.kind === 'date' ? (
                <DateSeparator label={item.label} />
              ) : (
                <MessageBubble
                  text={item.data.text}
                  outgoing={item.data.senderId === user?.uid}
                  createdAt={item.data.createdAt}
                  status={item.data.status}
                />
              )
            }
          />
        )}

        <View style={[styles.composer, { paddingBottom: spacing.sm + insets.bottom }]}>
          <View style={styles.inputPill}>
            <TouchableOpacity style={styles.pillIcon} hitSlop={6}>
              <Text style={styles.iconText}>😊</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Message"
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <TouchableOpacity style={styles.pillIcon} hitSlop={6}>
              <Text style={styles.iconText}>📎</Text>
            </TouchableOpacity>
            {!hasDraft && (
              <TouchableOpacity style={styles.pillIcon} hitSlop={6}>
                <Text style={styles.iconText}>📷</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={hasDraft ? onSend : undefined}
            disabled={sending}
          >
            <Text style={styles.sendText}>{hasDraft ? '➤' : '🎤'}</Text>
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
  headerActions: { flexDirection: 'row', gap: 6 },
  iconBtn: { padding: 6 },
  headerIcon: { color: '#fff', fontSize: 20 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 44,
  },
  pillIcon: { paddingHorizontal: 8, paddingVertical: 8 },
  iconText: { fontSize: 20 },
  input: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 8,
    maxHeight: 120,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontSize: 18 },
});

export default ChatDetailsScreen;
