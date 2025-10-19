import { FaHeart, FaStar, FaCalendarAlt, FaUsers, FaLeaf, FaHiking, FaMountain } from 'react-icons/fa';
import { MdTempleHindu } from 'react-icons/md';

export const categories = [
  {
    label: 'Romantic',
    icon: FaHeart,
    description: 'This is a romantic package',
  },
  {
    label: 'Religious',
    icon: MdTempleHindu,
    description: 'This is a religious package',
  },
  {
    label: 'Adventure',
    icon: FaHiking,
    description: 'This is an adventure package',
  },
  {
    label: 'Family',
    icon: FaUsers,
    description: 'This is a family package',
  },
  {
    label: 'Nature',
    icon: FaLeaf,
    description: 'This is a nature package',
  },
  {
    label: 'Hill Station',
    icon: FaMountain,
    description: 'This is a hill station package',
  },
  {
    label: 'Featured',
    icon: FaStar,
    description: 'This is a featured package',
  },
  {
    label: 'Weekend',
    icon: FaCalendarAlt,
    description: 'This is a weekend package',
  },
];
