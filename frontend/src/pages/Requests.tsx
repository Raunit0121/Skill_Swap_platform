import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  Spinner,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { swapAPI } from '../services/api';
import { FaUser, FaClock, FaCheck, FaTimes, FaBan } from 'react-icons/fa';

interface SwapRequest {
  _id: string;
  fromUserId: { _id: string; name: string; profilePhotoUrl?: string };
  toUserId: { _id: string; name: string; profilePhotoUrl?: string };
  skillOffered: string;
  skillWanted: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

const Requests = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const [received, sent] = await Promise.all([
          swapAPI.getMyRequests({ type: 'received' }),
          swapAPI.getMyRequests({ type: 'sent' }),
        ]);
        setIncomingRequests(received.requests || []);
        setOutgoingRequests(sent.requests || []);
      } catch (err: any) {
        setError('Failed to fetch requests');
        toast({ title: 'Error', description: 'Failed to fetch requests', status: 'error', duration: 3000 });
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user, toast]);

  const handleAccept = async (requestId: string) => {
    try {
      await swapAPI.acceptRequest(requestId);
      setIncomingRequests((prev) => prev.map(r => r._id === requestId ? { ...r, status: 'accepted' } : r));
      toast({ title: 'Request accepted', status: 'success', duration: 3000 });
      // Dispatch event to update navbar notification
      window.dispatchEvent(new Event('requestUpdated'));
    } catch {
      toast({ title: 'Failed to accept request', status: 'error', duration: 3000 });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await swapAPI.rejectRequest(requestId);
      setIncomingRequests((prev) => prev.map(r => r._id === requestId ? { ...r, status: 'rejected' } : r));
      toast({ title: 'Request rejected', status: 'info', duration: 3000 });
      // Dispatch event to update navbar notification
      window.dispatchEvent(new Event('requestUpdated'));
    } catch {
      toast({ title: 'Failed to reject request', status: 'error', duration: 3000 });
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await swapAPI.cancelRequest(requestId);
      setOutgoingRequests((prev) => prev.map(r => r._id === requestId ? { ...r, status: 'cancelled' } : r));
      toast({ title: 'Request cancelled', status: 'info', duration: 3000 });
      // Dispatch event to update navbar notification (in case it was a pending request)
      window.dispatchEvent(new Event('requestUpdated'));
    } catch {
      toast({ title: 'Failed to cancel request', status: 'error', duration: 3000 });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return FaClock;
      case 'accepted': return FaCheck;
      case 'rejected': return FaTimes;
      case 'cancelled': return FaBan;
      default: return FaClock;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <Container maxW="container.sm" py={10}>
        <VStack>
          <Heading color="gray.800">Please log in to view requests</Heading>
        </VStack>
      </Container>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh" pt={20}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Box textAlign="center" w="100%">
            <Heading size="xl" color="gray.800" mb={4}>
              Skill Swap Requests
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Manage your incoming and outgoing skill swap requests
            </Text>
          </Box>

          {/* Tab Buttons */}
          <Box w="100%" bg="white" p={4} borderRadius="xl" shadow="md">
            <HStack justify="center" spacing={4}>
              <Button
                size="lg"
                variant={activeTab === 'incoming' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setActiveTab('incoming')}
              >
                {FaUser({ style: { marginRight: 8 } })}
                Incoming Requests ({incomingRequests.length})
              </Button>
              <Button
                size="lg"
                variant={activeTab === 'outgoing' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setActiveTab('outgoing')}
              >
                {FaUser({ style: { marginRight: 8 } })}
                Outgoing Requests ({outgoingRequests.length})
              </Button>
            </HStack>
          </Box>

          {loading ? (
            <Box textAlign="center" py={20}>
              <Spinner size="xl" color="blue.500" />
              <Text mt={4} color="gray.600" fontSize="lg">Loading requests...</Text>
            </Box>
          ) : error ? (
            <Box textAlign="center" py={20}>
              <Text color="red.500" fontSize="lg" fontWeight="bold">{error}</Text>
            </Box>
          ) : (
            <Box w="100%">
              {/* Incoming Requests */}
              {activeTab === 'incoming' && (
                <VStack spacing={6} w="100%">
                  {incomingRequests.length === 0 ? (
                    <Card w="100%" bg="white" shadow="md">
                      <CardBody textAlign="center" py={12}>
                        <Box color="gray.400" mb={4}>
                          {FaUser({ size: 48 })}
                        </Box>
                        <Text color="gray.600" fontSize="xl" fontWeight="bold" mb={2}>
                          No incoming requests
                        </Text>
                        <Text color="gray.500">
                          When someone sends you a skill swap request, it will appear here.
                        </Text>
                      </CardBody>
                    </Card>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="100%">
                      {incomingRequests.map((request) => {
                        const StatusIcon = getStatusIcon(request.status);
                        return (
                          <Card key={request._id} bg="white" shadow="md" borderRadius="xl">
                            <CardHeader pb={3}>
                              <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold" color="gray.800" fontSize="lg">
                                    From: {request.fromUserId.name}
                                  </Text>
                                  <Badge 
                                    colorScheme={getStatusColor(request.status)}
                                    size="lg"
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                  >
                                    <HStack spacing={1}>
                                      <Box>
                                        {StatusIcon({})}
                                      </Box>
                                      <Text>{request.status}</Text>
                                    </HStack>
                                  </Badge>
                                </VStack>
                              </HStack>
                            </CardHeader>
                            
                            <CardBody pt={0}>
                              <VStack align="start" spacing={4}>
                                <Box w="100%">
                                  <Text color="blue.600" fontWeight="bold" mb={1}>
                                    Wants to learn:
                                  </Text>
                                  <Badge colorScheme="blue" size="lg" borderRadius="md">
                                    {request.skillWanted}
                                  </Badge>
                                </Box>
                                
                                <Box w="100%">
                                  <Text color="green.600" fontWeight="bold" mb={1}>
                                    Can teach you:
                                  </Text>
                                  <Badge colorScheme="green" size="lg" borderRadius="md">
                                    {request.skillOffered}
                                  </Badge>
                                </Box>
                                
                                <Divider />
                                
                                <HStack color="gray.600" fontSize="sm">
                                  <Box>
                                    {FaClock({})}
                                  </Box>
                                  <Text>{formatDate(request.createdAt)}</Text>
                                </HStack>

                                {request.message && (
                                  <Box w="100%" bg="gray.50" p={3} borderRadius="md">
                                    <Text fontSize="sm" fontStyle="italic" color="gray.700">
                                      "{request.message}"
                                    </Text>
                                  </Box>
                                )}

                                {request.status === 'pending' && (
                                  <HStack w="100%" spacing={3}>
                                    <Button
                                      size="md"
                                      colorScheme="green"
                                      onClick={() => handleAccept(request._id)}
                                      flex={1}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="md"
                                      colorScheme="red"
                                      onClick={() => handleReject(request._id)}
                                      flex={1}
                                    >
                                      Reject
                                    </Button>
                                  </HStack>
                                )}

                                {request.status === 'accepted' && (
                                  <HStack color="green.600" fontSize="sm">
                                    <Box>
                                      {FaCheck({})}
                                    </Box>
                                    <Text fontWeight="bold">Request accepted</Text>
                                  </HStack>
                                )}

                                {request.status === 'rejected' && (
                                  <HStack color="red.600" fontSize="sm">
                                    <Box>
                                      {FaTimes({})}
                                    </Box>
                                    <Text fontWeight="bold">Request rejected</Text>
                                  </HStack>
                                )}
                              </VStack>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </SimpleGrid>
                  )}
                </VStack>
              )}

              {/* Outgoing Requests */}
              {activeTab === 'outgoing' && (
                <VStack spacing={6} w="100%">
                  {outgoingRequests.length === 0 ? (
                    <Card w="100%" bg="white" shadow="md">
                      <CardBody textAlign="center" py={12}>
                        <Box color="gray.400" mb={4}>
                          {FaUser({ size: 48 })}
                        </Box>
                        <Text color="gray.600" fontSize="xl" fontWeight="bold" mb={2}>
                          No outgoing requests
                        </Text>
                        <Text color="gray.500">
                          When you send skill swap requests, they will appear here.
                        </Text>
                      </CardBody>
                    </Card>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="100%">
                      {outgoingRequests.map((request) => {
                        const StatusIcon = getStatusIcon(request.status);
                        return (
                          <Card key={request._id} bg="white" shadow="md" borderRadius="xl">
                            <CardHeader pb={3}>
                              <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold" color="gray.800" fontSize="lg">
                                    To: {request.toUserId.name}
                                  </Text>
                                  <Badge 
                                    colorScheme={getStatusColor(request.status)}
                                    size="lg"
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                  >
                                    <HStack spacing={1}>
                                      <Box>
                                        {StatusIcon({})}
                                      </Box>
                                      <Text>{request.status}</Text>
                                    </HStack>
                                  </Badge>
                                </VStack>
                              </HStack>
                            </CardHeader>
                            
                            <CardBody pt={0}>
                              <VStack align="start" spacing={4}>
                                <Box w="100%">
                                  <Text color="blue.600" fontWeight="bold" mb={1}>
                                    You want to learn:
                                  </Text>
                                  <Badge colorScheme="blue" size="lg" borderRadius="md">
                                    {request.skillWanted}
                                  </Badge>
                                </Box>
                                
                                <Box w="100%">
                                  <Text color="green.600" fontWeight="bold" mb={1}>
                                    You can teach:
                                  </Text>
                                  <Badge colorScheme="green" size="lg" borderRadius="md">
                                    {request.skillOffered}
                                  </Badge>
                                </Box>
                                
                                <Divider />
                                
                                <HStack color="gray.600" fontSize="sm">
                                  <Box>
                                    {FaClock({})}
                                  </Box>
                                  <Text>Sent on {formatDate(request.createdAt)}</Text>
                                </HStack>

                                {request.message && (
                                  <Box w="100%" bg="gray.50" p={3} borderRadius="md">
                                    <Text fontSize="sm" fontStyle="italic" color="gray.700">
                                      "{request.message}"
                                    </Text>
                                  </Box>
                                )}

                                {request.status === 'pending' && (
                                  <Button
                                    size="md"
                                    colorScheme="red"
                                    onClick={() => handleCancel(request._id)}
                                    w="100%"
                                  >
                                    Cancel Request
                                  </Button>
                                )}

                                {request.status === 'accepted' && (
                                  <HStack color="green.600" fontSize="sm">
                                    <Box>
                                      {FaCheck({})}
                                    </Box>
                                    <Text fontWeight="bold">Request accepted</Text>
                                  </HStack>
                                )}

                                {request.status === 'rejected' && (
                                  <HStack color="red.600" fontSize="sm">
                                    <Box>
                                      {FaTimes({})}
                                    </Box>
                                    <Text fontWeight="bold">Request rejected</Text>
                                  </HStack>
                                )}

                                {request.status === 'cancelled' && (
                                  <HStack color="gray.600" fontSize="sm">
                                    <Box>
                                      {FaBan({})}
                                    </Box>
                                    <Text fontWeight="bold">Request cancelled</Text>
                                  </HStack>
                                )}
                              </VStack>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </SimpleGrid>
                  )}
                </VStack>
              )}
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Requests; 