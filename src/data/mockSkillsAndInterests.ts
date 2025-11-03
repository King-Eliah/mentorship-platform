// Mock data for skills and interests

export const mockSkillSuggestions = [
  { id: '1', name: 'JavaScript', category: 'Programming', popularity: 150 },
  { id: '2', name: 'React', category: 'Frontend', popularity: 130 },
  { id: '3', name: 'Node.js', category: 'Backend', popularity: 120 },
  { id: '4', name: 'Python', category: 'Programming', popularity: 140 },
  { id: '5', name: 'Machine Learning', category: 'AI/ML', popularity: 110 },
  { id: '6', name: 'Project Management', category: 'Management', popularity: 100 },
  { id: '7', name: 'UI/UX Design', category: 'Design', popularity: 95 },
  { id: '8', name: 'Data Analysis', category: 'Data Science', popularity: 105 },
  { id: '9', name: 'AWS', category: 'Cloud', popularity: 115 },
  { id: '10', name: 'Docker', category: 'DevOps', popularity: 85 },
  { id: '11', name: 'TypeScript', category: 'Programming', popularity: 125 },
  { id: '12', name: 'Vue.js', category: 'Frontend', popularity: 80 },
  { id: '13', name: 'Angular', category: 'Frontend', popularity: 90 },
  { id: '14', name: 'MongoDB', category: 'Database', popularity: 75 },
  { id: '15', name: 'PostgreSQL', category: 'Database', popularity: 70 },
  { id: '16', name: 'GraphQL', category: 'API', popularity: 60 },
  { id: '17', name: 'Kubernetes', category: 'DevOps', popularity: 65 },
  { id: '18', name: 'Leadership', category: 'Soft Skills', popularity: 120 },
  { id: '19', name: 'Communication', category: 'Soft Skills', popularity: 110 },
  { id: '20', name: 'Public Speaking', category: 'Soft Skills', popularity: 55 }
];

export const mockInterestCategories = [
  {
    id: 'technology',
    name: 'Technology',
    subcategories: [
      { id: 'web-dev', name: 'Web Development', categoryId: 'technology' },
      { id: 'mobile-dev', name: 'Mobile Development', categoryId: 'technology' },
      { id: 'ai-ml', name: 'Artificial Intelligence & Machine Learning', categoryId: 'technology' },
      { id: 'data-science', name: 'Data Science', categoryId: 'technology' },
      { id: 'cybersecurity', name: 'Cybersecurity', categoryId: 'technology' },
      { id: 'cloud-computing', name: 'Cloud Computing', categoryId: 'technology' },
      { id: 'blockchain', name: 'Blockchain', categoryId: 'technology' },
      { id: 'iot', name: 'Internet of Things', categoryId: 'technology' }
    ]
  },
  {
    id: 'business',
    name: 'Business',
    subcategories: [
      { id: 'entrepreneurship', name: 'Entrepreneurship', categoryId: 'business' },
      { id: 'project-management', name: 'Project Management', categoryId: 'business' },
      { id: 'marketing', name: 'Marketing', categoryId: 'business' },
      { id: 'sales', name: 'Sales', categoryId: 'business' },
      { id: 'finance', name: 'Finance', categoryId: 'business' },
      { id: 'strategy', name: 'Business Strategy', categoryId: 'business' },
      { id: 'operations', name: 'Operations', categoryId: 'business' },
      { id: 'hr', name: 'Human Resources', categoryId: 'business' }
    ]
  },
  {
    id: 'design',
    name: 'Design',
    subcategories: [
      { id: 'ui-ux', name: 'UI/UX Design', categoryId: 'design' },
      { id: 'graphic-design', name: 'Graphic Design', categoryId: 'design' },
      { id: 'web-design', name: 'Web Design', categoryId: 'design' },
      { id: 'product-design', name: 'Product Design', categoryId: 'design' },
      { id: 'branding', name: 'Branding', categoryId: 'design' },
      { id: 'illustration', name: 'Illustration', categoryId: 'design' },
      { id: 'animation', name: 'Animation', categoryId: 'design' },
      { id: 'photography', name: 'Photography', categoryId: 'design' }
    ]
  },
  {
    id: 'personal-development',
    name: 'Personal Development',
    subcategories: [
      { id: 'leadership', name: 'Leadership', categoryId: 'personal-development' },
      { id: 'communication', name: 'Communication', categoryId: 'personal-development' },
      { id: 'public-speaking', name: 'Public Speaking', categoryId: 'personal-development' },
      { id: 'time-management', name: 'Time Management', categoryId: 'personal-development' },
      { id: 'career-coaching', name: 'Career Coaching', categoryId: 'personal-development' },
      { id: 'networking', name: 'Networking', categoryId: 'personal-development' },
      { id: 'mindfulness', name: 'Mindfulness', categoryId: 'personal-development' },
      { id: 'work-life-balance', name: 'Work-Life Balance', categoryId: 'personal-development' }
    ]
  },
  {
    id: 'creative',
    name: 'Creative',
    subcategories: [
      { id: 'writing', name: 'Writing', categoryId: 'creative' },
      { id: 'content-creation', name: 'Content Creation', categoryId: 'creative' },
      { id: 'video-production', name: 'Video Production', categoryId: 'creative' },
      { id: 'music', name: 'Music', categoryId: 'creative' },
      { id: 'art', name: 'Art', categoryId: 'creative' },
      { id: 'storytelling', name: 'Storytelling', categoryId: 'creative' },
      { id: 'podcasting', name: 'Podcasting', categoryId: 'creative' },
      { id: 'social-media', name: 'Social Media', categoryId: 'creative' }
    ]
  },
  {
    id: 'education',
    name: 'Education',
    subcategories: [
      { id: 'teaching', name: 'Teaching', categoryId: 'education' },
      { id: 'curriculum-development', name: 'Curriculum Development', categoryId: 'education' },
      { id: 'educational-technology', name: 'Educational Technology', categoryId: 'education' },
      { id: 'research', name: 'Research', categoryId: 'education' },
      { id: 'training', name: 'Training & Development', categoryId: 'education' },
      { id: 'mentoring', name: 'Mentoring', categoryId: 'education' },
      { id: 'academic-writing', name: 'Academic Writing', categoryId: 'education' },
      { id: 'student-counseling', name: 'Student Counseling', categoryId: 'education' }
    ]
  }
];