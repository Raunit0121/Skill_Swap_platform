import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminMessageDisplay from '../components/AdminMessageDisplay';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container maxW="container.sm" py={10}>
        <VStack>
          <Heading>Please log in to view your dashboard</Heading>
          <RouterLink to="/login">
            <Button colorScheme="brand">Login</Button>
          </RouterLink>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack>
        {/* Admin Messages */}
        <AdminMessageDisplay />

        {/* Welcome Section */}
        <Box w="100%" bg="white" p={6} borderRadius="lg" shadow="sm">
          <Heading size="lg" mb={2}>
            Welcome back, {user.name}! 👋
          </Heading>
          <Text color="gray.600">
            Ready to learn something new or share your expertise?
          </Text>
        </Box>

        {/* Quick Actions */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} w="100%">
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <VStack>
              <Heading size="md">Find Skills</Heading>
              <Text textAlign="center" color="gray.600">
                Discover people who can teach you new skills
              </Text>
              <RouterLink to="/search">
                <Button colorScheme="brand" size="sm">
                  Browse Skills
                </Button>
              </RouterLink>
            </VStack>
          </Box>

          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <VStack>
              <Heading size="md">Manage Requests</Heading>
              <Text textAlign="center" color="gray.600">
                View and respond to skill swap requests
              </Text>
              <RouterLink to="/requests">
                <Button colorScheme="brand" size="sm">
                  View Requests
                </Button>
              </RouterLink>
            </VStack>
          </Box>

          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <VStack>
              <Heading size="md">Update Profile</Heading>
              <Text textAlign="center" color="gray.600">
                Keep your skills and availability up to date
              </Text>
              <RouterLink to={`/profile/${user._id}`}>
                <Button colorScheme="brand" size="sm">
                  Edit Profile
                </Button>
              </RouterLink>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Skills Section */}
        <Box w="100%" bg="white" p={6} borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>
            Your Skills
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Box>
              <Text fontWeight="bold" mb={3} color="green.600">
                Skills You Offer
              </Text>
              {user.skillsOffered.length > 0 ? (
                <HStack flexWrap="wrap">
                  {user.skillsOffered.map((skill, index) => (
                    <Badge key={index} colorScheme="green" p={2}>
                      {skill}
                    </Badge>
                  ))}
                </HStack>
              ) : (
                <Text color="gray.500">No skills added yet</Text>
              )}
            </Box>

            <Box>
              <Text fontWeight="bold" mb={3} color="blue.600">
                Skills You Want to Learn
              </Text>
              {user.skillsWanted.length > 0 ? (
                <HStack flexWrap="wrap">
                  {user.skillsWanted.map((skill, index) => (
                    <Badge key={index} colorScheme="blue" p={2}>
                      {skill}
                    </Badge>
                  ))}
                </HStack>
              ) : (
                <Text color="gray.500">No skills added yet</Text>
              )}
            </Box>
          </SimpleGrid>
        </Box>

        {/* Availability Section */}
        <Box w="100%" bg="white" p={6} borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>
            Your Availability
          </Heading>
          {user.availability.length > 0 ? (
            <HStack flexWrap="wrap">
              {user.availability.map((time, index) => (
                <Badge key={index} colorScheme="purple" p={2}>
                  {time}
                </Badge>
              ))}
            </HStack>
          ) : (
            <Text color="gray.500">No availability set</Text>
          )}
        </Box>

        {/* Profile Status */}
        <Box w="100%" bg="white" p={6} borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>
            Profile Status
          </Heading>
          <HStack>
            <Text>Profile Visibility:</Text>
            <Badge colorScheme={user.isPublic ? "green" : "red"}>
              {user.isPublic ? "Public" : "Private"}
            </Badge>
          </HStack>
          {user.location && (
            <Text mt={2} color="gray.600">
              Location: {user.location}
            </Text>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default Dashboard; 