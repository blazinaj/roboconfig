import { MachineType } from '../../../types';

export const MACHINE_AVATARS: Record<MachineType, string[]> = {
  'Industrial Robot': [
    '/avatars/industrial-robot-1.png',
    '/avatars/industrial-robot-2.png',
    '/avatars/industrial-robot-3.png',
    'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg',
    'https://images.pexels.com/photos/3912327/pexels-photo-3912327.jpeg',
    'https://images.pexels.com/photos/7413915/pexels-photo-7413915.jpeg',
  ],
  'Collaborative Robot': [
    '/avatars/collaborative-robot-1.png',
    '/avatars/collaborative-robot-2.png',
    'https://images.pexels.com/photos/8849285/pexels-photo-8849285.jpeg',
    'https://images.pexels.com/photos/8566526/pexels-photo-8566526.jpeg',
    'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg',
  ],
  'Mobile Robot': [
    '/avatars/mobile-robot-1.png',
    '/avatars/mobile-robot-2.png',
    'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg',
    'https://images.pexels.com/photos/8566624/pexels-photo-8566624.jpeg',
    'https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg',
  ],
  'Autonomous Vehicle': [
    '/avatars/autonomous-vehicle-1.png',
    '/avatars/autonomous-vehicle-2.png',
    'https://images.pexels.com/photos/8942992/pexels-photo-8942992.jpeg',
    'https://images.pexels.com/photos/14004226/pexels-photo-14004226.jpeg',
    'https://images.pexels.com/photos/9553459/pexels-photo-9553459.jpeg',
  ],
  'Drone': [
    '/avatars/drone-1.png',
    '/avatars/drone-2.png',
    'https://images.pexels.com/photos/2050718/pexels-photo-2050718.jpeg',
    'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg',
    'https://images.pexels.com/photos/335257/pexels-photo-335257.jpeg',
  ],
  'Custom': [
    '/avatars/custom-robot-1.png',
    '/avatars/custom-robot-2.png',
    'https://images.pexels.com/photos/8566558/pexels-photo-8566558.jpeg',
    'https://images.pexels.com/photos/6153739/pexels-photo-6153739.jpeg',
    'https://images.pexels.com/photos/4507808/pexels-photo-4507808.jpeg',
  ],
};

// Default avatars if the machine type doesn't match any of the above
export const DEFAULT_AVATARS = [
  'https://images.pexels.com/photos/8566558/pexels-photo-8566558.jpeg',
  'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg',
  'https://images.pexels.com/photos/3912327/pexels-photo-3912327.jpeg',
  'https://images.pexels.com/photos/6153739/pexels-photo-6153739.jpeg',
];