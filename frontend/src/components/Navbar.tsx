import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { swapAPI } from '../services/api';

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const fetchPendingRequests = async () => {
    if (!user) {
      setPendingRequestsCount(0);
      return;
    }

    try {
      const response = await swapAPI.getMyRequests({ 
        type: 'received', 
        status: 'pending',
        limit: 100 // Get all pending requests to count them
      });
      setPendingRequestsCount(response.requests?.length || 0);
    } catch (error) {
      // Silently handle error, don't show notification dot if we can't fetch
      console.error('Failed to fetch pending requests:', error);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [user]);

  // Refresh pending count when user visits requests page (they might have taken actions)
  useEffect(() => {
    if (location.pathname === '/requests') {
      // Small delay to ensure any actions have been processed
      const timer = setTimeout(() => {
        fetchPendingRequests();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Listen for custom events when requests are updated
  useEffect(() => {
    const handleRequestUpdate = () => {
      fetchPendingRequests();
    };

    window.addEventListener('requestUpdated', handleRequestUpdate);
    return () => {
      window.removeEventListener('requestUpdated', handleRequestUpdate);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ children, to, showNotification = false }: { children: React.ReactNode; to: string; showNotification?: boolean }) => (
    <RouterLink to={to}>
      <Box position="relative">
        <Text
          px={2}
          py={1}
          rounded={'md'}
          _hover={{
            textDecoration: 'none',
            bg: 'gray.200',
          }}
        >
          {children}
        </Text>
        {showNotification && (
          <Badge
            position="absolute"
            top="-2"
            right="-2"
            colorScheme="red"
            borderRadius="full"
            fontSize="xs"
            minW="20px"
            h="20px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {pendingRequestsCount}
          </Badge>
        )}
      </Box>
    </RouterLink>
  );

  return (
    <Box bg="white" px={4} shadow="sm" position="fixed" w="100%" zIndex={1000}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        {/* Logo on the left */}
        <RouterLink to="/">
          <Text fontSize="xl" fontWeight="bold" color="blue.500">
            Skill Swap
          </Text>
        </RouterLink>

        {/* Centered nav options */}
        <Flex flex={1} justifyContent="center">
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/search">Search</NavLink>
            {user && <NavLink to="/dashboard">Dashboard</NavLink>}
            {user && <NavLink to="/requests" showNotification={pendingRequestsCount > 0}>Requests</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          </HStack>
        </Flex>

        {/* User actions on the right */}
        <Flex alignItems={'center'}>
          <HStack>
            {!user && (
              <RouterLink to="/login">
                <Button variant={'ghost'}>Login</Button>
              </RouterLink>
            )}
            {!user && (
              <RouterLink to="/register">
                <Button colorScheme="blue">Sign Up</Button>
              </RouterLink>
            )}
            {user && (
              <>
                <Text fontSize="sm" color="gray.600">
                  Welcome, {user.name}
                </Text>
                <RouterLink to={`/profile/${user._id}`}>
                  <Button size="sm" variant="ghost">
                    Profile
                  </Button>
                </RouterLink>
                <Button size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
          </HStack>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/search">Search</NavLink>
            {user && <NavLink to="/dashboard">Dashboard</NavLink>}
            {user && <NavLink to="/requests" showNotification={pendingRequestsCount > 0}>Requests</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default Navbar; 