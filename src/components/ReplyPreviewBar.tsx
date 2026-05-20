import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing } from '@/theme';
import { ReplyPreview } from '@/types/models';

interface Props {
  reply: ReplyPreview;
  /** Show an "x" button on the right to dismiss the reply (composer use). */
  onClose?: () => void;
  /** `composer` is the bigger version shown above the input;
   *  `inline`  is the compact version embedded inside a message bubble. */
  variant?: 'composer' | 'inline';
}

const ReplyPreviewBar: React.FC<Props> = ({ reply, onClose, variant = 'composer' }) => {
  const senderLabel = reply.senderName?.trim() || 'OfflineSMS user';
  const snippet = reply.type === 'image' ? '📷 Photo' : reply.snippet;
  const isComposer = variant === 'composer';
  return (
    <View
      style={[
        styles.wrap,
        isComposer ? styles.composer : styles.inline,
      ]}
    >
      <View style={styles.accent} />
      <View style={styles.body}>
        <Text style={styles.sender} numberOfLines={1}>
          {senderLabel}
        </Text>
        <Text style={styles.snippet} numberOfLines={1}>
          {snippet}
        </Text>
      </View>
      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          hitSlop={10}
          style={styles.closeBtn}
          accessibilityLabel="Cancel reply"
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  composer: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  inline: {
    backgroundColor: 'rgba(37,150,190,0.10)',
    borderRadius: radii.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  accent: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  body: { flex: 1, minWidth: 0 },
  sender: { fontSize: 12, fontWeight: '700', color: colors.primary },
  snippet: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  closeBtn: { paddingHorizontal: 6, paddingVertical: 2 },
  closeText: { fontSize: 22, color: colors.textMuted, fontWeight: '500' },
});

export default ReplyPreviewBar;
