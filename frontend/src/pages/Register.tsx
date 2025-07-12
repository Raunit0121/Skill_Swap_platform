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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        location: formData.location,
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <VStack>
        <Heading size="xl" mb={6}>
          Join Skill Swap
        </Heading>
        <Text color="gray.600" textAlign="center" mb={8}>
          Create your account and start swapping skills with others.
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
                <Text mb={2} fontWeight="medium">Full Name</Text>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </Box>

              <Box w="100%">
                <Text mb={2} fontWeight="medium">Email</Text>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </Box>

              <Box w="100%">
                <Text mb={2} fontWeight="medium">Location (Optional)</Text>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter your city"
                />
              </Box>

              <Box w="100%">
                <Text mb={2} fontWeight="medium">Password</Text>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                />
              </Box>

              <Box w="100%">
                <Text mb={2} fontWeight="medium">Confirm Password</Text>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </VStack>
          </form>

          <VStack mt={6}>
            <Text color="gray.600">
              Already have an account?{' '}
              <RouterLink to="/login">
                <Link color="blue.500">Sign in</Link>
              </RouterLink>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Register; 