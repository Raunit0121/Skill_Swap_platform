import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Input,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <VStack>
        <Heading size="xl" mb={6}>
          Welcome Back
        </Heading>
        <Text color="gray.600" textAlign="center" mb={8}>
          Sign in to your Skill Swap account to continue learning and sharing.
        </Text>

        <Box w="100%" maxW="400px">
          <form onSubmit={handleSubmit}>
            <VStack>
              {error && (
                <Box bg="red.100" color="red.700" p={3} borderRadius="md" w="100%">
                  {error}
                </Box>
              )}

              <Box w="100%">
                <Text mb={2} fontWeight="medium">Email</Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </Box>

              <Box w="100%">
                <Text mb={2} fontWeight="medium">Password</Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="100%"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </VStack>
          </form>

          <VStack mt={6}>
            <Text color="gray.600">
              Don't have an account?{' '}
              <RouterLink to="/register">
                <Link color="blue.500">Sign up</Link>
              </RouterLink>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Login; 