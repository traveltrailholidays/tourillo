'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateItineraryWithFormData } from '@/lib/actions/itinerary-actions';
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Plus,
  Minus,
  Copy,
  Clipboard,
  RefreshCw,
  FileImage,
  Hotel,
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { DEFAULT_INCLUSIONS, DEFAULT_EXCLUSIONS, ROOM_TYPES, CAB_OPTIONS } from '@/data/itinerary';
import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/image-compression';
import { getAllAgents } from '@/lib/actions/user-actions';

// Type for itinerary from database
interface ItineraryData {
  id: string;
  travelId: string;
  company: 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS';
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  packageTitle: string;
  numberOfDays: number;
  numberOfNights: number;
  numberOfHotels: number;
  tripAdvisorName: string;
  tripAdvisorNumber: string;
  cabs: string;
  flights: string;
  quotePrice: number;
  pricePerPerson: number;
  days: Array<{
    dayNumber: number;
    summary: string;
    imageSrc: string;
    description: string;
  }>;
  hotels: Array<{
    placeName: string;
    placeDescription: string;
    hotelName: string;
    roomType: string;
    hotelDescription: string;
  }>;
  inclusions: string[];
  exclusions: string[];
  createdAt: string;
  updatedAt: string;
}

interface EditItineraryFormProps {
  itinerary: ItineraryData;
}

