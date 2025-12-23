import { create } from 'zustand';

interface ProjectState {
    startedProjects: string[];
    setStartedProjects: (projects: string[]) => void;
    startProject: (projectId: string) => void;
    isProjectStarted: (projectId: string) => boolean;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    startedProjects: [],
    setStartedProjects: (projects: string[]) => {
        set({ startedProjects: projects });
    },
    startProject: (projectId: string) => {
        set((state) => ({
            startedProjects: [...state.startedProjects, projectId],
        }));
    },
    isProjectStarted: (projectId: string) => {
        return get().startedProjects.includes(projectId);
    },
}));