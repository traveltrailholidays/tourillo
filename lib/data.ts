import { MdTravelExplore, MdOutlineSentimentVerySatisfied } from 'react-icons/md';
import { FaPersonWalkingLuggage } from 'react-icons/fa6';
import * as Icon from 'lucide-react';

const DATA = {
  sidebar: [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: Icon.LayoutDashboard,
    },
    {
      title: 'Users Management',
      icon: Icon.Users,
      adminOnly: true, // Only visible to admins
      children: [
        {
          title: 'Users',
          url: '/admin/users-list',
          icon: Icon.User,
        },
        {
          title: 'Agents',
          url: '/admin/agents-list',
          icon: Icon.UserCog,
        },
        {
          title: 'Admins',
          url: '/admin/admins-list',
          icon: Icon.UserLock,
        },
      ],
    },
    {
      title: 'Packages Management',
      icon: Icon.Map,
      children: [
        {
          title: 'Create packages',
          url: '/admin/package/create-package',
          icon: Icon.MapPlus,
        },
        {
          title: 'All packages',
          url: '/admin/package/package-list',
          icon: Icon.MapPlus,
        },
      ],
    },
    {
      title: 'Itinerary Management',
      icon: Icon.MapPin,
      children: [
        {
          title: 'Create Itinerary',
          url: '/admin/itinerary/create-itinerary',
          icon: Icon.Plus,
        },
        {
          title: 'All Itineraries',
          url: '/admin/itinerary/itinerary-list',
          icon: Icon.List,
        },
      ],
    },
    {
      title: 'Blogs Management',
      icon: Icon.MessagesSquare,
      children: [
        {
          title: 'Create Blog',
          url: '/admin/blog/create-blog',
          icon: Icon.MessageSquarePlus,
        },
        {
          title: 'All Blogs',
          url: '/admin/blog/blog-list',
          icon: Icon.MessageSquareText,
        },
      ],
    },
    {
      title: 'Quotes Management',
      url: '/admin/quotes/quotes-list',
      icon: Icon.BadgePercent,
    },
    {
      title: 'Contact Us',
      url: '/admin/contact',
      icon: Icon.Mail,
    },
  ],

  uNav: {
    message: 'Flat 10% off on every package',
  },
  legalLinks: [
    { name: 'Privacy Policy', href: '/legal/privacy-policy' },
    { name: 'Terms & Condition', href: '/legal/term-condition' },
    { name: 'Refund & Cancellation Policy', href: '/legal/refund-cancellation-policy' },
  ],
  quickLinks: [
    { name: 'Blogs', href: '/tours/golden-triangle' },
    { name: 'Packages', href: '/tours/rajasthan' },
    { name: 'Payments', href: '/tours/kerala' },
    { name: 'About Us', href: '/tours/himalayan' },
    { name: 'Contact Us', href: '/tours/cultural' },
  ],
  homeValues: [
    {
      title: 'Top Travel Destinations',
      description:
        "Discover India's beauty with us: the Himalayas of Himachal, vibrant Rajasthan, Kerala's backwaters, and Ladakh's high passes. Enjoy diverse landscapes, ancient temples, delicious cuisine, and warm hospitality.",
      icon: MdTravelExplore,
    },
    {
      title: 'Affordable Travel Deals',
      description:
        "Explore India's wonders affordably with our curated budget packages. Enjoy rich culture, diverse landscapes, and top attractions without compromising on quality or value for your money.",
      icon: FaPersonWalkingLuggage,
    },
    {
      title: 'Promise of Satisfaction',
      description:
        'Your satisfaction matters most to us. We aim to provide amazing travel experiences that surpass your expectations, ensuring every moment of your journey is memorable. Let us design your ideal trip.',
      icon: MdOutlineSentimentVerySatisfied,
    },
  ],
  TestimonialData: [
    {
      id: 1,
      name: 'Sourav Chakrabarti',
      review:
        'Himachal Trip : Dalhousie-Dharamshala-Palampur.The trip was nicely planed for us with good accommodation and skilled driver. Our communication with Mr. Mukul was excellent throughout the tour from the beginning of our tour plan.',
      rating: 5,
      image: '/rev/rev1.webp',
      reviewDate: '05/10/2024',
    },
    {
      id: 2,
      name: 'Deepanshu Arora',
      review:
        'I recently booked a Mussoorie trip through Tourillo, and it was an incredible experience! Everything was well-organized, from smooth bookings to a well-planned itinerary. The stay was comfortable, travel was seamless, and the sightseeing was perfect. Highly recommend Tourillo for a stress-free and enjoyable holiday!',
      rating: 5,
      image: '/rev/rev2.webp',
      reviewDate: '22/03/2025',
    },
    {
      id: 3,
      name: 'Param Suman',
      review:
        'Excellent tour organized by Tourillo to IIRS and FRI, with smooth logistics, great hospitality, and a memorable learning experience for our students. Highly recommended!',
      rating: 5,
      image: '/rev/rev3.webp',
      reviewDate: '01/10/2024',
    },
    {
      id: 4,
      name: 'Ajay Kumar',
      review:
        'Very good behavior from driver & management. Arrangements are up to the expectation. Anybody can approach the agency for safe trip.',
      rating: 5,
      image: '/rev/rev4.webp',
      reviewDate: '07/12/2024',
    },
    {
      id: 5,
      name: 'Khushi Yadav',
      review:
        'The overall experience was amazing. The facilities were well organised by the staff. It was wonderful. I would again plan something with my friends. Thanks 😊',
      rating: 5,
      image: '/rev/rev5.webp',
      reviewDate: '03/05/2025',
    },
  ],
  BlogPosts: [
    {
      id: 1,
      title: '10 Hidden Gems in Rajasthan You Must Visit',
      excerpt:
        'Discover the lesser-known treasures of Rajasthan that offer authentic experiences away from the crowds.',
      image: '/images/hero/hero1.jpg',
      category: 'Destinations',
      author: 'Priya Sharma',
      date: 'Dec 15, 2024',
      readTime: '5 min read',
      featured: true,
    },
    {
      id: 2,
      title: 'Best Time to Visit Kerala: A Complete Guide',
      excerpt: 'Plan your Kerala trip perfectly with our comprehensive guide to seasons, weather, and festivals.',
      image: '/images/hero/hero1.jpg',
      category: 'Travel Tips',
      author: 'Raj Patel',
      date: 'Dec 12, 2024',
      readTime: '7 min read',
      featured: false,
    },
    {
      id: 3,
      title: 'Cultural Etiquette: Respecting Local Traditions in India',
      excerpt: 'Learn about Indian customs and traditions to make your journey more meaningful and respectful.',
      image: '/images/hero/hero1.jpg',
      category: 'Culture',
      author: 'Anita Gupta',
      date: 'Dec 10, 2024',
      readTime: '6 min read',
      featured: false,
    },
    {
      id: 4,
      title: 'Adventure Activities in Himachal Pradesh',
      excerpt: 'From trekking to paragliding, explore the thrilling adventures waiting in the mountains.',
      image: '/images/hero/hero1.jpg',
      category: 'Adventure',
      author: 'Vikram Singh',
      date: 'Dec 8, 2024',
      readTime: '8 min read',
      featured: false,
    },
    {
      id: 5,
      title: "Street Food Guide: Delhi's Culinary Delights",
      excerpt: "Navigate Delhi's street food scene with our guide to the best and safest culinary experiences.",
      image: '/images/hero/hero1.jpg',
      category: 'Food',
      author: 'Meera Joshi',
      date: 'Dec 5, 2024',
      readTime: '4 min read',
      featured: false,
    },
    {
      id: 6,
      title: 'Sustainable Tourism: Traveling Responsibly in India',
      excerpt: 'Learn how to minimize your environmental impact while maximizing your travel experience.',
      image: '/images/hero/hero1.jpg',
      category: 'Sustainability',
      author: 'Arjun Mehta',
      date: 'Dec 3, 2024',
      readTime: '6 min read',
      featured: false,
    },
  ],
};

export default DATA;
