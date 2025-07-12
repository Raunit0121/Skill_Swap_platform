import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Input,
  Textarea,
  Switch,
} from '@chakra-ui/react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    location: user?.location || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
    availability: user?.availability || [],
    isPublic: user?.isPublic || true,
  });

  const isOwnProfile = user?._id === id;

  // Mock user data - in real app this would come from API
  const profileUser = isOwnProfile ? user : {
    _id: id,
    name: 'Alice Johnson',
    location: 'New York',
    skillsOffered: ['JavaScript', 'React', 'Node.js'],
    skillsWanted: ['Python', 'Machine Learning'],
    availability: ['Evenings', 'Weekends'],
    isPublic: true,
  };

  const handleSave = () => {
    // TODO: Implement API call to save profile
    console.log('Saving profile:', editData);
    setIsEditing(false);
  };

  const addSkill = (type: 'offered' | 'wanted') => {
    const skill = prompt(`Enter ${type} skill:`);
    if (skill) {
      setEditData(prev => ({
        ...prev,
        [type === 'offered' ? 'skillsOffered' : 'skillsWanted']: [
          ...prev[type === 'offered' ? 'skillsOffered' : 'skillsWanted'],
          skill
        ]
      }));
    }
  };

  const removeSkill = (type: 'offered' | 'wanted', skill: string) => {
    setEditData(prev => ({
      ...prev,
      [type === 'offered' ? 'skillsOffered' : 'skillsWanted']: 
        prev[type === 'offered' ? 'skillsOffered' : 'skillsWanted'].filter(s => s !== skill)
    }));
  };

  if (!profileUser) {
    return (
      <Container maxW="container.sm" py={10}>
        <VStack>
          <Heading>Profile not found</Heading>
          <RouterLink to="/search">
            <Button colorScheme="brand">Back to Search</Button>
          </RouterLink>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack>
        {/* Header */}
        <Box w="100%" bg="white" p={6} borderRadius="lg" shadow="sm">
          <HStack justify="space-between" align="start">
            <VStack align="start">
              <Heading size="lg">{profileUser.name}</Heading>
              {profileUser.location && (
                <Text color="gray.600">📍 {profileUser.location}</Text>
              )}
              <HStack>
                <Text>Profile Status:</Text>
                <Badge colorScheme={profileUser.isPublic ? "green" : "red"}>
                  {profileUser.isPublic ? "Public" : "Private"}
                </Badge>
              </HStack>
            </VStack>
            
            {isOwnProfile && (
              <HStack>
                <RouterLink to="/edit-profile">
                  <Button colorScheme="blue" variant="outline">Edit Profile</Button>
                </RouterLink>
              </HStack>
            )}
          </HStack>
        </Box>

        {/* Skills Section */}
        <Box w="100%" bg="white" p={6} borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>
            Skills
          </Heading>
          
          <VStack align="start" w="100%">
            <Box w="100%">
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="bold" color="green.600">
                  Skills Offered
                </Text>
                {isEditing && isOwnProfile && (
                  <Button size="sm" onClick={() => addSkill('offered')}>
                    + Add Skill
                  </Button>
                )}
              </HStack>
              <HStack flexWrap="wrap">
                {(isEditing ? editData.skillsOffered : profileUser.skillsOffered).map((skill, index) => (
                  <Badge key={index} colorScheme="green" p={2}>
                    {skill}
                    {isEditing && isOwnProfile && (
                      <Button
                        size="xs"
                        ml={2}
                        colorScheme="red"
                        onClick={() => removeSkill('offered', skill)}
                      >
                        ×
                      </Button>
                    )}
                  </Badge>
                ))}
              </HStack>
            </Box>

            <Box w="100%">
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="bold" color="blue.600">
                  Skills Wanted
                </Text>
                {isEditing && isOwnProfile && (
                  <Button size="sm" onClick={() => addSkill('wanted')}>
                    + Add Skill
                  </Button>
                )}
              </HStack>
              <HStack flexWrap="wrap">
                {(isEditing ? editData.skillsWanted : profileUser.skillsWanted).map((skill, index) => (
                  <Badge key={index} colorScheme="blue" p={2}>
                    {skill}
                    {isEditing && isOwnProfile && (
                      <Button
                        size="xs"
                        ml={2}
                        colorScheme="red"
                        onClick={() => removeSkill('wanted', skill)}
                      >
                        ×
                      </Button>
                    )}
                  </Badge>
                ))}
              </HStack>
            </Box>
          </VStack>
        </Box>

        {/* Availability Section */}
        <Box w="100%" bg="white" p={6} borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>
            Availability
          </Heading>
          <HStack flexWrap="wrap">
            {(isEditing ? editData.availability : profileUser.availability).map((time, index) => (
              <Badge key={index} colorScheme="purple" p={2}>
                {time}
              </Badge>
            ))}
          </HStack>
        </Box>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <Box w="100%" bg="white" p={6} borderRadius="lg" shadow="sm">
            <VStack>
              <Text fontWeight="bold" mb={4}>
                Interested in swapping skills?
              </Text>
              <HStack>
                <Button colorScheme="brand">
                  Send Swap Request
                </Button>
                <RouterLink to="/search">
                  <Button variant="outline">
                    Find More People
                  </Button>
                </RouterLink>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Save Button for Editing */}
        {isEditing && isOwnProfile && (
          <Box w="100%">
            <HStack justify="center">
              <Button colorScheme="brand" onClick={handleSave}>
                Save Changes
              </Button>
            </HStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default Profile; 