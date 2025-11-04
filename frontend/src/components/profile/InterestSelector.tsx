import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { mockInterestCategories } from '../../data/mockSkillsAndInterests';

export interface Interest {
  id: string;
  name: string;
  category: string;
}

export interface InterestCategory {
  id: string;
  name: string;
  subcategories: InterestSubcategory[];
}

export interface InterestSubcategory {
  id: string;
  name: string;
  categoryId: string;
}

interface InterestSelectorProps {
  selectedInterests: Interest[];
  onInterestsChange: (interests: Interest[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const InterestSelector: React.FC<InterestSelectorProps> = ({
  selectedInterests,
  onInterestsChange,
  disabled = false,
  placeholder = "Select your interests..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<InterestCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchInterestCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchInterestCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/interests/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data: InterestCategory[] = await response.json();
        setCategories(data);
        // Expand categories that have selected interests
        const categoriesToExpand = new Set<string>();
        selectedInterests.forEach(interest => {
          const category = data.find(cat => 
            cat.subcategories.some(sub => sub.id === interest.id)
          );
          if (category) {
            categoriesToExpand.add(category.id);
          }
        });
        setExpandedCategories(categoriesToExpand);
      } else {
        // Fallback to mock data
        setCategories(mockInterestCategories);
        const categoriesToExpand = new Set<string>();
        selectedInterests.forEach(interest => {
          const category = mockInterestCategories.find(cat => 
            cat.subcategories.some(sub => sub.id === interest.id)
          );
          if (category) {
            categoriesToExpand.add(category.id);
          }
        });
        setExpandedCategories(categoriesToExpand);
      }
    } catch (error) {
      console.error('Error fetching interest categories:', error);
      // Fallback to mock data
      setCategories(mockInterestCategories);
      const categoriesToExpand = new Set<string>();
      selectedInterests.forEach(interest => {
        const category = mockInterestCategories.find(cat => 
          cat.subcategories.some(sub => sub.id === interest.id)
        );
        if (category) {
          categoriesToExpand.add(category.id);
        }
      });
      setExpandedCategories(categoriesToExpand);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleInterest = (subcategory: InterestSubcategory, categoryName: string) => {
    const interestId = subcategory.id;
    const existingIndex = selectedInterests.findIndex(interest => interest.id === interestId);
    
    if (existingIndex >= 0) {
      // Remove interest
      onInterestsChange(selectedInterests.filter(interest => interest.id !== interestId));
    } else {
      // Add interest
      const newInterest: Interest = {
        id: subcategory.id,
        name: subcategory.name,
        category: categoryName
      };
      onInterestsChange([...selectedInterests, newInterest]);
    }
  };

  const removeInterest = (interestToRemove: Interest) => {
    onInterestsChange(selectedInterests.filter(interest => interest.id !== interestToRemove.id));
  };

  const isInterestSelected = (subcategoryId: string): boolean => {
    return selectedInterests.some(interest => interest.id === subcategoryId);
  };

  const getFilteredCategories = () => {
    if (!searchTerm.trim()) return categories;
    
    return categories.map(category => ({
      ...category,
      subcategories: category.subcategories.filter(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.subcategories.length > 0);
  };

  const getCategorySelectionCount = (category: InterestCategory): number => {
    return category.subcategories.filter(sub => isInterestSelected(sub.id)).length;
  };

  return (
    <div className="space-y-3">
      {/* Selector Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full flex items-center justify-between px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
        >
          <span className={selectedInterests.length === 0 ? "text-gray-400" : "text-gray-900"}>
            {selectedInterests.length === 0
              ? placeholder
              : `${selectedInterests.length} interest${selectedInterests.length !== 1 ? 's' : ''} selected`
            }
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search interests..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Categories List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading interests...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {getFilteredCategories().map((category) => {
                    const selectionCount = getCategorySelectionCount(category);
                    const isExpanded = expandedCategories.has(category.id);
                    
                    return (
                      <div key={category.id}>
                        {/* Category Header */}
                        <div
                          onClick={() => toggleCategory(category.id)}
                          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <ChevronDown
                              className={`h-4 w-4 text-gray-400 transition-transform ${
                                isExpanded ? 'transform rotate-180' : ''
                              }`}
                            />
                            <span className="font-medium text-gray-900">
                              {category.name}
                            </span>
                            {selectionCount > 0 && (
                              <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                                {selectionCount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subcategories */}
                        {isExpanded && (
                          <div className="bg-gray-50">
                            {category.subcategories.map((subcategory) => {
                              const isSelected = isInterestSelected(subcategory.id);
                              
                              return (
                                <label
                                  key={subcategory.id}
                                  className="flex items-center px-8 py-2 cursor-pointer hover:bg-gray-100"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleInterest(subcategory, category.name)}
                                    className="sr-only"
                                  />
                                  <div className="flex items-center space-x-3 w-full">
                                    <div
                                      className={`flex-shrink-0 w-4 h-4 border-2 rounded ${
                                        isSelected
                                          ? 'bg-indigo-600 border-indigo-600'
                                          : 'border-gray-300'
                                      } flex items-center justify-center`}
                                    >
                                      {isSelected && (
                                        <Check className="h-3 w-3 text-white" />
                                      )}
                                    </div>
                                    <span className="text-sm text-gray-700">
                                      {subcategory.name}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && getFilteredCategories().length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm.trim() 
                    ? `No interests found for "${searchTerm}"`
                    : 'No interests available'
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Interests Display */}
      {selectedInterests.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selected Interests ({selectedInterests.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interest) => (
              <div
                key={interest.id}
                className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm border border-indigo-200"
              >
                <span className="font-medium">{interest.name}</span>
                <span className="text-xs text-indigo-600">({interest.category})</span>
                {!disabled && (
                  <button
                    onClick={() => removeInterest(interest)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestSelector;