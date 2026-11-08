import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { apiService, ChatMessage as ChatMessageType } from '../../services/api-service';
import ChatMessage from '../../components/chat-message';

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      sender_role: 'assistant',
      content: 'Hello! I am your AI academic tutor. Ask me any question, request concept explanations, or ask for quiz problems.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const suggestedQuestions = [
    'Explain the CAP theorem simply.',
    'Difference between Process and Thread?',
    'Give me 3 practice questions on Dijkstra algorithm.',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    setInput('');
    const userMsg: ChatMessageType = { sender_role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await apiService.chatWithAi({
        message: text,
        conversation_id: conversationId,
      });
      setConversationId(res.conversation_id);
      setMessages((prev) => [...prev, res.assistant_message]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender_role: 'assistant',
          content: 'Apologies, could not process response. Please verify backend connection.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <ChatMessage message={item} />}
          contentContainerStyle={styles.messagesList}
          ListFooterComponent={
            loading ? (
              <View style={styles.loadingBubble}>
                <Text style={styles.loadingText}>AI is thinking...</Text>
              </View>
            ) : null
          }
        />

        {/* Suggested Prompt Chips */}
        {messages.length < 3 && (
          <View style={styles.suggestionsContainer}>
            {suggestedQuestions.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionChip}
                onPress={() => handleSend(q)}
              >
                <Text style={styles.suggestionText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question or request a derivation..."
            placeholderTextColor={Colors.gray400}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gray100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 6,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.gray600,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  suggestionChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.gray900,
    backgroundColor: Colors.gray50,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
