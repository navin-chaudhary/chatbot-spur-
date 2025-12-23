import { v4 as uuidv4 } from 'uuid';
import {
  conversationQueries,
  messageQueries,
  type Conversation,
  type Message,
} from '../db/database';

export async function createConversation(): Promise<Conversation> {
  const id = uuidv4();
  await conversationQueries.create(id);
  const conversation = await conversationQueries.getById(id);
  if (!conversation) {
    throw new Error('Failed to create conversation');
  }
  return conversation;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  return await conversationQueries.getById(id);
}

export async function createMessage(
  conversationId: string,
  sender: 'user' | 'ai',
  text: string
): Promise<Message> {
  const id = uuidv4();
  await messageQueries.create(id, conversationId, sender, text);
  await conversationQueries.updateTimestamp(conversationId);
  const message = await messageQueries.getByConversationId(conversationId);
  return message.find((m: Message) => m.id === id) as Message;
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  return await messageQueries.getByConversationId(conversationId);
}

export async function getRecentMessages(
  conversationId: string,
  limit: number = 20
): Promise<Message[]> {
  return await messageQueries.getLatest(conversationId, limit);
}

