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
      title: 'Voucher Management',
      icon: Icon.Ticket,
      children: [
        {
          title: 'Create Voucher',
          url: '/admin/voucher/create-voucher',
          icon: Icon.Plus,
        },
        {
          title: 'All Vouchers',
          url: '/admin/voucher/voucher-list',
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
    {
      title: 'Reviews',
      url: '/admin/review-list',
      icon: Icon.Star,
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
    { name: 'Blogs', href: '/blogs' },
    { name: 'Packages', href: '/packages' },
    { name: 'Payments', href: '/payments' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Contact Us', href: '/contact-us' },
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
};

export default DATA;
