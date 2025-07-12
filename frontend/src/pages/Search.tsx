import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  Badge,
  SimpleGrid,
  Spinner,
  Select,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { swapAPI } from '../services/api';
import { useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Textarea } from '@chakra-ui/react';

interface User {
  _id: string;
  name: string;
  location?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
}

const Search = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedOffered, setSelectedOffered] = useState('');
  const [selectedWanted, setSelectedWanted] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const params: any = {};
        if (searchTerm) params.skill = searchTerm; // backend supports skill param for both name and skill
        if (selectedSkill) params.skill = selectedSkill;
        const res = await userAPI.searchUsers(params);
        setUsers(res.users || []);
      } catch (err: any) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [searchTerm, selectedSkill]);

  const handleSendRequest = async () => {
    if (!selectedUser || !selectedOffered || !selectedWanted) return;
    setSending(true);
    try {
      await swapAPI.createRequest({
        toUserId: selectedUser._id,
        skillOffered: selectedOffered,
        skillWanted: selectedWanted,
        proposedDate: new Date().toISOString(),
        message: requestMessage,
      });
      toast({ title: 'Request sent!', status: 'success', duration: 3000 });
      setSelectedUser(null);
      setRequestMessage('');
      setSelectedOffered('');
      setSelectedWanted('');
      onClose();
    } catch (err: any) {
      toast({ title: 'Failed to send request', status: 'error', duration: 3000 });
    } finally {
      setSending(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack>
        <Heading size="xl" mb={6}>
          Find Skill Partners
        </Heading>
        <Text color="gray.600" textAlign="center" mb={8}>
          Search for people who can teach you the skills you want to learn
        </Text>

        {/* Search and Filter */}
        <Box w="100%" bg="white" p={6} borderRadius="lg" shadow="sm">
          <VStack>
            <Input
              placeholder="Search by name or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="lg"
            />
          </VStack>
        </Box>

        {/* Results */}
        <Box w="100%">
          {loading ? (
            <Box textAlign="center" py={10}><Spinner size="xl" /></Box>
          ) : error ? (
            <Box textAlign="center" py={10} color="red.500">{error}</Box>
          ) : (
            <>
              <Text fontWeight="bold" mb={4}>
                Found {users.length} users
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }}>
                {users.map((user) => (
                  <Box key={user._id} bg="white" p={6} borderRadius="lg" shadow="sm">
                    <VStack align="start">
                      <Heading size="md">{user.name}</Heading>
                      {user.location && (
                        <Text color="gray.600">📍 {user.location}</Text>
                      )}
                      <Box w="100%">
                        <Text fontWeight="bold" color="green.600" mb={2}>
                          Offers:
                        </Text>
                        <HStack flexWrap="wrap">
                          {user.skillsOffered.map((skill, index) => (
                            <Badge key={index} colorScheme="green" size="sm">
                              {skill}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                      <Box w="100%">
                        <Text fontWeight="bold" color="blue.600" mb={2}>
                          Wants to Learn:
                        </Text>
                        <HStack flexWrap="wrap">
                          {user.skillsWanted.map((skill, index) => (
                            <Badge key={index} colorScheme="blue" size="sm">
                              {skill}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                      <Box w="100%">
                        <Text fontWeight="bold" color="purple.600" mb={2}>
                          Available:
                        </Text>
                        <HStack flexWrap="wrap">
                          {user.availability.map((time, index) => (
                            <Badge key={index} colorScheme="purple" size="sm">
                              {time}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                      <HStack>
                        <RouterLink to={`/profile/${user._id}`}>
                          <Button colorScheme="brand" size="sm">
                            View Profile
                          </Button>
                        </RouterLink>
                        <Button colorScheme="blue" size="sm" onClick={() => { setSelectedUser(user); onOpen(); }}>
                          Send Request
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
              {users.length === 0 && (
                <Box textAlign="center" py={10}>
                  <Text color="gray.500" fontSize="lg">
                    No users found matching your search criteria.
                  </Text>
                  <Text color="gray.400">
                    Try adjusting your search terms.
                  </Text>
                </Box>
              )}
            </>
          )}
        </Box>
      </VStack>

      {/* Modal for sending request */}
      <Modal isOpen={!!selectedUser && isOpen} onClose={() => { setSelectedUser(null); onClose(); setSelectedOffered(''); setSelectedWanted(''); }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Swap Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Send a skill swap request to <b>{selectedUser?.name}</b></Text>
              
              <Box w="100%">
                <Text mb={2}>What skill do you want to learn?</Text>
                <Select
                  placeholder="Select skill you want to learn"
                  value={selectedWanted}
                  onChange={(e) => setSelectedWanted(e.target.value)}
                >
                  {selectedUser?.skillsWanted.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </Select>
              </Box>

              <Box w="100%">
                <Text mb={2}>What skill can you offer in return?</Text>
                <Select
                  placeholder="Select skill you can offer"
                  value={selectedOffered}
                  onChange={(e) => setSelectedOffered(e.target.value)}
                >
                  {selectedUser?.skillsOffered.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </Select>
              </Box>

              <Box w="100%">
                <Text mb={2}>Message (optional):</Text>
                <Textarea
                  placeholder="Add a personal message..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={3}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { setSelectedUser(null); onClose(); setSelectedOffered(''); setSelectedWanted(''); }}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSendRequest}
              isLoading={sending}
              isDisabled={!selectedOffered || !selectedWanted}
            >
              Send Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Search; 