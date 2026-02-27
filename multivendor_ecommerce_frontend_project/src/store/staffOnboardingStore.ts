import { create } from 'zustand';

interface RegistrationFormData {
  password: string;
  first_name: string;
  last_name: string;
  nid_card_image: File | null;
  phone_number: string;
}

interface StaffOnboardingState {
  currentStep: number;
  email: string;
  otp: string;
  formData: RegistrationFormData;
  isLoading: boolean;
  error: string | null;
}

interface StaffOnboardingStore extends StaffOnboardingState {
  setCurrentStep: (step: number) => void;
  setEmail: (email: string) => void;
  setOtp: (otp: string) => void;
  setFormData: (data: Partial<RegistrationFormData>) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetStore: () => void;
  nextStep: () => void;
  previousStep: () => void;
}

const initialState: StaffOnboardingState = {
  currentStep: 1,
  email: '',
  otp: '',
  formData: {
    password: '',
    first_name: '',
    last_name: '',
    nid_card_image: null,
    phone_number: '',
  },
  isLoading: false,
  error: null,
};

export const useStaffOnboardingStore = create<StaffOnboardingStore>((set) => ({
  ...initialState,
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setEmail: (email) => set({ email }),
  
  setOtp: (otp) => set({ otp }),
  
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  resetStore: () => set(initialState),
  
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 3),
    })),
  
  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),
}));