export default function EditItineraryForm({ itinerary }: EditItineraryFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState(itinerary.numberOfDays);
  const [numberOfNights, setNumberOfNights] = useState(itinerary.numberOfNights);
  const [numberOfHotels, setNumberOfHotels] = useState(itinerary.numberOfHotels);
  const [dayImagePreviews, setDayImagePreviews] = useState<{ [key: number]: string }>({});
  const [compressedImages, setCompressedImages] = useState<{ [key: number]: File }>({});
  const [dragActiveStates, setDragActiveStates] = useState<{ [key: number]: boolean }>({});
  const [hasExistingImages, setHasExistingImages] = useState<{ [key: number]: boolean }>({});

  const [inclusions, setInclusions] = useState<string[]>(itinerary.inclusions);
  const [exclusions, setExclusions] = useState<string[]>(itinerary.exclusions);
  const [bulkInclusionText, setBulkInclusionText] = useState('');
  const [bulkExclusionText, setBulkExclusionText] = useState('');

  // Custom Room Type & Cab states
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<{ [key: number]: string }>({});
  const [customRoomTypes, setCustomRoomTypes] = useState<{ [key: number]: string }>({});
  const [customCab, setCustomCab] = useState('');
  const [selectedCab, setSelectedCab] = useState(itinerary.cabs);

  // Agent dropdown states
  const [agents, setAgents] = useState<any[]>([]);
  const [agentName, setAgentName] = useState(itinerary.tripAdvisorName);
  const [agentPhone, setAgentPhone] = useState(itinerary.tripAdvisorNumber);
  const [agentsLoaded, setAgentsLoaded] = useState(false);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Day fields state
  const [dayFields, setDayFields] = useState(itinerary.days);

  // Hotel fields state
  const [hotelFields, setHotelFields] = useState(itinerary.hotels);

  // Load agents on component mount
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await getAllAgents();
        setAgents(data);
        setAgentsLoaded(true);

        // Verify if the current agent exists in the loaded agents
        const existingAgent = data.find((agent: any) => agent.name === itinerary.tripAdvisorName);

        if (existingAgent) {
          // Agent exists in the list, ensure values are set correctly
          // Use nullish coalescing to handle null values
          setAgentName(existingAgent.name ?? itinerary.tripAdvisorName);
          // Keep the DB phone value
          setAgentPhone(itinerary.tripAdvisorNumber);
        } else {
          // Agent doesn't exist in list (maybe deleted or custom entry)
          console.warn(`Agent "${itinerary.tripAdvisorName}" not found in agents list. Keeping current values.`);
          // Keep the existing values from DB
          setAgentName(itinerary.tripAdvisorName);
          setAgentPhone(itinerary.tripAdvisorNumber);
        }
      } catch (error) {
        console.error('Failed to load agents:', error);
        setAgentsLoaded(true);
        // Keep DB values if agents fail to load
        setAgentName(itinerary.tripAdvisorName);
        setAgentPhone(itinerary.tripAdvisorNumber);
      }
    };
    loadAgents();
  }, [itinerary.tripAdvisorName, itinerary.tripAdvisorNumber]);

  // Handle Agent Selection
  const handleAgentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setAgentName(selectedName);

    // Find the full agent object to get the phone number
    const selectedAgent = agents.find((agent) => agent.name === selectedName);

    if (selectedAgent && selectedAgent.phone) {
      setAgentPhone(selectedAgent.phone);
    } else {
      // If no phone in agent profile, clear it
      setAgentPhone('');
    }
  };

  // Initialize image previews from existing data
  useEffect(() => {
    const previews: { [key: number]: string } = {};
    const existing: { [key: number]: boolean } = {};

    itinerary.days.forEach((day, index) => {
      if (day.imageSrc) {
        previews[index] = day.imageSrc;
        existing[index] = true;
      }
    });

    setDayImagePreviews(previews);
    setHasExistingImages(existing);
  }, [itinerary.days]);

  // Initialize room types
  useEffect(() => {
    const roomTypeStates: { [key: number]: string } = {};
    itinerary.hotels.forEach((hotel, index) => {
      roomTypeStates[index] = hotel.roomType;
    });
    setSelectedRoomTypes(roomTypeStates);
  }, [itinerary.hotels]);

  // Auto-calculate Number of Nights
  useEffect(() => {
    const nights = Math.max(0, numberOfDays - 1);
    setNumberOfNights(nights);
  }, [numberOfDays]);

  // Handle number of days changes
  useEffect(() => {
    const currentDays = dayFields.length;

    if (numberOfDays > currentDays) {
      const daysToAdd = numberOfDays - currentDays;
      const newDays = [...dayFields];
      for (let i = 0; i < daysToAdd; i++) {
        newDays.push({
          dayNumber: currentDays + i + 1,
          summary: '',
          imageSrc: '',
          description: '',
        });
      }
      setDayFields(newDays);
    } else if (numberOfDays < currentDays) {
      setDayFields(dayFields.slice(0, numberOfDays));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfDays]);

  // ✅ UPDATED: Handle hotels changes - now supports 0 hotels
  useEffect(() => {
    const currentHotels = hotelFields.length;

    if (numberOfHotels > currentHotels) {
      // Adding hotels
      const hotelsToAdd = numberOfHotels - currentHotels;
      const newHotels = [...hotelFields];
      for (let i = 0; i < hotelsToAdd; i++) {
        newHotels.push({
          placeName: '',
          placeDescription: '',
          hotelName: '',
          roomType: '',
          hotelDescription: '',
        });
      }
      setHotelFields(newHotels);
    } else if (numberOfHotels < currentHotels) {
      // Removing hotels (including reducing to 0)
      setHotelFields(numberOfHotels === 0 ? [] : hotelFields.slice(0, numberOfHotels));

      // Clean up room type states for removed hotels
      const newSelectedRoomTypes = { ...selectedRoomTypes };
      const newCustomRoomTypes = { ...customRoomTypes };
      for (let i = numberOfHotels; i < currentHotels; i++) {
        delete newSelectedRoomTypes[i];
        delete newCustomRoomTypes[i];
      }
      setSelectedRoomTypes(newSelectedRoomTypes);
      setCustomRoomTypes(newCustomRoomTypes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfHotels]);

  // Handle Room Type Change
  const handleRoomTypeChange = (index: number, value: string) => {
    setSelectedRoomTypes((prev) => ({ ...prev, [index]: value }));
    if (value !== 'Custom') {
      setCustomRoomTypes((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }
  };

  // Process file with compression
  const processFile = async (file: File, index: number) => {
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Image must be less than 100MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      toast.error('Image must be JPEG, PNG, or WebP format');
      return;
    }

    const originalSizeInMB = file.size / (1024 * 1024);
    const loadingToastId = toast.loading(`Compressing image (${originalSizeInMB.toFixed(2)}MB)...`);

    try {
      const compressed = await compressImage(file);
      const compressedSizeInMB = compressed.size / (1024 * 1024);

      toast.dismiss(loadingToastId);
      toast.success(`Image compressed: ${originalSizeInMB.toFixed(2)}MB → ${compressedSizeInMB.toFixed(2)}MB`, {
        duration: 3000,
      });

      setCompressedImages((prev) => ({ ...prev, [index]: compressed }));
      setHasExistingImages((prev) => ({ ...prev, [index]: false }));

      const reader = new FileReader();
      reader.onload = (event) => {
        setDayImagePreviews((prev) => ({ ...prev, [index]: event.target?.result as string }));
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('Failed to compress image. Please try another image.');
      console.error('Compression error:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, index);
    }
  };

  const handleDrag = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActiveStates((prev) => ({ ...prev, [index]: true }));
    } else if (e.type === 'dragleave') {
      setDragActiveStates((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveStates((prev) => ({ ...prev, [index]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file, index);
    }
  };

  const handleRemoveImage = (index: number) => {
    setDayImagePreviews((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setCompressedImages((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setHasExistingImages((prev) => ({ ...prev, [index]: false }));

    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }

    const updatedDays = [...dayFields];
    updatedDays[index] = { ...updatedDays[index], imageSrc: '' };
    setDayFields(updatedDays);

    toast.success('Image removed');
  };

  const handleImageClick = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  // Handle bulk inclusions paste
  const handleBulkInclusionsPaste = () => {
    if (!bulkInclusionText.trim()) {
      toast.error('Please enter inclusions to add');
      return;
    }

    const lines = bulkInclusionText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      toast.error('No valid inclusions found');
      return;
    }

    setInclusions((prev) => [...prev, ...lines]);
    setBulkInclusionText('');
    toast.success(`Added ${lines.length} inclusion(s)`);
  };

  // Handle bulk exclusions paste
  const handleBulkExclusionsPaste = () => {
    if (!bulkExclusionText.trim()) {
      toast.error('Please enter exclusions to add');
      return;
    }

    const lines = bulkExclusionText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      toast.error('No valid exclusions found');
      return;
    }

    setExclusions((prev) => [...prev, ...lines]);
    setBulkExclusionText('');
    toast.success(`Added ${lines.length} exclusion(s)`);
  };

  const addInclusion = () => setInclusions([...inclusions, '']);
  const removeInclusion = (index: number) => setInclusions(inclusions.filter((_, i) => i !== index));
  const updateInclusion = (index: number, value: string) => {
    const updated = [...inclusions];
    updated[index] = value;
    setInclusions(updated);
  };

  const addExclusion = () => setExclusions([...exclusions, '']);
  const removeExclusion = (index: number) => setExclusions(exclusions.filter((_, i) => i !== index));
  const updateExclusion = (index: number, value: string) => {
    const updated = [...exclusions];
    updated[index] = value;
    setExclusions(updated);
  };

  // Handle form submission with FormData
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add basic fields
      formData.append('travelId', itinerary.travelId);
      formData.append('company', itinerary.company);
      formData.append('numberOfDays', numberOfDays.toString());
      formData.append('numberOfNights', numberOfNights.toString());
      formData.append('numberOfHotels', numberOfHotels.toString());

      // Add form inputs
      const form = e.currentTarget;
      formData.append('clientName', (form.elements.namedItem('clientName') as HTMLInputElement).value);
      formData.append('clientPhone', (form.elements.namedItem('clientPhone') as HTMLInputElement).value);
      formData.append('clientEmail', (form.elements.namedItem('clientEmail') as HTMLInputElement).value);
      formData.append('packageTitle', (form.elements.namedItem('packageTitle') as HTMLInputElement).value);

      // Use state values for agent name and phone
      formData.append('tripAdvisorName', agentName);
      formData.append('tripAdvisorNumber', agentPhone);

      const finalCab = selectedCab === 'Custom' ? customCab : selectedCab;
      formData.append('cabs', finalCab);

      formData.append('flights', (form.elements.namedItem('flights') as HTMLTextAreaElement).value);
      formData.append('quotePrice', (form.elements.namedItem('quotePrice') as HTMLInputElement).value);
      formData.append('pricePerPerson', (form.elements.namedItem('pricePerPerson') as HTMLInputElement).value);

      // Add compressed images to FormData
      Object.keys(compressedImages).forEach((key) => {
        const index = parseInt(key);
        const file = compressedImages[index];
        if (file) {
          formData.append(`dayImage_${index}`, file);
        }
      });

      // Add days data
      dayFields.forEach((day, index) => {
        formData.append(
          `days[${index}][summary]`,
          (form.elements.namedItem(`days[${index}][summary]`) as HTMLInputElement).value
        );
        formData.append(
          `days[${index}][description]`,
          (form.elements.namedItem(`days[${index}][description]`) as HTMLTextAreaElement).value
        );
        formData.append(`days[${index}][imageSrc]`, day.imageSrc);
      });

      // ✅ Add hotels data - only if hotels exist
      hotelFields.forEach((hotel, index) => {
        formData.append(
          `hotels[${index}][placeName]`,
          (form.elements.namedItem(`hotels[${index}][placeName]`) as HTMLInputElement).value
        );
        formData.append(
          `hotels[${index}][placeDescription]`,
          (form.elements.namedItem(`hotels[${index}][placeDescription]`) as HTMLInputElement).value
        );
        formData.append(
          `hotels[${index}][hotelName]`,
          (form.elements.namedItem(`hotels[${index}][hotelName]`) as HTMLInputElement).value
        );

        const roomType = selectedRoomTypes[index] || '';
        const finalRoomType = roomType === 'Custom' ? customRoomTypes[index] || '' : roomType;
        formData.append(`hotels[${index}][roomType]`, finalRoomType);

        formData.append(
          `hotels[${index}][hotelDescription]`,
          (form.elements.namedItem(`hotels[${index}][hotelDescription]`) as HTMLTextAreaElement).value
        );
      });

      // Add inclusions and exclusions
      formData.append('inclusions', JSON.stringify(inclusions.filter((inc) => inc.trim() !== '')));
      formData.append('exclusions', JSON.stringify(exclusions.filter((exc) => exc.trim() !== '')));

      await updateItineraryWithFormData(itinerary.travelId, formData);

      toast.success('Itinerary updated successfully!');
      router.push('/admin/itinerary/itinerary-list');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update itinerary');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    'w-full p-3 border-2 border-gray-300 dark:border-gray-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 bg-foreground';
  const labelClassName = 'block text-sm font-semibold mb-2';

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Itinerary</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Update and optimize your itinerary details</p>
      </div>
      <div className="bg-foreground rounded-sm p-6">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Itinerary ID - Read Only */}
          <div>
            <label className={labelClassName}>Itinerary ID (Read Only)</label>
            <input
              type="text"
              value={itinerary.travelId}
              readOnly
              className={`${inputClassName} font-mono text-lg font-bold bg-gray-100 dark:bg-gray-800 cursor-not-allowed`}
              disabled
            />
            <p className="text-xs text-gray-500 mt-2">Itinerary ID cannot be changed after creation</p>
          </div>

          {/* Client Information */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-purple-600">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClassName}>
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="clientName"
                  type="text"
                  required
                  defaultValue={itinerary.clientName}
                  className={inputClassName}
                  disabled={isSubmitting}
                  placeholder="Enter client full name"
                />
              </div>

              <div>
                <label className={labelClassName}>
                  Client Phone <span className="text-red-500">*</span>
                </label>
                <input
                  name="clientPhone"
                  type="tel"
                  required
                  pattern="[0-9]{10,15}"
                  defaultValue={itinerary.clientPhone}
                  className={inputClassName}
                  disabled={isSubmitting}
                  placeholder="10-15 digit phone number"
                  title="Please enter a valid phone number (10-15 digits, numbers only)"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClassName}>Client Email</label>
                <input
                  name="clientEmail"
                  type="email"
                  pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                  defaultValue={itinerary.clientEmail || ''}
                  className={inputClassName}
                  disabled={isSubmitting}
                  placeholder="client@example.com"
                  title="Please enter a valid email address"
                />
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Package Details</h3>
            <div className="space-y-6">
              <div>
                <label className={labelClassName}>
                  Package Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="packageTitle"
                  type="text"
                  required
                  defaultValue={itinerary.packageTitle}
                  className={inputClassName}
                  disabled={isSubmitting}
                  placeholder="e.g., Magical Kashmir 5N/6D Tour Package"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClassName}>
                    Number of Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
                    className={inputClassName}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className={labelClassName}>
                    Number of Nights <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={numberOfNights}
                    readOnly
                    className={`${inputClassName} bg-gray-100 dark:bg-gray-800 cursor-not-allowed`}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated (Days - 1)</p>
                </div>

                {/* ✅ UPDATED: Number of Hotels - now allows 0 */}
                <div>
                  <label className={labelClassName}>
                    Number of Hotels <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={numberOfHotels}
                    onChange={(e) => setNumberOfHotels(Math.max(0, parseInt(e.target.value) || 0))}
                    className={inputClassName}
                    disabled={isSubmitting}
                  />
                  {/* ✅ Added helper text */}
                  <p className="text-xs text-gray-500 mt-1">Set to 0 for day trips or transportation-only packages</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>
                    Quote Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="quotePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={itinerary.quotePrice}
                    className={inputClassName}
                    disabled={isSubmitting}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className={labelClassName}>
                    Price Per Person (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="pricePerPerson"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={itinerary.pricePerPerson}
                    className={inputClassName}
                    disabled={isSubmitting}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Agent Details with Dropdown */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Agent Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AGENT NAME (Saved to tripAdvisorName) */}
              <div>
                <label className={labelClassName}>
                  Agent Name <span className="text-red-500">*</span>
                </label>
                {!agentsLoaded ? (
                  <div className="flex items-center gap-2 p-3 border-2 border-gray-300 dark:border-gray-700 rounded-sm">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading agents...</span>
                  </div>
                ) : (
                  <select
                    value={agentName}
                    onChange={handleAgentSelect}
                    className={inputClassName}
                    disabled={isSubmitting}
                    required
                  >
                    <option value="">Select an Agent</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.name || ''}>
                        {agent.name}
                      </option>
                    ))}
                    {/* Show current value if it's not in the agents list */}
                    {agentName && !agents.find((a) => a.name === agentName) && (
                      <option value={agentName}>{agentName} (Custom)</option>
                    )}
                  </select>
                )}
                {agentName && !agents.find((a) => a.name === agentName) && agentsLoaded && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    ⚠️ This agent is not in the current agents list. You can select a different agent or keep this
                    value.
                  </p>
                )}
              </div>

              {/* AGENT PHONE (Saved to tripAdvisorNumber) */}
              <div>
                <label className={labelClassName}>
                  Agent Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={agentPhone}
                  onChange={(e) => setAgentPhone(e.target.value)}
                  placeholder="9876543210"
                  className={inputClassName}
                  disabled={isSubmitting}
                  required
                  pattern="[0-9]{10,15}"
                  title="Please enter a valid phone number (10-15 digits, numbers only)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-filled from agent profile. You can edit this manually.
                </p>
              </div>
            </div>
          </div>

          {/* Transportation Details */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Transportation Details</h3>
            <div className="space-y-6">
              <div>
                <label className={labelClassName}>
                  Cab Details <span className="text-red-500">*</span>
                </label>
                <select
                  name="cabs"
                  required
                  value={selectedCab}
                  onChange={(e) => setSelectedCab(e.target.value)}
                  className={inputClassName}
                  disabled={isSubmitting}
                >
                  <option value="">Select Cab Type</option>
                  {CAB_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {selectedCab === 'Custom' && (
                  <div className="mt-3">
                    <label className="text-sm font-semibold mb-2 block text-blue-600">
                      Enter Custom Cab Details <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customCab}
                      onChange={(e) => setCustomCab(e.target.value)}
                      required={selectedCab === 'Custom'}
                      className={inputClassName}
                      disabled={isSubmitting}
                      placeholder="e.g., Luxury SUV, Minibus, etc."
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={labelClassName}>
                  Flight Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="flights"
                  rows={3}
                  required
                  defaultValue={itinerary.flights}
                  className={inputClassName}
                  disabled={isSubmitting}
                  placeholder="Enter flight details..."
                />
              </div>
            </div>
          </div>

          {/* Daily Itinerary with Image Upload */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Daily Itinerary</h3>
            {dayFields.map((field, index) => (
              <div
                key={index}
                className="mb-6 p-6 border-2 border-gray-300 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-900"
              >
                <h4 className="font-semibold text-lg mb-4 text-purple-600">Day {index + 1}</h4>

                <div className="space-y-4">
                  <div>
                    <label className={labelClassName}>
                      Day Summary <span className="text-red-500">*</span>
                    </label>
                    <input
                      name={`days[${index}][summary]`}
                      type="text"
                      required
                      defaultValue={field.summary}
                      className={inputClassName}
                      disabled={isSubmitting}
                      placeholder="e.g., Arrival in Delhi - City Tour"
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label className={labelClassName}>
                      <ImageIcon className="h-4 w-4 inline mr-1" />
                      Day Image
                    </label>

                    {dayImagePreviews[index] ? (
                      <div className="relative mb-4 group">
                        <Image
                          src={dayImagePreviews[index]}
                          alt={`Day ${index + 1}`}
                          width={400}
                          height={250}
                          className="rounded-sm object-cover border-2 border-gray-200 dark:border-gray-700 w-full max-w-md h-48 sm:h-64"
                          unoptimized={!hasExistingImages[index]}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-sm flex items-center justify-center max-w-md">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleImageClick(index)}
                              disabled={isSubmitting}
                              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                              title="Replace Image"
                            >
                              <Upload className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              disabled={isSubmitting}
                              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                              title="Remove Image"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={!isSubmitting ? () => handleImageClick(index) : undefined}
                        onDragEnter={(e) => handleDrag(e, index)}
                        onDragLeave={(e) => handleDrag(e, index)}
                        onDragOver={(e) => handleDrag(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`border-2 border-dashed rounded-sm p-6 sm:p-8 text-center transition-all duration-200 ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          dragActiveStates[index]
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-300 dark:border-gray-700 hover:border-purple-500'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <FileImage
                            className={`h-10 w-10 sm:h-12 sm:w-12 mb-4 ${
                              dragActiveStates[index] ? 'text-purple-500' : 'text-gray-400'
                            }`}
                          />
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 font-medium">
                            {dragActiveStates[index] ? 'Drop image here' : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">JPEG, PNG, or WebP (max 100MB)</p>
                          <p className="text-xs text-gray-400 mt-1">Images will be automatically compressed</p>
                        </div>
                      </div>
                    )}

                    {/* Single input for file selection */}
                    <input
                      ref={(el) => {
                        fileInputRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={(e) => handleImageChange(e, index)}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Day Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name={`days[${index}][description]`}
                      rows={4}
                      required
                      defaultValue={field.description}
                      className={inputClassName}
                      disabled={isSubmitting}
                      placeholder="Detailed description of the day's activities..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ UPDATED: Hotels Section - only show if numberOfHotels > 0 */}
          {numberOfHotels > 0 && (
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center gap-2 mb-6">
                <Hotel className="h-6 w-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-purple-600">Hotel Details</h3>
                <span className="text-sm text-gray-500">
                  ({numberOfHotels} hotel{numberOfHotels !== 1 ? 's' : ''})
                </span>
              </div>
              {hotelFields.map((field, index) => (
                <div
                  key={index}
                  className="mb-6 p-6 border-2 border-gray-300 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-900"
                >
                  <h4 className="font-semibold text-lg mb-4 text-purple-600">Hotel {index + 1}</h4>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClassName}>
                          Place Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          name={`hotels[${index}][placeName]`}
                          type="text"
                          required
                          defaultValue={field.placeName}
                          className={inputClassName}
                          disabled={isSubmitting}
                          placeholder="e.g., Srinagar"
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>
                          Night Details <span className="text-red-500">*</span>
                        </label>
                        <input
                          name={`hotels[${index}][placeDescription]`}
                          type="text"
                          required
                          defaultValue={field.placeDescription}
                          className={inputClassName}
                          disabled={isSubmitting}
                          placeholder="e.g., 1st Night, 2nd Night"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClassName}>
                          Hotel Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          name={`hotels[${index}][hotelName]`}
                          type="text"
                          required
                          defaultValue={field.hotelName}
                          className={inputClassName}
                          disabled={isSubmitting}
                          placeholder="e.g., Hotel Paradise"
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>
                          Room Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name={`hotels[${index}][roomType]`}
                          required
                          value={selectedRoomTypes[index] || field.roomType || ''}
                          onChange={(e) => handleRoomTypeChange(index, e.target.value)}
                          className={inputClassName}
                          disabled={isSubmitting}
                        >
                          <option value="">Select Room Type</option>
                          {ROOM_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>

                        {selectedRoomTypes[index] === 'Custom' && (
                          <div className="mt-3">
                            <label className="text-sm font-semibold mb-2 block text-blue-600">
                              Enter Custom Room Type <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={customRoomTypes[index] || ''}
                              onChange={(e) => setCustomRoomTypes((prev) => ({ ...prev, [index]: e.target.value }))}
                              required
                              className={inputClassName}
                              disabled={isSubmitting}
                              placeholder="e.g., Presidential Suite, Garden View Room, etc."
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className={labelClassName}>
                        Hotel Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name={`hotels[${index}][hotelDescription]`}
                        rows={3}
                        required
                        defaultValue={field.hotelDescription}
                        className={inputClassName}
                        disabled={isSubmitting}
                        placeholder="Describe the hotel amenities and features..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ✅ Added message when no hotels */}
          {numberOfHotels === 0 && (
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-sm border-2 border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3">
                  <Hotel className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-700 dark:text-blue-300">No Hotels Added</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      This itinerary doesn't include hotel accommodations. Perfect for day trips, flight-only bookings,
                      or custom arrangements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inclusions */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-4 text-purple-600">Inclusions</h3>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Clipboard className="h-5 w-5 text-blue-600" />
                <label className="font-semibold text-blue-700 dark:text-blue-300">
                  Bulk Add Inclusions (Paste multiple lines)
                </label>
              </div>
              <textarea
                value={bulkInclusionText}
                onChange={(e) => setBulkInclusionText(e.target.value)}
                placeholder="Paste multiple inclusions here (one per line)"
                rows={4}
                className={`${inputClassName} mb-2`}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                onClick={handleBulkInclusionsPaste}
                disabled={isSubmitting || !bulkInclusionText.trim()}
                variant="outline"
                className="cursor-pointer"
              >
                <Copy className="h-4 w-4 mr-2" />
                Add All Lines
              </Button>
            </div>

            <div className="space-y-3">
              {inclusions.map((inclusion, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={inclusion}
                    onChange={(e) => updateInclusion(index, e.target.value)}
                    className={inputClassName}
                    disabled={isSubmitting}
                    placeholder="Enter inclusion..."
                  />
                  <Button
                    type="button"
                    onClick={() => removeInclusion(index)}
                    disabled={isSubmitting}
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addInclusion} disabled={isSubmitting} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Inclusion
              </Button>
            </div>
          </div>

          {/* Exclusions */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-4 text-purple-600">Exclusions</h3>

            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-sm border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-3">
                <Clipboard className="h-5 w-5 text-orange-600" />
                <label className="font-semibold text-orange-700 dark:text-orange-300">
                  Bulk Add Exclusions (Paste multiple lines)
                </label>
              </div>
              <textarea
                value={bulkExclusionText}
                onChange={(e) => setBulkExclusionText(e.target.value)}
                placeholder="Paste multiple exclusions here (one per line)"
                rows={4}
                className={`${inputClassName} mb-2`}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                onClick={handleBulkExclusionsPaste}
                disabled={isSubmitting || !bulkExclusionText.trim()}
                variant="outline"
                className="cursor-pointer"
              >
                <Copy className="h-4 w-4 mr-2" />
                Add All Lines
              </Button>
            </div>

            <div className="space-y-3">
              {exclusions.map((exclusion, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={exclusion}
                    onChange={(e) => updateExclusion(index, e.target.value)}
                    className={inputClassName}
                    disabled={isSubmitting}
                    placeholder="Enter exclusion..."
                  />
                  <Button
                    type="button"
                    onClick={() => removeExclusion(index)}
                    disabled={isSubmitting}
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addExclusion} disabled={isSubmitting} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Exclusion
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 text-lg font-bold bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Updating Itinerary...
                </>
              ) : (
                'Update Itinerary'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
