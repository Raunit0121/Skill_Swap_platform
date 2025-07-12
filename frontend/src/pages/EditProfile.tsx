import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  Switch,
  Tag,
  TagLabel,
  TagCloseButton,
  Avatar,
  IconButton,
  Select,
  useToast,
  FormLabel,
  FormControl,
  FormHelperText,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AVAILABILITY_OPTIONS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
  'saturday', 'sunday', 'weekdays', 'weekends', 'evenings', 'mornings', 'afternoons'
];

const EditProfile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    location: user?.location || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
    availability: user?.availability || [],
    isPublic: user?.isPublic ?? true,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(user?.profilePhotoUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSkill, setNewSkill] = useState({ offered: '', wanted: '' });

  // Handle text/boolean changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle availability multi-select
  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setForm((prev) => ({ ...prev, availability: selected }));
  };

  // Handle skill add/remove
  const addSkill = (type: 'skillsOffered' | 'skillsWanted') => {
    const skill = newSkill[type === 'skillsOffered' ? 'offered' : 'wanted'].trim();
    console.log('Adding skill:', skill, 'to type:', type);
    console.log('Current form state:', form);
    
    if (skill && skill.length <= 50 && !form[type].includes(skill)) {
      setForm((prev) => ({
        ...prev,
        [type]: [...prev[type], skill]
      }));
      setNewSkill((prev) => ({ ...prev, [type === 'skillsOffered' ? 'offered' : 'wanted']: '' }));
      console.log('Skill added successfully');
    } else {
      console.log('Skill validation failed:', { skill, length: skill?.length, alreadyExists: form[type].includes(skill) });
    }
  };
  const removeSkill = (type: 'skillsOffered' | 'skillsWanted', skill: string) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].filter((s) => s !== skill)
    }));
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('location', form.location);
      formData.append('isPublic', String(form.isPublic));
      form.skillsOffered.forEach((s) => formData.append('skillsOffered', s));
      form.skillsWanted.forEach((s) => formData.append('skillsWanted', s));
      form.availability.forEach((a) => formData.append('availability', a));
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      console.log('Submitting form data:');
      console.log('Skills offered:', form.skillsOffered);
      console.log('Skills wanted:', form.skillsWanted);
      
      await userAPI.updateProfile(user!._id, formData);
      await refreshUser();
      toast({ title: 'Profile updated!', status: 'success', duration: 3000 });
      navigate('/profile/' + user!._id);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <VStack spacing={8} align="stretch">
          {/* Profile Header */}
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Flex align="center">
              <Box position="relative" mr={6}>
                <Avatar size="2xl" src={imagePreview} name={form.name} />
                <IconButton
                  icon={<EditIcon />}
                  aria-label="Edit profile picture"
                  size="sm"
                  position="absolute"
                  bottom={0}
                  right={0}
                  onClick={() => fileInputRef.current?.click()}
                  bg="white"
                  borderRadius="full"
                  boxShadow="md"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  display="none"
                />
              </Box>
              <VStack align="start" spacing={2} flex={1}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input name="name" value={form.name} onChange={handleChange} required maxLength={50} />
                </FormControl>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input name="location" value={form.location} onChange={handleChange} maxLength={100} />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="isPublic" mb="0">Profile Public?</FormLabel>
                  <Switch id="isPublic" name="isPublic" isChecked={form.isPublic} onChange={handleChange} />
                </FormControl>
              </VStack>
            </Flex>
          </Box>

          {/* Skills Section */}
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>Skills Offered</Heading>
            <HStack flexWrap="wrap" mb={2}>
              {form.skillsOffered.map((skill, idx) => (
                <Tag key={idx} colorScheme="green" borderRadius="full" m={1}>
                  <TagLabel>{skill}</TagLabel>
                  <TagCloseButton onClick={() => removeSkill('skillsOffered', skill)} />
                </Tag>
              ))}
            </HStack>
            <HStack>
              <Input
                placeholder="Add a skill you offer"
                value={newSkill.offered}
                onChange={e => setNewSkill(prev => ({ ...prev, offered: e.target.value }))}
                maxLength={50}
                size="sm"
                w="200px"
              />
              <Button size="sm" onClick={() => addSkill('skillsOffered')}>Add</Button>
            </HStack>

            <Heading size="md" mt={6} mb={4}>Skills Wanted</Heading>
            <HStack flexWrap="wrap" mb={2}>
              {form.skillsWanted.map((skill, idx) => (
                <Tag key={idx} colorScheme="blue" borderRadius="full" m={1}>
                  <TagLabel>{skill}</TagLabel>
                  <TagCloseButton onClick={() => removeSkill('skillsWanted', skill)} />
                </Tag>
              ))}
            </HStack>
            <HStack>
              <Input
                placeholder="Add a skill you want"
                value={newSkill.wanted}
                onChange={e => setNewSkill(prev => ({ ...prev, wanted: e.target.value }))}
                maxLength={50}
                size="sm"
                w="200px"
              />
              <Button size="sm" onClick={() => addSkill('skillsWanted')}>Add</Button>
            </HStack>
          </Box>

          {/* Availability Section */}
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <FormControl>
              <FormLabel>Availability</FormLabel>
              <Select
                name="availability"
                multiple
                value={form.availability}
                onChange={handleAvailabilityChange}
                height="auto"
              >
                {AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
              <FormHelperText>Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</FormHelperText>
            </FormControl>
          </Box>

          {/* Error and Save Button */}
          {error && <Box bg="red.100" color="red.700" p={3} borderRadius="md">{error}</Box>}
          <Button type="submit" colorScheme="blue" size="lg" isLoading={isLoading} alignSelf="center">
            Save Changes
          </Button>
        </VStack>
      </form>
    </Container>
  );
};

export default EditProfile; 