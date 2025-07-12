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
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminMessageDisplay from '../components/AdminMessageDisplay';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      title: 'Learn New Skills',
      description: 'Connect with experts and learn skills you want to master.',
      icon: '🎓',
    },
    {
      title: 'Share Your Knowledge',
      description: 'Teach others what you know and build your reputation.',
      icon: '💡',
    },
    {
      title: 'Build Connections',
      description: 'Network with like-minded people in your community.',
      icon: '🤝',
    },
    {
      title: 'Flexible Learning',
      description: 'Learn at your own pace with flexible scheduling.',
      icon: '⏰',
    },
  ];

  return (
    <Box>
      {/* Admin Messages */}
      <Container maxW="container.xl" pt={8}>
        <AdminMessageDisplay />
      </Container>

      {/* Hero Section */}
      <Box bg="blue.500" color="white" py={20}>
        <Container maxW="container.xl">
          <VStack textAlign="center">
            <Heading size="2xl" fontWeight="bold">
              Swap Skills, Grow Together
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              Connect with people who have the skills you want to learn, and share your expertise in return. 
              Build meaningful relationships while expanding your knowledge.
            </Text>
            <HStack>
              {!user ? (
                <>
                  <RouterLink to="/register">
                    <Button size="lg" colorScheme="white" variant="outline">
                      Get Started
                    </Button>
                  </RouterLink>
                  <RouterLink to="/search">
                    <Button size="lg" bg="white" color="blue.500">
                      Browse Skills
                    </Button>
                  </RouterLink>
                </>
              ) : (
                <>
                  <RouterLink to="/dashboard">
                    <Button size="lg" colorScheme="white" variant="outline">
                      Go to Dashboard
                    </Button>
                  </RouterLink>
                  <RouterLink to="/search">
                    <Button size="lg" bg="white" color="blue.500">
                      Find Skills
                    </Button>
                  </RouterLink>
                </>
              )}
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack>
            <VStack textAlign="center">
              <Heading size="xl">Why Choose Skill Swap?</Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Our platform makes it easy to find learning partners and share your expertise 
                in a collaborative, supportive environment.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }}>
              {features.map((feature, index) => (
                <VStack key={index} textAlign="center" p={6}>
                  <Box fontSize="4xl">{feature.icon}</Box>
                  <Heading size="md">{feature.title}</Heading>
                  <Text color="gray.600">{feature.description}</Text>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bg="gray.50" py={20}>
        <Container maxW="container.xl">
          <VStack textAlign="center">
            <Heading size="xl">Ready to Start Learning?</Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Join thousands of learners who are already swapping skills and growing together.
            </Text>
            {!user ? (
              <RouterLink to="/register">
                <Button size="lg" colorScheme="blue">
                  Join Skill Swap Today
                </Button>
              </RouterLink>
            ) : (
              <RouterLink to="/search">
                <Button size="lg" colorScheme="blue">
                  Find Your Next Skill
                </Button>
              </RouterLink>
            )}
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 