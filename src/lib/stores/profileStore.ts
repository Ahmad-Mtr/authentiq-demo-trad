import { create } from 'zustand';
import { Profile } from '../interfaces';



interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  hasChecked: boolean;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setHasChecked: (checked: boolean) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  hasChecked: false,
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ isLoading: loading }),
  setHasChecked: (checked) => set({ hasChecked: checked }),
  clearProfile: () => set({ profile: null, hasChecked: false }),
}));