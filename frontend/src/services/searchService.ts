import { tokenManager } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location?: string;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  url?: string;
  type: string;
  createdAt: string;
  user: User;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: User;
  receiver?: User;
}

export interface SearchResults {
  users: User[];
  events: Event[];
  resources: Resource[];
  messages: Message[];
}

export const performSearch = async (query: string): Promise<SearchResults> => {
  try {
    const token = tokenManager.getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    return response.json();
  } catch (error) {
    console.error('Search error:', error);
    // Return empty results on error instead of throwing
    return {
      users: [],
      events: [],
      resources: [],
      messages: [],
    };
  }
};