// Male avatars
import maleAvatar01 from '@/assets/avatars/male/avatar_01.png';
import maleAvatar02 from '@/assets/avatars/male/avatar_02.png';
import maleAvatar03 from '@/assets/avatars/male/avatar_03.png';
import maleAvatar04 from '@/assets/avatars/male/avatar_04.png';
import maleAvatar05 from '@/assets/avatars/male/avatar_05.png';
import maleAvatar06 from '@/assets/avatars/male/avatar_06.png';

// Female avatars
import femaleAvatar01 from '@/assets/avatars/female/avatar_01.png';
import femaleAvatar02 from '@/assets/avatars/female/avatar_02.png';
import femaleAvatar03 from '@/assets/avatars/female/avatar_03.png';
import femaleAvatar04 from '@/assets/avatars/female/avatar_04.png';
import femaleAvatar05 from '@/assets/avatars/female/avatar_05.png';
import femaleAvatar06 from '@/assets/avatars/female/avatar_06.png';

export type AvatarGender = 'male' | 'female';

export interface AvatarOption {
  id: string;
  src: string;
  gender: AvatarGender;
}

export const maleAvatars: AvatarOption[] = [
  { id: 'male_01', src: maleAvatar01, gender: 'male' },
  { id: 'male_02', src: maleAvatar02, gender: 'male' },
  { id: 'male_03', src: maleAvatar03, gender: 'male' },
  { id: 'male_04', src: maleAvatar04, gender: 'male' },
  { id: 'male_05', src: maleAvatar05, gender: 'male' },
  { id: 'male_06', src: maleAvatar06, gender: 'male' },
];

export const femaleAvatars: AvatarOption[] = [
  { id: 'female_01', src: femaleAvatar01, gender: 'female' },
  { id: 'female_02', src: femaleAvatar02, gender: 'female' },
  { id: 'female_03', src: femaleAvatar03, gender: 'female' },
  { id: 'female_04', src: femaleAvatar04, gender: 'female' },
  { id: 'female_05', src: femaleAvatar05, gender: 'female' },
  { id: 'female_06', src: femaleAvatar06, gender: 'female' },
];

export const allAvatars: AvatarOption[] = [...maleAvatars, ...femaleAvatars];

export const getAvatarsByGender = (gender: AvatarGender): AvatarOption[] => {
  return gender === 'male' ? maleAvatars : femaleAvatars;
};

export const getAvatarById = (id: string): AvatarOption | undefined => {
  return allAvatars.find(avatar => avatar.id === id);
};

export const isPresetAvatar = (url: string): boolean => {
  return allAvatars.some(avatar => avatar.src === url || avatar.id === url);
};
