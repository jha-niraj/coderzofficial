"use client";

import { create } from 'zustand';

// ==========================================
// TYPES
// ==========================================

export interface LaunchpadProduct {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    logo: string | null;
    coverImage: string | null;
    category: string;
    tags: string[];
    techStack: string[];
    websiteUrl: string | null;
    demoUrl: string | null;
    githubUrl: string | null;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    isFeatured: boolean;
    type: string;
    createdBy?: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
    } | null;
}

// ==========================================
// STORE STATE
// ==========================================

interface LaunchpadsStoreState {
    // Data
    coderzProducts: LaunchpadProduct[];
    communityProducts: LaunchpadProduct[];
    featuredProducts: LaunchpadProduct[];
    
    // UI state
    activeTab: 'community' | 'coderz';
    isLoading: boolean;
    
    // Actions - Initialize
    initialize: (
        coderzProducts: LaunchpadProduct[], 
        communityProducts: LaunchpadProduct[],
        featuredProducts: LaunchpadProduct[]
    ) => void;
    
    // Actions - Products
    addCommunityProduct: (product: LaunchpadProduct) => void;
    addCoderzProduct: (product: LaunchpadProduct) => void;
    updateProduct: (productId: string, data: Partial<LaunchpadProduct>) => void;
    removeProduct: (productId: string) => void;
    
    // Actions - UI
    setActiveTab: (tab: 'community' | 'coderz') => void;
    setIsLoading: (loading: boolean) => void;
}

// ==========================================
// STORE IMPLEMENTATION
// ==========================================

export const useLaunchpadsStore = create<LaunchpadsStoreState>()((set) => ({
    // Initial state
    coderzProducts: [],
    communityProducts: [],
    featuredProducts: [],
    activeTab: 'community', // Default to community
    isLoading: false,
    
    // Initialize
    initialize: (coderzProducts, communityProducts, featuredProducts) => {
        set({
            coderzProducts,
            communityProducts,
            featuredProducts,
            isLoading: false,
        });
    },
    
    // Product actions
    addCommunityProduct: (product) => {
        set((state) => ({
            communityProducts: [product, ...state.communityProducts],
        }));
    },
    
    addCoderzProduct: (product) => {
        set((state) => ({
            coderzProducts: [product, ...state.coderzProducts],
        }));
    },
    
    updateProduct: (productId, data) => {
        set((state) => ({
            coderzProducts: state.coderzProducts.map((p) =>
                p.id === productId ? { ...p, ...data } : p
            ),
            communityProducts: state.communityProducts.map((p) =>
                p.id === productId ? { ...p, ...data } : p
            ),
            featuredProducts: state.featuredProducts.map((p) =>
                p.id === productId ? { ...p, ...data } : p
            ),
        }));
    },
    
    removeProduct: (productId) => {
        set((state) => ({
            coderzProducts: state.coderzProducts.filter((p) => p.id !== productId),
            communityProducts: state.communityProducts.filter((p) => p.id !== productId),
            featuredProducts: state.featuredProducts.filter((p) => p.id !== productId),
        }));
    },
    
    // UI actions
    setActiveTab: (tab) => set({ activeTab: tab }),
    setIsLoading: (loading) => set({ isLoading: loading }),
}));

// ==========================================
// SELECTORS
// ==========================================

export const useLaunchpadsProducts = () => useLaunchpadsStore((state) => ({
    coderzProducts: state.coderzProducts,
    communityProducts: state.communityProducts,
    featuredProducts: state.featuredProducts,
}));

export const useActiveTab = () => useLaunchpadsStore((state) => state.activeTab);
