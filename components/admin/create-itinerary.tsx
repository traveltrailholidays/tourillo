'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createItinerary,
  generateNewTravelId,
  getItineraryForClone,
  checkPhoneNumberExists,
} from '@/lib/actions/itinerary-actions';
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Plus,
  Minus,
  Copy,
  RefreshCw,
  Search,
  X,
  FileCode,
  Building2,
  FileImage,
  Clipboard,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { DEFAULT_INCLUSIONS, DEFAULT_EXCLUSIONS, ROOM_TYPES, CAB_OPTIONS } from '@/data/itinerary';
import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/image-compression';

interface CreateItineraryProps {
  itinerariesForClone?: Array<{
    travelId: string;
    company: 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS';
    clientName: string;
    clientPhone: string;
    packageTitle: string;
    numberOfDays: number;
    numberOfNights: number;
  }>;
}

const CreateItinerary = ({ itinerariesForClone = [] }: CreateItineraryProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [travelId, setTravelId] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [numberOfNights, setNumberOfNights] = useState(0);
  const [numberOfHotels, setNumberOfHotels] = useState(1);
  const [dayImagePreviews, setDayImagePreviews] = useState<{ [key: number]: string }>({});
  const [compressedImages, setCompressedImages] = useState<{ [key: number]: File }>({});
  const [dragActiveStates, setDragActiveStates] = useState<{ [key: number]: boolean }>({});
  const [hasExistingImages, setHasExistingImages] = useState<{ [key: number]: boolean }>({});
  const [inclusions, setInclusions] = useState<string[]>([...DEFAULT_INCLUSIONS]);
  const [exclusions, setExclusions] = useState<string[]>([...DEFAULT_EXCLUSIONS]);
  const [selectedCompany, setSelectedCompany] = useState<'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS'>('TOURILLO');

  // Bulk add states
  const [bulkInclusionText, setBulkInclusionText] = useState('');
  const [bulkExclusionText, setBulkExclusionText] = useState('');

  // Phone validation states
  const [clientPhone, setClientPhone] = useState('');
  const [phoneCheckLoading, setPhoneCheckLoading] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [existingItinerary, setExistingItinerary] = useState<any>(null);

  // Custom Room Type & Cab states
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<{ [key: number]: string }>({});
  const [customRoomTypes, setCustomRoomTypes] = useState<{ [key: number]: string }>({});
  const [customCab, setCustomCab] = useState('');
  const [selectedCab, setSelectedCab] = useState('');

  // Clone feature states
  const [searchTerm, setSearchTerm] = useState('');
  const [showCloneDropdown, setShowCloneDropdown] = useState(false);
  const [selectedCloneId, setSelectedCloneId] = useState<string | null>(null);
  const cloneDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Day fields state
  const [dayFields, setDayFields] = useState<
    Array<{ dayNumber: number; summary: string; imageSrc: string; description: string }>
  >([{ dayNumber: 1, summary: '', imageSrc: '', description: '' }]);

  // Hotel fields state
  const [hotelFields, setHotelFields] = useState<
    Array<{
      placeName: string;
      placeDescription: string;
      hotelName: string;
      roomType: string;
      hotelDescription: string;
    }>
  >([{ placeName: '', placeDescription: '', hotelName: '', roomType: '', hotelDescription: '' }]);

  // Generate Travel ID on mount
  useEffect(() => {
    const initTravelId = async () => {
      const newId = await generateNewTravelId(selectedCompany);
      setTravelId(newId);
    };
    initTravelId();
  }, [selectedCompany]);

  // Auto-calculate Number of Nights
  useEffect(() => {
    const nights = Math.max(0, numberOfDays - 1);
    setNumberOfNights(nights);
  }, [numberOfDays]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cloneDropdownRef.current && !cloneDropdownRef.current.contains(event.target as Node)) {
        setShowCloneDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-load clone from URL parameter
  useEffect(() => {
    const cloneTravelId = searchParams.get('clone');
    if (cloneTravelId && !selectedCloneId) {
      handleCloneSelect(cloneTravelId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Phone number validation with debounce
  useEffect(() => {
    const checkPhone = async () => {
      if (clientPhone.length >= 10 && clientPhone.length <= 15) {
        setPhoneCheckLoading(true);
        const result = await checkPhoneNumberExists(clientPhone);
        setPhoneExists(result.exists);
        setExistingItinerary(result.itinerary);
        setPhoneCheckLoading(false);
      } else {
        setPhoneExists(false);
        setExistingItinerary(null);
      }
    };

    const timeoutId = setTimeout(checkPhone, 500);
    return () => clearTimeout(timeoutId);
  }, [clientPhone]);

  // Filter itineraries for clone dropdown (with phone search)
  const filteredItineraries = React.useMemo(() => {
    if (!searchTerm.trim()) return itinerariesForClone;
    const search = searchTerm.toLowerCase();
    return itinerariesForClone.filter(
      (itinerary) =>
        itinerary.travelId.toLowerCase().includes(search) ||
        itinerary.clientName.toLowerCase().includes(search) ||
        itinerary.clientPhone.includes(search) ||
        itinerary.packageTitle.toLowerCase().includes(search)
    );
  }, [itinerariesForClone, searchTerm]);

  // Handle clone selection
  const handleCloneSelect = async (travelId: string) => {
    try {
      toast.loading('Loading itinerary data...', { id: 'clone-loading' });

      const itineraryData = await getItineraryForClone(travelId);

      if (!itineraryData) {
        toast.error('Failed to load itinerary data', { id: 'clone-loading' });
        return;
      }

      const newTravelId = await generateNewTravelId(selectedCompany);
      setTravelId(newTravelId);

      setNumberOfDays(itineraryData.numberOfDays);
      setNumberOfNights(itineraryData.numberOfNights);
      setNumberOfHotels(itineraryData.numberOfHotels);

      setDayFields(itineraryData.days as any);
      setHotelFields(itineraryData.hotels as any);

      const roomTypeStates: { [key: number]: string } = {};
      itineraryData.hotels.forEach((hotel: any, index: number) => {
        roomTypeStates[index] = hotel.roomType;
      });
      setSelectedRoomTypes(roomTypeStates);

      setInclusions(itineraryData.inclusions);
      setExclusions(itineraryData.exclusions);

      const newImagePreviews: { [key: number]: string } = {};
      const newHasExistingImages: { [key: number]: boolean } = {};

      itineraryData.days.forEach((day: any, index: number) => {
        if (day.imageSrc) {
          newImagePreviews[index] = day.imageSrc;
          newHasExistingImages[index] = true;
        }
      });

      setDayImagePreviews(newImagePreviews);
      setHasExistingImages(newHasExistingImages);

      setSelectedCloneId(travelId);
      setShowCloneDropdown(false);

      const selected = itinerariesForClone.find((i) => i.travelId === travelId);
      if (selected) {
        setSearchTerm(`${travelId} - ${selected.clientName}`);
      }

      if (formRef.current) {
        const form = formRef.current;
        (form.elements.namedItem('clientName') as HTMLInputElement).value = '';
        (form.elements.namedItem('clientPhone') as HTMLInputElement).value = '';
        (form.elements.namedItem('clientEmail') as HTMLInputElement).value = itineraryData.clientEmail || '';
        (form.elements.namedItem('packageTitle') as HTMLInputElement).value = itineraryData.packageTitle;
        (form.elements.namedItem('tripAdvisorName') as HTMLInputElement).value = itineraryData.tripAdvisorName;
        (form.elements.namedItem('tripAdvisorNumber') as HTMLInputElement).value = itineraryData.tripAdvisorNumber;
        setSelectedCab(itineraryData.cabs);
        (form.elements.namedItem('flights') as HTMLTextAreaElement).value = itineraryData.flights;
        (form.elements.namedItem('quotePrice') as HTMLInputElement).value = itineraryData.quotePrice.toString();
        (form.elements.namedItem('pricePerPerson') as HTMLInputElement).value = itineraryData.pricePerPerson.toString();
      }

      toast.success('Cloned! Update Client Name & Phone before creating.', { id: 'clone-loading' });
    } catch (error) {
      toast.error('Failed to load itinerary data', { id: 'clone-loading' });
      console.error(error);
    }
  };

  // Clear clone selection
  const handleClearClone = async () => {
    setSearchTerm('');
    setSelectedCloneId(null);
    setDayImagePreviews({});
    setCompressedImages({});
    setHasExistingImages({});

    setSelectedCompany('TOURILLO');
    const newId = await generateNewTravelId('TOURILLO');
    setTravelId(newId);

    setNumberOfDays(1);
    setNumberOfNights(0);
    setNumberOfHotels(1);

    setDayFields([{ dayNumber: 1, summary: '', imageSrc: '', description: '' }]);
    setHotelFields([{ placeName: '', placeDescription: '', hotelName: '', roomType: '', hotelDescription: '' }]);
    setInclusions([...DEFAULT_INCLUSIONS]);
    setExclusions([...DEFAULT_EXCLUSIONS]);

    setClientPhone('');
    setPhoneExists(false);
    setExistingItinerary(null);
    setSelectedRoomTypes({});
    setCustomRoomTypes({});
    setSelectedCab('');

    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleGenerateTravelId = async () => {
    setIsGeneratingId(true);
    try {
      const newTravelId = await generateNewTravelId(selectedCompany);
      setTravelId(newTravelId);
      toast.success('Travel ID generated successfully!');
    } catch (error) {
      toast.error('Failed to generate Travel ID');
    } finally {
      setIsGeneratingId(false);
    }
  };

  const handleCopyTravelId = () => {
    if (travelId) {
      navigator.clipboard.writeText(travelId);
      toast.success('Travel ID copied to clipboard!');
    }
  };

  const handleCompanyChange = async (company: 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS') => {
    setSelectedCompany(company);
    const newTravelId = await generateNewTravelId(company);
    setTravelId(newTravelId);
    toast.success(`Company changed to ${company === 'TOURILLO' ? 'Tourillo' : 'Travel Trail Holidays'}`);
  };

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

  useEffect(() => {
    const currentHotels = hotelFields.length;

    if (numberOfHotels > currentHotels) {
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
      setHotelFields(hotelFields.slice(0, numberOfHotels));
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

    if (phoneExists) {
      toast.error('Phone number already exists. Please use a different number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add basic fields
      formData.append('travelId', travelId);
      formData.append('company', selectedCompany);
      formData.append('numberOfDays', numberOfDays.toString());
      formData.append('numberOfNights', numberOfNights.toString());
      formData.append('numberOfHotels', numberOfHotels.toString());

      // Add form inputs
      const form = e.currentTarget;
      formData.append('clientName', (form.elements.namedItem('clientName') as HTMLInputElement).value);
      formData.append('clientPhone', (form.elements.namedItem('clientPhone') as HTMLInputElement).value);
      formData.append('clientEmail', (form.elements.namedItem('clientEmail') as HTMLInputElement).value);
      formData.append('packageTitle', (form.elements.namedItem('packageTitle') as HTMLInputElement).value);
      formData.append('tripAdvisorName', (form.elements.namedItem('tripAdvisorName') as HTMLInputElement).value);
      formData.append('tripAdvisorNumber', (form.elements.namedItem('tripAdvisorNumber') as HTMLInputElement).value);

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

      // Add hotels data with custom room type handling
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

      await createItinerary(formData);

      toast.success('Itinerary created successfully!');
      router.push('/admin/itinerary/itinerary-list');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create itinerary');
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Itinerary</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Design detailed travel itineraries in minutes</p>
      </div>
      <div className="bg-foreground rounded-sm p-6">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Company Selection Section */}
          <div className="p-6 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-sm border-2 border-purple-200 dark:border-purple-700">
            <label className={labelClassName}>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-purple-600" />
                <span className="text-lg">
                  Select Company <span className="text-red-500">*</span>
                </span>
              </div>
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Choose the company for this itinerary. This will determine the Travel ID prefix (TRL for Tourillo, TTH for
              Travel Trail Holidays).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleCompanyChange('TOURILLO')}
                disabled={isSubmitting}
                className={`p-4 rounded-sm border-2 transition-all duration-200 ${
                  selectedCompany === 'TOURILLO'
                    ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedCompany === 'TOURILLO' ? 'border-purple-500' : 'border-gray-400'
                    }`}
                  >
                    {selectedCompany === 'TOURILLO' && <div className="w-3 h-3 rounded-full bg-purple-500"></div>}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-lg text-purple-600 dark:text-purple-400">Tourillo</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Travel ID Prefix: <span className="font-mono font-bold">TRL</span>
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleCompanyChange('TRAVEL_TRAIL_HOLIDAYS')}
                disabled={isSubmitting}
                className={`p-4 rounded-sm border-2 transition-all duration-200 ${
                  selectedCompany === 'TRAVEL_TRAIL_HOLIDAYS'
                    ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedCompany === 'TRAVEL_TRAIL_HOLIDAYS' ? 'border-blue-500' : 'border-gray-400'
                    }`}
                  >
                    {selectedCompany === 'TRAVEL_TRAIL_HOLIDAYS' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-lg text-blue-600 dark:text-blue-400">Travel Trail Holidays</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Travel ID Prefix: <span className="font-mono font-bold">TTH</span>
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Clone from Existing Section */}
          {itinerariesForClone.length > 0 && (
            <>
              <div className="p-6 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-sm border-2 border-green-200 dark:border-green-700">
                <label className={labelClassName}>
                  <div className="flex items-center gap-2 mb-2">
                    <FileCode className="h-4 w-4" />
                    Clone from Existing Itinerary (Optional)
                  </div>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Clone an itinerary to copy all details. Search by Travel ID, Client Name, Phone Number, or Package
                  Title. Perfect for similar packages!
                </p>

                <div className="relative" ref={cloneDropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by Travel ID, Name, Phone, or Package..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!selectedCloneId) setShowCloneDropdown(true);
                      }}
                      onFocus={() => !selectedCloneId && setShowCloneDropdown(true)}
                      disabled={!!selectedCloneId}
                      className={`${inputClassName} pl-10 pr-10 ${selectedCloneId ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                    {selectedCloneId && (
                      <button
                        type="button"
                        onClick={handleClearClone}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Clone Dropdown */}
                  {showCloneDropdown && !selectedCloneId && (
                    <div className="absolute z-50 w-full mt-2 bg-foreground border-2 border-green-200 dark:border-green-700 rounded-sm shadow-2xl max-h-80 overflow-y-auto">
                      {filteredItineraries.length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-gray-500 dark:text-gray-400">No itineraries found</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Try adjusting your search terms
                          </p>
                        </div>
                      ) : (
                        <>
                          {filteredItineraries.map((itinerary, index) => (
                            <button
                              key={itinerary.travelId}
                              type="button"
                              onClick={() => handleCloneSelect(itinerary.travelId)}
                              className={`w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                index !== filteredItineraries.length - 1
                                  ? 'border-b border-gray-200 dark:border-gray-700'
                                  : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold ${
                                        itinerary.company === 'TOURILLO'
                                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                                          : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                      }`}
                                    >
                                      {itinerary.travelId}
                                    </span>
                                    <span className="font-semibold truncate">{itinerary.clientName}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                                    {itinerary.packageTitle}
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                      {itinerary.numberOfNights}N / {itinerary.numberOfDays}D
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                                      📞 {itinerary.clientPhone}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Show message if cloned */}
              {selectedCloneId && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-sm border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <FileCode className="h-5 w-5" />
                    <p className="font-medium">
                      Cloned from {selectedCloneId}. Update Client Name & Phone, then create!
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Travel ID Section */}
          <div>
            <label className={labelClassName}>
              Travel ID <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={travelId}
                readOnly
                className={`${inputClassName} bg-gray-100 dark:bg-gray-800 font-mono font-bold`}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                onClick={handleGenerateTravelId}
                disabled={isGeneratingId || isSubmitting}
                variant="outline"
                className="flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isGeneratingId ? 'animate-spin' : ''}`} />
                Generate
              </Button>
              <Button
                type="button"
                onClick={handleCopyTravelId}
                disabled={isSubmitting}
                variant="outline"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Current prefix:{' '}
              <span className="font-mono font-bold">{selectedCompany === 'TOURILLO' ? 'TRL' : 'TTH'}</span>
            </p>
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
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className={`${inputClassName} ${phoneExists ? 'border-red-500 focus:ring-red-500' : phoneCheckLoading ? 'border-yellow-500' : clientPhone.length >= 10 ? 'border-green-500' : ''}`}
                  disabled={isSubmitting}
                  placeholder="10-15 digit phone number"
                  title="Please enter a valid phone number (10-15 digits, numbers only)"
                />
                {phoneCheckLoading && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Checking phone number...
                  </p>
                )}
                {phoneExists && existingItinerary && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm">
                    <p className="text-xs text-red-700 dark:text-red-300 font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Phone number already exists!
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Itinerary exists for <span className="font-mono font-bold">{existingItinerary.travelId}</span> -{' '}
                      {existingItinerary.clientName}
                    </p>
                  </div>
                )}
                {!phoneExists && !phoneCheckLoading && clientPhone.length >= 10 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Phone number available
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Each client can have only one itinerary (unique phone number)
                </p>
              </div>

              <div className="md:col-span-2">
                <label className={labelClassName}>Client Email</label>
                <input
                  name="clientEmail"
                  type="email"
                  pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                  className={inputClassName}
                  disabled={isSubmitting}
                  placeholder="client@example.com"
                  title="Please enter a valid email address"
                />
                <p className="text-xs text-gray-500 mt-1">Optional - Valid email format required if provided</p>
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

                <div>
                  <label className={labelClassName}>
                    Number of Hotels <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={numberOfHotels}
                    onChange={(e) => setNumberOfHotels(parseInt(e.target.value) || 1)}
                    className={inputClassName}
                    disabled={isSubmitting}
                  />
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
                    className={inputClassName}
                    disabled={isSubmitting}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trip Advisor Details */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Trip Advisor Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClassName}>
                  Trip Advisor Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="tripAdvisorName"
                  type="text"
                  required
                  className={inputClassName}
                  disabled={isSubmitting}
                  placeholder="Enter advisor name"
                />
              </div>

              <div>
                <label className={labelClassName}>
                  Trip Advisor Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="tripAdvisorNumber"
                  type="tel"
                  required
                  pattern="[0-9]{10,15}"
                  className={inputClassName}
                  disabled={isSubmitting}
                  placeholder="10-15 digit phone number"
                  title="Please enter a valid phone number (10-15 digits, numbers only)"
                />
                <p className="text-xs text-gray-500 mt-1">Enter 10-15 digit phone number (numbers only)</p>
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
                            className={`h-10 w-10 sm:h-12 sm:w-12 mb-4 ${dragActiveStates[index] ? 'text-purple-500' : 'text-gray-400'}`}
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

          {/* Hotels */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Hotel Details</h3>
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
                        Place Description <span className="text-red-500">*</span>
                      </label>
                      <input
                        name={`hotels[${index}][placeDescription]`}
                        type="text"
                        required
                        defaultValue={field.placeDescription}
                        className={inputClassName}
                        disabled={isSubmitting}
                        placeholder="e.g., Summer Capital of Kashmir"
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
              disabled={isSubmitting || phoneExists}
              className="w-full py-6 text-lg font-bold bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Creating Itinerary...
                </>
              ) : phoneExists ? (
                <>
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Phone Number Already Exists
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Generate Itinerary
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItinerary;
