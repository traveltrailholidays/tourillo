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
      name: 'Kaushiki Kashyap',
      review:
        'Amazing service and so satisfactory, Mrs Kiran is so humble while each and every service highly recommended to each one of you. Good number of experience she is holding which is clearly noticeable in her service. Thanks a lot will surely book again.',
      rating: 5,
      image: '/images/testimonials/testimonial1.png',
      reviewDate: '01/01/2023',
    },
    {
      id: 2,
      name: 'Rakhi Sharma',
      review:
        'I got nail extensions done for my engagement which worked really well and lasted a long time. I also got them done for my bridal ,I have great experience with Advanced Beauty.',
      rating: 5,
      image: '/images/testimonials/testimonial2.png',
      reviewDate: '01/02/2023',
    },
    {
      id: 3,
      name: 'Reetika Malik',
      review:
        'The extensions are beautifully done—natural-looking and sturdy. The nail paint is vibrant and flawless, really enhancing the overall look. The service was professional and friendly, making the experience even better.',
      rating: 5,
      image: '/images/testimonials/testimonial3.png',
      reviewDate: '01/03/2023',
    },
    {
      id: 4,
      name: 'Geetanjali Dayal',
      review:
        'Amazing work !! kiran is really calm while doing the extensions and ensures that you are comfortable.She is very good at her work.I would recommend her as her prices are very reasonable and best.',
      rating: 5,
      image: '/images/testimonials/testimonial4.png',
      reviewDate: '01/04/2023',
    },
    {
      id: 5,
      name: 'Khushi Yadav',
      review:
        'I recently had the pleasure of getting services from Kiran. She did pedicure, manicure, and cleanup for me and I couldn’t be happier with the results. From the moment she walked in, she made me feel comfortable and pampered. The attention to detail was exceptional, and it was clear that she takes great pride in her work.',
      rating: 5,
      image: '/images/testimonials/testimonial5.png',
      reviewDate: '01/05/2023',
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
