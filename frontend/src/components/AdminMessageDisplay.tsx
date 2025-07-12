import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  VStack,
  Badge,
  Text,
} from '@chakra-ui/react';
import { adminAPI } from '../services/api';

interface AdminMessage {
  _id: string;
  title: string;
  message: string;
  type: 'announcement' | 'warning' | 'info';
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

const AdminMessageDisplay = () => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedMessages, setDismissedMessages] = useState<string[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await adminAPI.getMessages({ active: true, limit: 10 });
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Failed to load admin messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  const handleDismiss = (messageId: string) => {
    setDismissedMessages(prev => [...prev, messageId]);
  };

  const getAlertColorScheme = (type: string) => {
    switch (type) {
      case 'warning':
        return 'red';
      case 'announcement':
        return 'blue';
      case 'info':
        return 'green';
      default:
        return 'gray';
    }
  };

  if (loading || messages.length === 0) {
    return null;
  }

  const activeMessages = messages.filter(
    message => 
      message.isActive && 
      !dismissedMessages.includes(message._id) &&
      (!message.expiresAt || new Date(message.expiresAt) > new Date())
  );

  if (activeMessages.length === 0) {
    return null;
  }

  return (
    <VStack spacing={3} w="100%" mb={4}>
      {activeMessages.map((message) => (
        <Alert
          key={message._id}
          status={message.type === 'warning' ? 'error' : 'info'}
          colorScheme={getAlertColorScheme(message.type)}
          borderRadius="md"
          position="relative"
        >
          <AlertIcon />
          <Box flex="1">
            <AlertTitle display="flex" alignItems="center" gap={2}>
              {message.title}
              <Badge size="sm" colorScheme={getAlertColorScheme(message.type)}>
                {message.type}
              </Badge>
            </AlertTitle>
            <AlertDescription mt={1}>
              {message.message}
            </AlertDescription>
            {message.expiresAt && (
              <Text fontSize="xs" color="gray.500" mt={2}>
                Expires: {new Date(message.expiresAt).toLocaleDateString()}
              </Text>
            )}
          </Box>
          <CloseButton
            alignSelf="flex-start"
            position="relative"
            right={-1}
            top={-1}
            onClick={() => handleDismiss(message._id)}
          />
        </Alert>
      ))}
    </VStack>
  );
};

export default AdminMessageDisplay; 