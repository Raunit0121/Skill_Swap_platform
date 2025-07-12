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
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Textarea,
  FormControl,
  FormLabel,
  Switch,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';

interface DashboardStats {
  stats: {
    users: {
      total: number;
      active: number;
      banned: number;
    };
    requests: {
      total: number;
      pending: number;
      accepted: number;
      completed: number;
    };
  };
  recentActivity: {
    users: Array<{
      _id: string;
      name: string;
      email: string;
      createdAt: string;
    }>;
    requests: Array<{
      _id: string;
      fromUserId: { name: string; email: string };
      toUserId: { name: string; email: string };
      status: string;
      createdAt: string;
    }>;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isPublic: boolean;
  isBanned: boolean;
  createdAt: string;
  lastActive?: string;
}

interface SwapRequest {
  _id: string;
  fromUserId: { _id: string; name: string; email: string };
  toUserId: { _id: string; name: string; email: string };
  skillOffered: string;
  skillWanted: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  createdAt: string;
  completedAt?: string;
}

interface AdminMessage {
  _id: string;
  title: string;
  message: string;
  type: 'announcement' | 'warning' | 'info';
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  createdBy: { _id: string; name: string };
}

interface ReportData {
  period: number;
  userRegistrations: Array<{ _id: string; count: number }>;
  swapRequests: Array<{ _id: { date: string; status: string }; count: number }>;
  topSkillsOffered: Array<{ _id: string; count: number }>;
  topSkillsWanted: Array<{ _id: string; count: number }>;
}

const Admin = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  
  // Pagination
  const [usersPage, setUsersPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  const [messagesPage, setMessagesPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [messagesTotal, setMessagesTotal] = useState(0);
  
  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [userRole, setUserRole] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const [messageActive, setMessageActive] = useState('');
  const [reportPeriod, setReportPeriod] = useState('30');
  
  // Selected items for bulk actions
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({
    title: '',
    message: '',
    type: 'announcement' as 'announcement' | 'warning' | 'info',
    expiresAt: '',
    isActive: true
  });

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDashboard();
      setDashboardData(data);
    } catch (error) {
      toast({
        title: 'Error loading dashboard',
        description: 'Failed to load dashboard data',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const params: any = {
        page: usersPage,
        limit: 20,
      };
      
      if (userSearch) params.search = userSearch;
      if (userStatus) params.status = userStatus;
      if (userRole) params.role = userRole;
      
      const data = await adminAPI.getUsers(params);
      setUsers(data.users);
      setUsersTotal(data.pagination.totalUsers);
    } catch (error) {
      toast({
        title: 'Error loading users',
        description: 'Failed to load users data',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setUsersLoading(false);
    }
  };

  // Load requests
  const loadRequests = async () => {
    try {
      setRequestsLoading(true);
      const params: any = {
        page: requestsPage,
        limit: 20,
      };
      
      if (requestStatus) params.status = requestStatus;
      if (requestSearch) params.search = requestSearch;
      
      const data = await adminAPI.getRequests(params);
      setRequests(data.requests);
      setRequestsTotal(data.pagination.totalRequests);
    } catch (error) {
      toast({
        title: 'Error loading requests',
        description: 'Failed to load requests data',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setRequestsLoading(false);
    }
  };

  // Load messages
  const loadMessages = async () => {
    try {
      setMessagesLoading(true);
      const params: any = {
        page: messagesPage,
        limit: 20,
      };
      
      if (messageActive) params.active = messageActive;
      
      const data = await adminAPI.getMessages(params);
      setMessages(data.messages);
      setMessagesTotal(data.pagination.totalMessages);
    } catch (error) {
      toast({
        title: 'Error loading messages',
        description: 'Failed to load messages data',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  // Load reports
  const loadReports = async () => {
    try {
      setReportsLoading(true);
      const data = await adminAPI.getReports({ period: parseInt(reportPeriod) });
      setReportData(data);
    } catch (error) {
      toast({
        title: 'Error loading reports',
        description: 'Failed to load reports data',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setReportsLoading(false);
    }
  };

  // Ban/Unban user
  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await adminAPI.banUser(userId, isBanned);
      toast({
        title: `User ${isBanned ? 'banned' : 'unbanned'}`,
        description: `User has been ${isBanned ? 'banned' : 'unbanned'} successfully`,
        status: 'success',
        duration: 3000,
      });
      loadUsers();
      loadDashboard();
    } catch (error) {
      toast({
        title: 'Error updating user',
        description: 'Failed to update user status',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminAPI.deleteUser(userId);
      toast({
        title: 'User deleted',
        description: 'User has been deleted successfully',
        status: 'success',
        duration: 3000,
      });
      loadUsers();
      loadDashboard();
    } catch (error) {
      toast({
        title: 'Error deleting user',
        description: 'Failed to delete user',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Delete request
  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminAPI.deleteRequest(requestId);
      toast({
        title: 'Request deleted',
        description: 'Request has been deleted successfully',
        status: 'success',
        duration: 3000,
      });
      loadRequests();
      loadDashboard();
    } catch (error) {
      toast({
        title: 'Error deleting request',
        description: 'Failed to delete request',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Create message
  const handleCreateMessage = async () => {
    try {
      await adminAPI.createMessage(messageForm);
      toast({
        title: 'Message created',
        description: 'Admin message has been created successfully',
        status: 'success',
        duration: 3000,
      });
      setIsMessageModalOpen(false);
      setMessageForm({
        title: '',
        message: '',
        type: 'announcement',
        expiresAt: '',
        isActive: true
      });
      loadMessages();
    } catch (error) {
      toast({
        title: 'Error creating message',
        description: 'Failed to create admin message',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Update message
  const handleUpdateMessage = async (messageId: string, updateData: any) => {
    try {
      await adminAPI.updateMessage(messageId, updateData);
      toast({
        title: 'Message updated',
        description: 'Admin message has been updated successfully',
        status: 'success',
        duration: 3000,
      });
      loadMessages();
    } catch (error) {
      toast({
        title: 'Error updating message',
        description: 'Failed to update admin message',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminAPI.deleteMessage(messageId);
      toast({
        title: 'Message deleted',
        description: 'Admin message has been deleted successfully',
        status: 'success',
        duration: 3000,
      });
      loadMessages();
    } catch (error) {
      toast({
        title: 'Error deleting message',
        description: 'Failed to delete admin message',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Bulk actions
  const handleBulkBanUsers = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      await Promise.all(selectedUsers.map(userId => adminAPI.banUser(userId, true)));
      toast({
        title: 'Users banned',
        description: `${selectedUsers.length} users have been banned`,
        status: 'success',
        duration: 3000,
      });
      setSelectedUsers([]);
      loadUsers();
      loadDashboard();
    } catch (error) {
      toast({
        title: 'Error banning users',
        description: 'Failed to ban selected users',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleBulkDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await Promise.all(selectedUsers.map(userId => adminAPI.deleteUser(userId)));
      toast({
        title: 'Users deleted',
        description: `${selectedUsers.length} users have been deleted`,
        status: 'success',
        duration: 3000,
      });
      setSelectedUsers([]);
      loadUsers();
      loadDashboard();
    } catch (error) {
      toast({
        title: 'Error deleting users',
        description: 'Failed to delete selected users',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleBulkDeleteRequests = async () => {
    if (selectedRequests.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedRequests.length} requests? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await Promise.all(selectedRequests.map(requestId => adminAPI.deleteRequest(requestId)));
      toast({
        title: 'Requests deleted',
        description: `${selectedRequests.length} requests have been deleted`,
        status: 'success',
        duration: 3000,
      });
      setSelectedRequests([]);
      loadRequests();
      loadDashboard();
    } catch (error) {
      toast({
        title: 'Error deleting requests',
        description: 'Failed to delete selected requests',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleBulkDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedMessages.length} messages? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await Promise.all(selectedMessages.map(messageId => adminAPI.deleteMessage(messageId)));
      toast({
        title: 'Messages deleted',
        description: `${selectedMessages.length} messages have been deleted`,
        status: 'success',
        duration: 3000,
      });
      setSelectedMessages([]);
      loadMessages();
    } catch (error) {
      toast({
        title: 'Error deleting messages',
        description: 'Failed to delete selected messages',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Effects
  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboard();
    }
  }, [user]);

  useEffect(() => {
    loadUsers();
  }, [usersPage, userSearch, userStatus, userRole]);

  useEffect(() => {
    loadRequests();
  }, [requestsPage, requestStatus, requestSearch]);

  useEffect(() => {
    loadMessages();
  }, [messagesPage, messageActive]);

  useEffect(() => {
    loadReports();
  }, [reportPeriod]);

  if (!user || user.role !== 'admin') {
    return (
      <Container maxW="container.sm" py={10}>
        <VStack>
          <Heading>Access Denied</Heading>
          <Text>You need admin privileges to view this page.</Text>
        </VStack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading admin dashboard...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Heading size="xl">Admin Dashboard</Heading>
        
        {/* Dashboard Stats */}
        {dashboardData && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} w="100%" spacing={6}>
            <Stat bg="white" p={6} borderRadius="lg" shadow="sm">
              <StatLabel>Total Users</StatLabel>
              <StatNumber color="blue.500">{dashboardData.stats.users.total}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {dashboardData.stats.users.active} active
              </StatHelpText>
            </Stat>
            
            <Stat bg="white" p={6} borderRadius="lg" shadow="sm">
              <StatLabel>Active Users</StatLabel>
              <StatNumber color="green.500">{dashboardData.stats.users.active}</StatNumber>
              <StatHelpText>
                Last 7 days
              </StatHelpText>
            </Stat>
            
            <Stat bg="white" p={6} borderRadius="lg" shadow="sm">
              <StatLabel>Banned Users</StatLabel>
              <StatNumber color="red.500">{dashboardData.stats.users.banned}</StatNumber>
            </Stat>
            
            <Stat bg="white" p={6} borderRadius="lg" shadow="sm">
              <StatLabel>Total Requests</StatLabel>
              <StatNumber color="purple.500">{dashboardData.stats.requests.total}</StatNumber>
            </Stat>
            
            <Stat bg="white" p={6} borderRadius="lg" shadow="sm">
              <StatLabel>Pending Requests</StatLabel>
              <StatNumber color="yellow.500">{dashboardData.stats.requests.pending}</StatNumber>
            </Stat>
            
            <Stat bg="white" p={6} borderRadius="lg" shadow="sm">
              <StatLabel>Completed Swaps</StatLabel>
              <StatNumber color="green.500">{dashboardData.stats.requests.completed}</StatNumber>
            </Stat>
          </SimpleGrid>
        )}

        {/* Main Content Tabs */}
        <Tabs w="100%" variant="enclosed">
          <TabList>
            <Tab>User Management</Tab>
            <Tab>Swap Requests</Tab>
            <Tab>Admin Messages</Tab>
            <Tab>Reports & Analytics</Tab>
            <Tab>Recent Activity</Tab>
          </TabList>

          <TabPanels>
            {/* User Management Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Filters */}
                <Flex gap={4} wrap="wrap">
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    maxW="300px"
                  />
                  <Select
                    placeholder="Status"
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value)}
                    maxW="150px"
                  >
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                  </Select>
                  <Select
                    placeholder="Role"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    maxW="150px"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Select>
                </Flex>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                  <Alert status="info">
                    <AlertIcon />
                    {selectedUsers.length} users selected
                    <Button size="sm" ml={4} colorScheme="red" onClick={handleBulkBanUsers}>
                      Ban Selected
                    </Button>
                    <Button size="sm" ml={2} colorScheme="red" variant="outline" onClick={handleBulkDeleteUsers}>
                      Delete Selected
                    </Button>
                  </Alert>
                )}

                {/* Users Table */}
                <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(users.map(u => u._id));
                              } else {
                                setSelectedUsers([]);
                              }
                            }}
                          />
                        </Th>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Role</Th>
                        <Th>Status</Th>
                        <Th>Created</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {usersLoading ? (
                        <Tr>
                          <Td colSpan={7} textAlign="center">
                            <Spinner />
                          </Td>
                        </Tr>
                      ) : users.length === 0 ? (
                        <Tr>
                          <Td colSpan={7} textAlign="center">
                            No users found
                          </Td>
                        </Tr>
                      ) : (
                        users.map((user) => (
                          <Tr key={user._id}>
                            <Td>
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers([...selectedUsers, user._id]);
                                  } else {
                                    setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                                  }
                                }}
                              />
                            </Td>
                            <Td>{user.name}</Td>
                            <Td>{user.email}</Td>
                            <Td>
                              <Badge colorScheme={user.role === 'admin' ? 'purple' : 'gray'}>
                                {user.role}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={user.isBanned ? 'red' : 'green'}>
                                {user.isBanned ? 'Banned' : 'Active'}
                              </Badge>
                            </Td>
                            <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                            <Td>
                              <HStack spacing={2}>
                                {user.isBanned ? (
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    onClick={() => handleBanUser(user._id, false)}
                                  >
                                    Unban
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => handleBanUser(user._id, true)}
                                  >
                                    Ban
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="outline"
                                  onClick={() => handleDeleteUser(user._id)}
                                >
                                  Delete
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </Box>

                {/* Pagination */}
                <Flex justify="center" gap={2}>
                  <Button
                    size="sm"
                    disabled={usersPage === 1}
                    onClick={() => setUsersPage(usersPage - 1)}
                  >
                    Previous
                  </Button>
                  <Text>Page {usersPage} of {Math.ceil(usersTotal / 20)}</Text>
                  <Button
                    size="sm"
                    disabled={usersPage >= Math.ceil(usersTotal / 20)}
                    onClick={() => setUsersPage(usersPage + 1)}
                  >
                    Next
                  </Button>
                </Flex>
              </VStack>
            </TabPanel>

            {/* Swap Requests Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Filters */}
                <Flex gap={4} wrap="wrap">
                  <Input
                    placeholder="Search requests..."
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    maxW="300px"
                  />
                  <Select
                    placeholder="Status"
                    value={requestStatus}
                    onChange={(e) => setRequestStatus(e.target.value)}
                    maxW="150px"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </Select>
                </Flex>

                {/* Bulk Actions */}
                {selectedRequests.length > 0 && (
                  <Alert status="info">
                    <AlertIcon />
                    {selectedRequests.length} requests selected
                    <Button size="sm" ml={4} colorScheme="red" variant="outline" onClick={handleBulkDeleteRequests}>
                      Delete Selected
                    </Button>
                  </Alert>
                )}

                {/* Requests Table */}
                <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>
                          <input
                            type="checkbox"
                            checked={selectedRequests.length === requests.length && requests.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRequests(requests.map(r => r._id));
                              } else {
                                setSelectedRequests([]);
                              }
                            }}
                          />
                        </Th>
                        <Th>From</Th>
                        <Th>To</Th>
                        <Th>Skills</Th>
                        <Th>Status</Th>
                        <Th>Created</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {requestsLoading ? (
                        <Tr>
                          <Td colSpan={7} textAlign="center">
                            <Spinner />
                          </Td>
                        </Tr>
                      ) : requests.length === 0 ? (
                        <Tr>
                          <Td colSpan={7} textAlign="center">
                            No requests found
                          </Td>
                        </Tr>
                      ) : (
                        requests.map((request) => (
                          <Tr key={request._id}>
                            <Td>
                              <input
                                type="checkbox"
                                checked={selectedRequests.includes(request._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRequests([...selectedRequests, request._id]);
                                  } else {
                                    setSelectedRequests(selectedRequests.filter(id => id !== request._id));
                                  }
                                }}
                              />
                            </Td>
                            <Td>{request.fromUserId.name}</Td>
                            <Td>{request.toUserId.name}</Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm"><strong>Offers:</strong> {request.skillOffered}</Text>
                                <Text fontSize="sm"><strong>Wants:</strong> {request.skillWanted}</Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Badge colorScheme={
                                request.status === 'accepted' ? 'green' :
                                request.status === 'rejected' ? 'red' :
                                request.status === 'cancelled' ? 'gray' :
                                request.status === 'completed' ? 'blue' : 'yellow'
                              }>
                                {request.status}
                              </Badge>
                            </Td>
                            <Td>{new Date(request.createdAt).toLocaleDateString()}</Td>
                            <Td>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleDeleteRequest(request._id)}
                              >
                                Delete
                              </Button>
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </Box>

                {/* Pagination */}
                <Flex justify="center" gap={2}>
                  <Button
                    size="sm"
                    disabled={requestsPage === 1}
                    onClick={() => setRequestsPage(requestsPage - 1)}
                  >
                    Previous
                  </Button>
                  <Text>Page {requestsPage} of {Math.ceil(requestsTotal / 20)}</Text>
                  <Button
                    size="sm"
                    disabled={requestsPage >= Math.ceil(requestsTotal / 20)}
                    onClick={() => setRequestsPage(requestsPage + 1)}
                  >
                    Next
                  </Button>
                </Flex>
              </VStack>
            </TabPanel>

            {/* Admin Messages Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Header with Create Button */}
                <Flex justify="space-between" align="center">
                  <Heading size="md">Admin Messages</Heading>
                  <Button colorScheme="blue" onClick={() => setIsMessageModalOpen(true)}>
                    Create Message
                  </Button>
                </Flex>

                {/* Filters */}
                <Flex gap={4} wrap="wrap">
                  <Select
                    placeholder="Filter by status"
                    value={messageActive}
                    onChange={(e) => setMessageActive(e.target.value)}
                    maxW="200px"
                  >
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                  </Select>
                </Flex>

                {/* Bulk Actions */}
                {selectedMessages.length > 0 && (
                  <Alert status="info">
                    <AlertIcon />
                    {selectedMessages.length} messages selected
                    <Button size="sm" ml={4} colorScheme="red" variant="outline" onClick={handleBulkDeleteMessages}>
                      Delete Selected
                    </Button>
                  </Alert>
                )}

                {/* Messages Table */}
                <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>
                          <input
                            type="checkbox"
                            checked={selectedMessages.length === messages.length && messages.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMessages(messages.map(m => m._id));
                              } else {
                                setSelectedMessages([]);
                              }
                            }}
                          />
                        </Th>
                        <Th>Title</Th>
                        <Th>Type</Th>
                        <Th>Status</Th>
                        <Th>Created By</Th>
                        <Th>Created</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {messagesLoading ? (
                        <Tr>
                          <Td colSpan={7} textAlign="center">
                            <Spinner />
                          </Td>
                        </Tr>
                      ) : messages.length === 0 ? (
                        <Tr>
                          <Td colSpan={7} textAlign="center">
                            No messages found
                          </Td>
                        </Tr>
                      ) : (
                        messages.map((message) => (
                          <Tr key={message._id}>
                            <Td>
                              <input
                                type="checkbox"
                                checked={selectedMessages.includes(message._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMessages([...selectedMessages, message._id]);
                                  } else {
                                    setSelectedMessages(selectedMessages.filter(id => id !== message._id));
                                  }
                                }}
                              />
                            </Td>
                            <Td>{message.title}</Td>
                            <Td>
                              <Badge colorScheme={
                                message.type === 'announcement' ? 'blue' :
                                message.type === 'warning' ? 'red' : 'gray'
                              }>
                                {message.type}
                              </Badge>
                            </Td>
                            <Td>
                              <Switch
                                isChecked={message.isActive}
                                onChange={(e) => handleUpdateMessage(message._id, { isActive: e.target.checked })}
                              />
                            </Td>
                            <Td>{message.createdBy.name}</Td>
                            <Td>{new Date(message.createdAt).toLocaleDateString()}</Td>
                            <Td>
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMessage(message);
                                    setMessageForm({
                                      title: message.title,
                                      message: message.message,
                                      type: message.type,
                                      expiresAt: message.expiresAt || '',
                                      isActive: message.isActive
                                    });
                                    setIsMessageModalOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="outline"
                                  onClick={() => handleDeleteMessage(message._id)}
                                >
                                  Delete
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </Box>

                {/* Pagination */}
                <Flex justify="center" gap={2}>
                  <Button
                    size="sm"
                    disabled={messagesPage === 1}
                    onClick={() => setMessagesPage(messagesPage - 1)}
                  >
                    Previous
                  </Button>
                  <Text>Page {messagesPage} of {Math.ceil(messagesTotal / 20)}</Text>
                  <Button
                    size="sm"
                    disabled={messagesPage >= Math.ceil(messagesTotal / 20)}
                    onClick={() => setMessagesPage(messagesPage + 1)}
                  >
                    Next
                  </Button>
                </Flex>
              </VStack>
            </TabPanel>

            {/* Reports & Analytics Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Period Selector */}
                <Flex gap={4} align="center">
                  <Text fontWeight="bold">Report Period:</Text>
                  <Select
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    maxW="150px"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </Select>
                </Flex>

                {reportsLoading ? (
                  <VStack spacing={4}>
                    <Spinner size="xl" />
                    <Text>Loading reports...</Text>
                  </VStack>
                ) : reportData ? (
                  <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                    {/* Top Skills */}
                    <GridItem>
                      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                        <Heading size="md" mb={4}>Top Skills Offered</Heading>
                        <VStack align="stretch" spacing={2}>
                          {reportData.topSkillsOffered.map((skill, index) => (
                            <Flex key={skill._id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                              <Text>{skill._id}</Text>
                              <Badge colorScheme="blue">{skill.count}</Badge>
                            </Flex>
                          ))}
                        </VStack>
                      </Box>
                    </GridItem>

                    <GridItem>
                      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                        <Heading size="md" mb={4}>Top Skills Wanted</Heading>
                        <VStack align="stretch" spacing={2}>
                          {reportData.topSkillsWanted.map((skill, index) => (
                            <Flex key={skill._id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                              <Text>{skill._id}</Text>
                              <Badge colorScheme="green">{skill.count}</Badge>
                            </Flex>
                          ))}
                        </VStack>
                      </Box>
                    </GridItem>

                    {/* User Registrations */}
                    <GridItem colSpan={{ base: 1, lg: 2 }}>
                      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                        <Heading size="md" mb={4}>User Registrations (Last {reportData.period} days)</Heading>
                        <VStack align="stretch" spacing={2}>
                          {reportData.userRegistrations.map((day) => (
                            <Flex key={day._id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                              <Text>{day._id}</Text>
                              <Badge colorScheme="purple">{day.count} new users</Badge>
                            </Flex>
                          ))}
                        </VStack>
                      </Box>
                    </GridItem>

                    {/* Swap Request Trends */}
                    <GridItem colSpan={{ base: 1, lg: 2 }}>
                      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                        <Heading size="md" mb={4}>Swap Request Trends (Last {reportData.period} days)</Heading>
                        <VStack align="stretch" spacing={2}>
                          {reportData.swapRequests.map((request) => (
                            <Flex key={`${request._id.date}-${request._id.status}`} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                              <Text>{request._id.date} - {request._id.status}</Text>
                              <Badge colorScheme={
                                request._id.status === 'accepted' ? 'green' :
                                request._id.status === 'rejected' ? 'red' :
                                request._id.status === 'cancelled' ? 'gray' : 'yellow'
                              }>
                                {request.count} requests
                              </Badge>
                            </Flex>
                          ))}
                        </VStack>
                      </Box>
                    </GridItem>
                  </Grid>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    No report data available
                  </Alert>
                )}
              </VStack>
            </TabPanel>

            {/* Recent Activity Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {dashboardData && (
                  <>
                    {/* Recent Users */}
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                      <Heading size="md" mb={4}>Recent Users</Heading>
                      <VStack align="stretch" spacing={3}>
                        {dashboardData.recentActivity.users.map((user) => (
                          <Box key={user._id} p={3} border="1px" borderColor="gray.200" borderRadius="md">
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{user.name}</Text>
                                <Text fontSize="sm" color="gray.600">{user.email}</Text>
                              </VStack>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </Text>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>

                    {/* Recent Requests */}
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                      <Heading size="md" mb={4}>Recent Swap Requests</Heading>
                      <VStack align="stretch" spacing={3}>
                        {dashboardData.recentActivity.requests.map((request) => (
                          <Box key={request._id} p={3} border="1px" borderColor="gray.200" borderRadius="md">
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">
                                  {request.fromUserId.name} → {request.toUserId.name}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {request.fromUserId.email} → {request.toUserId.email}
                                </Text>
                              </VStack>
                              <VStack align="end" spacing={1}>
                                <Badge colorScheme={
                                  request.status === 'accepted' ? 'green' :
                                  request.status === 'rejected' ? 'red' :
                                  request.status === 'cancelled' ? 'gray' : 'yellow'
                                }>
                                  {request.status}
                                </Badge>
                                <Text fontSize="sm" color="gray.500">
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </Text>
                              </VStack>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  </>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Message Modal */}
      <Modal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedMessage ? 'Edit Admin Message' : 'Create Admin Message'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={messageForm.title}
                  onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                  placeholder="Enter message title"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Message</FormLabel>
                <Textarea
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  placeholder="Enter message content"
                  rows={4}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select
                  value={messageForm.type}
                  onChange={(e) => setMessageForm({ ...messageForm, type: e.target.value as any })}
                >
                  <option value="announcement">Announcement</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Expires At (Optional)</FormLabel>
                <Input
                  type="datetime-local"
                  value={messageForm.expiresAt}
                  onChange={(e) => setMessageForm({ ...messageForm, expiresAt: e.target.value })}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Active</FormLabel>
                <Switch
                  isChecked={messageForm.isActive}
                  onChange={(e) => setMessageForm({ ...messageForm, isActive: e.target.checked })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsMessageModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateMessage}>
              {selectedMessage ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Admin; 