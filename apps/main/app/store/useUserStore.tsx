import { getUserProfile, updateContactInfo, updateUserCertifications, updateUserProfile, updateUserSkills } from "@/actions/(main)/user/user.action"
import { create } from "zustand"
import { ContactInfo, UserCertification, UserProfile, UserSkill } from "../../types/user";
import { deleteResume, uploadResume } from "@/actions/(main)/user/resume.action";
import { fetchXpAndCredit, transferCredits } from "@/actions/(main)/subscription/credits.action";
import { toast } from "sonner";

interface UserState {
	user: UserProfile | null
	isLoading: boolean
	error: string | null
	// Credit and XP states
	currentXp: number
	totalXp: number
	credits: number
	currentLevel: number
	// Methods
	fetchUser: () => Promise<UserProfile | undefined>
	setUser: (user: UserProfile) => void
	updateUser: (userData: Partial<UserProfile>) => Promise<UserProfile>
	updateUserSkills: (skills: UserSkill[]) => Promise<UserProfile>
	updateUserCertifications: (certifications: UserCertification[]) => Promise<UserProfile>
	updateUserProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>
	updateContactInfo: (contactData: ContactInfo) => Promise<ContactInfo>
	uploadResume: (file: File) => Promise<UserProfile | undefined>
	deleteResume: () => Promise<UserProfile | undefined>
	handleCreditTransfer: (receiverId: string, amount: number) => Promise<boolean>
	// Credit and XP methods
	fetchCreditsAndXp: () => Promise<void>
	updateCredits: (amount: number) => void
	updateXp: (currentXp: number, totalXp: number) => void
	updateLevel: (level: number) => void
	deductCredits: (amount: number) => void
	addCredits: (amount: number) => void
	addXp: (amount: number) => void
}

export const useUserStore = create<UserState>((set, get) => ({
	user: null,
	isLoading: false,
	error: null,
	// Initial credit/XP values
	currentXp: 0,
	totalXp: 0,
	credits: 0,
	currentLevel: 1,

	fetchUser: async () => {
		set({ isLoading: true, error: null })
		try {
			const userData = await getUserProfile()
			set({ user: userData, isLoading: false })
			// Also fetch credits and XP when fetching user
			await get().fetchCreditsAndXp()
			return userData
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : 'Failed to fetch user data',
				isLoading: false
			})
			throw error
		}
	},

	setUser: (user) => set({ user }),

	updateUser: async (userData) => {
		try {
			const updatedUser = await updateUserProfile(userData)
			set({ user: updatedUser })
			// Refresh the user data to get latest from server
			await get().fetchUser()
			return updatedUser
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Failed to update user data' })
			throw error
		}
	},

	updateUserSkills: async (skills) => {
		try {
			const updatedSkills = await updateUserSkills(skills)
			const { user } = get()
			if (user) {
				const updatedUser = { ...user, skills: updatedSkills }
				set({ user: updatedUser })
				// Refresh the user data to get latest from server
				await get().fetchUser()
				return updatedUser
			}
			throw new Error('User not found')
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Failed to update skills' })
			throw error
		}
	},

	updateUserCertifications: async (certifications) => {
		try {
			const updatedCertifications = await updateUserCertifications(certifications)
			const { user } = get()
			if (user) {
				const updatedUser = { ...user, certifications: updatedCertifications }
				set({ user: updatedUser })
				// Refresh the user data to get latest from server
				await get().fetchUser()
				return updatedUser
			}
			throw new Error('User not found')
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Failed to update certifications' })
			throw error
		}
	},

	updateUserProfile: async (profileData) => {
		return get().updateUser(profileData)
	},

	updateContactInfo: async (contactData) => {
		try {
			const updatedContactInfo = await updateContactInfo(contactData);
			const { user } = get();

			if (user) {
				set({ user: { ...user, contactInfo: updatedContactInfo as ContactInfo } })
			}

			return updatedContactInfo as ContactInfo;
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Failed to update contact info' })
			throw error
		}
	},

	uploadResume: async (file: File) => {
		try {
			await uploadResume(file)
			const userData = await get().fetchUser()
			return userData
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Failed to upload resume' })
			throw error
		}
	},

	deleteResume: async () => {
		try {
			await deleteResume()
			const userData = await get().fetchUser()
			return userData
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Failed to delete resume' })
			throw error
		}
	},

	handleCreditTransfer: async (receiverId: string, amount: number) => {
		const { user, fetchCreditsAndXp } = get()
		if (!user || !user.id) {
			set({ error: 'User not authenticated' })
			return false
		}
		set({ isLoading: true, error: null })
		
		try {
			await transferCredits(user.id, receiverId, amount)
			await fetchCreditsAndXp(); // Refresh credits after transfer
			set({ isLoading: false })
			return true
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to transfer credits'
			set({ error: errorMessage, isLoading: false })
			if (errorMessage === 'Insufficient credits') {
				toast.error('You do not have enough credits to complete this transfer.')
			} else {
				toast.error(errorMessage)
			}
			return false
		}
	},

	// Credit and XP management methods
	fetchCreditsAndXp: async () => {
		try {
			const response = await fetchXpAndCredit()
			if (response) {
				set({
					currentXp: response.currentXp,
					totalXp: response.totalXp,
					credits: response.credits,
					currentLevel: response.currentLevel
				})
			}
		} catch (error) {
			console.error('Error fetching credits and XP:', error)
		}
	},

	updateCredits: (amount: number) => {
		set({ credits: amount })
	},

	updateXp: (currentXp: number, totalXp: number) => {
		set({ currentXp, totalXp })
	},

	updateLevel: (level: number) => {
		set({ currentLevel: level })
	},

	deductCredits: (amount: number) => {
		set(state => ({ credits: Math.max(0, state.credits - amount) }))
	},

	addCredits: (amount: number) => {
		set(state => ({ credits: state.credits + amount }))
	},

	addXp: (amount: number) => {
		set(state => ({ 
			currentXp: state.currentXp + amount,
			totalXp: state.totalXp + amount 
		}))
	}
}))