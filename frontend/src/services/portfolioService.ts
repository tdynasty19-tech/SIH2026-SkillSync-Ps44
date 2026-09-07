const STORAGE_KEY = 'skillsync_portfolio_projects';

export interface Project {
  id: string;
  studentId: string;
  title: string;
  description: string;
  demoUrl?: string;
  repoUrl?: string;
  technologies: string[];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const portfolioService = {
  async getStudentProjects(studentId: string): Promise<Project[]> {
    await delay(400);
    const stored = localStorage.getItem(STORAGE_KEY);
    const all: Project[] = stored ? JSON.parse(stored) : [
      {
        id: 'proj-1',
        studentId: 'u123',
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce solution built with React and Node.js',
        technologies: ['React', 'Node.js', 'MongoDB']
      }
    ]; // Default mock data if empty
    
    // Save defaults back if it was empty just to populate state
    if (!stored) localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    
    return all.filter(p => p.studentId === studentId);
  },

  async addProject(project: Omit<Project, 'id'>): Promise<Project> {
    await delay(500);
    const stored = localStorage.getItem(STORAGE_KEY);
    const all: Project[] = stored ? JSON.parse(stored) : [];
    
    const newProj: Project = {
      ...project,
      id: `proj-${Date.now()}`
    };
    
    all.push(newProj);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return newProj;
  }
};
