import { Trail } from '@/types';

export const TRAILS: Trail[] = [
  {
    id: '1',
    name: 'Sunset Ridge Trail',
    difficulty: 'Intermediate',
    distance: 8.5,
    elevationGain: 320,
    description: 'A beautiful winding trail through pine forests with stunning sunset views from the ridge. Features technical sections and fast descents.',
    latitude: 37.8651,
    longitude: -119.5383,
    image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800',
    photos: [
      'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800'
    ],
    rating: 4.7,
    ratingCount: 142,
    condition: 'Open'
  },
  {
    id: '2',
    name: 'Boulder Creek Loop',
    difficulty: 'Advanced',
    distance: 12.3,
    elevationGain: 580,
    description: 'Challenging loop with rocky terrain, creek crossings, and steep climbs. Recommended for experienced riders only.',
    latitude: 37.8751,
    longitude: -119.5483,
    image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
    photos: [
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
      'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?w=800',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800'
    ],
    rating: 4.9,
    ratingCount: 89,
    condition: 'Muddy'
  },
  {
    id: '3',
    name: 'Meadow Vista Easy',
    difficulty: 'Easy',
    distance: 4.2,
    elevationGain: 85,
    description: 'Perfect for beginners! Gentle slopes through open meadows with wildflowers in spring. Great for families.',
    latitude: 37.8451,
    longitude: -119.5183,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    photos: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1576608357394-e79bb0e720e2?w=800'
    ],
    rating: 4.3,
    ratingCount: 205,
    condition: 'Open'
  },
  {
    id: '4',
    name: 'Eagle Peak Descent',
    difficulty: 'Expert',
    distance: 15.7,
    elevationGain: 890,
    description: 'Extreme downhill with technical rock gardens, drops, and jumps. Not for the faint of heart. Shuttle recommended.',
    latitude: 37.8851,
    longitude: -119.5583,
    image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800',
    photos: [
      'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800',
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
      'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?w=800'
    ],
    rating: 4.8,
    ratingCount: 67,
    condition: 'Open'
  },
  {
    id: '5',
    name: 'Forest Flow',
    difficulty: 'Intermediate',
    distance: 9.8,
    elevationGain: 410,
    description: 'Smooth flowing singletrack through dense forest. Perfect flow trail with berms and rollers.',
    latitude: 37.8551,
    longitude: -119.5283,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
    photos: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    rating: 4.6,
    ratingCount: 178,
    condition: 'Open'
  },
  {
    id: '6',
    name: 'Lakeside Easy',
    difficulty: 'Easy',
    distance: 6.1,
    elevationGain: 120,
    description: 'Scenic trail following the shoreline with minimal elevation. Great views and wildlife spotting.',
    latitude: 37.8351,
    longitude: -119.5083,
    image: 'https://images.unsplash.com/photo-1576608357394-e79bb0e720e2?w=800',
    photos: [
      'https://images.unsplash.com/photo-1576608357394-e79bb0e720e2?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?w=800'
    ],
    rating: 4.4,
    ratingCount: 312,
    condition: 'Open'
  },
  {
    id: '7',
    name: 'Ridge Runner',
    difficulty: 'Advanced',
    distance: 14.2,
    elevationGain: 720,
    description: 'Exposed ridge line with technical climbing and thrilling descents. Incredible panoramic views.',
    latitude: 37.8951,
    longitude: -119.5683,
    image: 'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?w=800',
    photos: [
      'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?w=800',
      'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800'
    ],
    rating: 4.7,
    ratingCount: 95,
    condition: 'Closed'
  },
  {
    id: '8',
    name: 'Canyon Express',
    difficulty: 'Intermediate',
    distance: 7.6,
    elevationGain: 290,
    description: 'Fast-paced trail through narrow canyon with switchbacks and rock features.',
    latitude: 37.8651,
    longitude: -119.5283,
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800',
    photos: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800',
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800'
    ],
    rating: 4.5,
    ratingCount: 156,
    condition: 'Open'
  },
  {
    id: '9',
    name: 'Beginner\'s Paradise',
    difficulty: 'Easy',
    distance: 3.5,
    elevationGain: 50,
    description: 'The perfect introduction to mountain biking. Wide, well-maintained trail with gentle terrain.',
    latitude: 37.8251,
    longitude: -119.4983,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    photos: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1576608357394-e79bb0e720e2?w=800'
    ],
    rating: 4.2,
    ratingCount: 421,
    condition: 'Open'
  },
  {
    id: '10',
    name: 'Black Diamond Drop',
    difficulty: 'Expert',
    distance: 11.9,
    elevationGain: 650,
    description: 'Technical expert trail with steep drops, rock gardens, and challenging features. Advanced skills required.',
    latitude: 37.9051,
    longitude: -119.5783,
    image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800',
    photos: [
      'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800',
      'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?w=800'
    ],
    rating: 4.9,
    ratingCount: 53,
    condition: 'Muddy'
  }
];

export const getDifficultyColor = (difficulty: Trail['difficulty']): string => {
  switch (difficulty) {
    case 'Easy': return '#22C55E';
    case 'Intermediate': return '#3B82F6';
    case 'Advanced': return '#F59E0B';
    case 'Expert': return '#EF4444';
  }
};

export const getConditionColor = (condition: Trail['condition']): string => {
  switch (condition) {
    case 'Open': return '#22C55E';
    case 'Muddy': return '#F59E0B';
    case 'Closed': return '#EF4444';
  }
};
