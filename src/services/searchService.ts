export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'goal' | 'event' | 'user' | 'resource' | 'group';
  url: string;
  metadata?: {
    status?: string;
    date?: string;
    priority?: string;
    author?: string;
    category?: string;
  };
  relevanceScore: number;
}

export interface SearchFilters {
  types?: Array<'goal' | 'event' | 'user' | 'resource' | 'group'>;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  priority?: string[];
  category?: string[];
}

export interface SearchOptions extends SearchFilters {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

class SearchService {
  private static instance: SearchService;
  private searchHistory: string[] = [];
  private maxHistorySize = 10;

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    this.addToHistory(query);

    const {
      types = ['goal', 'event', 'user', 'resource', 'group'],
      limit = 20,
      offset = 0,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = options;

    // Mock search results for now
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Complete React Training',
        description: 'Learn advanced React concepts and best practices',
        type: 'goal',
        url: '/goals/1',
        metadata: {
          status: 'in-progress',
          priority: 'high',
          date: '2024-12-01',
          category: 'Learning'
        },
        relevanceScore: this.calculateRelevance(query, 'Complete React Training', 'Learn advanced React concepts and best practices')
      },
      {
        id: '2',
        title: 'Team Standup Meeting',
        description: 'Daily team synchronization meeting',
        type: 'event',
        url: '/events/2',
        metadata: {
          status: 'scheduled',
          date: '2024-10-16',
          category: 'Meeting'
        },
        relevanceScore: this.calculateRelevance(query, 'Team Standup Meeting', 'Daily team synchronization meeting')
      },
      {
        id: '3',
        title: 'John Doe',
        description: 'Senior Developer with expertise in React and Node.js',
        type: 'user',
        url: '/users/3',
        metadata: {
          status: 'active',
          category: 'Engineering'
        },
        relevanceScore: this.calculateRelevance(query, 'John Doe', 'Senior Developer with expertise in React and Node.js')
      }
    ];

    // Filter by type
    let filteredResults = mockResults.filter(result => types.includes(result.type));

    // Apply additional filters
    filteredResults = this.applyFilters(filteredResults, options);

    // Sort results
    filteredResults = this.sortResults(filteredResults, sortBy, sortOrder);

    // Apply pagination
    return filteredResults.slice(offset, offset + limit);
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query.trim()) {
      return this.getRecentSearches();
    }

    const suggestions = [
      'React Training',
      'Team Meeting',
      'Project Planning',
      'Code Review',
      'Learning Path',
      'Skill Assessment'
    ];

    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8);
  }

  getRecentSearches(): string[] {
    return [...this.searchHistory].reverse();
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
  }

  private addToHistory(query: string): void {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Remove if already exists
    const index = this.searchHistory.indexOf(trimmedQuery);
    if (index > -1) {
      this.searchHistory.splice(index, 1);
    }

    // Add to beginning
    this.searchHistory.unshift(trimmedQuery);

    // Limit size
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
    }
  }

  private calculateRelevance(query: string, title: string, description: string): number {
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const descriptionLower = description.toLowerCase();

    let score = 0;

    // Exact title match
    if (titleLower === queryLower) score += 100;
    // Title starts with query
    else if (titleLower.startsWith(queryLower)) score += 80;
    // Title contains query
    else if (titleLower.includes(queryLower)) score += 60;

    // Description contains query
    if (descriptionLower.includes(queryLower)) score += 30;

    // Word boundary matches get bonus
    const words = queryLower.split(' ');
    words.forEach(word => {
      if (word.length > 2) {
        const titleWords = titleLower.split(/\s+/);
        const descWords = descriptionLower.split(/\s+/);
        
        if (titleWords.some(tw => tw.startsWith(word))) score += 20;
        if (descWords.some(dw => dw.startsWith(word))) score += 10;
      }
    });

    return score;
  }

  private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    let filtered = results;

    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(result => filters.types!.includes(result.type));
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(result => 
        result.metadata?.status && filters.status!.includes(result.metadata.status)
      );
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(result => 
        result.metadata?.priority && filters.priority!.includes(result.metadata.priority)
      );
    }

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(result => 
        result.metadata?.category && filters.category!.some(cat => 
          result.metadata!.category!.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(result => {
        if (!result.metadata?.date) return false;
        const resultDate = new Date(result.metadata.date);
        const startDate = new Date(start);
        const endDate = new Date(end);
        return resultDate >= startDate && resultDate <= endDate;
      });
    }

    return filtered;
  }

  private sortResults(
    results: SearchResult[], 
    sortBy: 'relevance' | 'date' | 'title', 
    sortOrder: 'asc' | 'desc'
  ): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = b.relevanceScore - a.relevanceScore;
          break;
        case 'date':
          const dateA = a.metadata?.date ? new Date(a.metadata.date).getTime() : 0;
          const dateB = b.metadata?.date ? new Date(b.metadata.date).getTime() : 0;
          comparison = dateB - dateA;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }
}

export const searchService = SearchService.getInstance();