import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { mockSkillSuggestions } from '../../data/mockSkillsAndInterests';

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
}

export interface SkillSuggestion {
  id: string;
  name: string;
  category: string;
  popularity: number;
}

interface SkillInputProps {
  skills: Skill[];
  onSkillsChange: (skills: Skill[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const SkillInput: React.FC<SkillInputProps> = ({
  skills,
  onSkillsChange,
  disabled = false,
  placeholder = "Add a skill..."
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', color: 'bg-gray-100 text-gray-800' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
    { value: 'advanced', label: 'Advanced', color: 'bg-green-100 text-green-800' },
    { value: 'expert', label: 'Expert', color: 'bg-purple-100 text-purple-800' }
  ];

  // Debounce search
  useEffect(() => {
    if (inputValue.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchSkillSuggestions(inputValue.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const fetchSkillSuggestions = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/skills/suggestions?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data: SkillSuggestion[] = await response.json();
        // Filter out already selected skills
        const filteredSuggestions = data.filter(
          suggestion => !skills.some(skill => skill.name.toLowerCase() === suggestion.name.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      } else {
        // Fallback to mock data
        const mockData = mockSkillSuggestions.filter(
          suggestion => 
            suggestion.name.toLowerCase().includes(query.toLowerCase()) &&
            !skills.some(skill => skill.name.toLowerCase() === suggestion.name.toLowerCase())
        );
        setSuggestions(mockData);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      }
    } catch (error) {
      console.error('Error fetching skill suggestions:', error);
      // Fallback to mock data
      const mockData = mockSkillSuggestions.filter(
        suggestion => 
          suggestion.name.toLowerCase().includes(query.toLowerCase()) &&
          !skills.some(skill => skill.name.toLowerCase() === suggestion.name.toLowerCase())
      );
      setSuggestions(mockData);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else if (inputValue.trim()) {
          // Add custom skill
          addCustomSkill(inputValue.trim());
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SkillSuggestion) => {
    const newSkill: Skill = {
      id: Date.now().toString(), // Temporary ID for new skills
      name: suggestion.name,
      level: 'beginner',
      category: suggestion.category
    };
    
    onSkillsChange([...skills, newSkill]);
    setInputValue('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const addCustomSkill = (skillName: string) => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: skillName,
      level: 'beginner'
    };
    
    onSkillsChange([...skills, newSkill]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove: Skill) => {
    onSkillsChange(skills.filter(skill => skill.id !== skillToRemove.id));
  };

  const updateSkillLevel = (skillToUpdate: Skill, newLevel: Skill['level']) => {
    onSkillsChange(
      skills.map(skill =>
        skill.id === skillToUpdate.id
          ? { ...skill, level: newLevel }
          : skill
      )
    );
  };

  const getLevelConfig = (level: Skill['level']) => {
    return skillLevels.find(l => l.value === level) || skillLevels[0];
  };

  return (
    <div className="space-y-3">
      {/* Input Field */}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                  index === selectedSuggestionIndex ? 'bg-indigo-50 text-indigo-900' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-xs text-gray-500">{suggestion.category}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {suggestion.popularity > 100 && '🔥'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills Display */}
      {skills.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Your Skills ({skills.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => {
              const levelConfig = getLevelConfig(skill.level);
              
              return (
                <div
                  key={skill.id}
                  className="inline-flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {skill.name}
                    </span>
                    <select
                      value={skill.level}
                      onChange={(e) => updateSkillLevel(skill, e.target.value as Skill['level'])}
                      disabled={disabled}
                      className="text-xs border-0 rounded px-1 py-0.5 focus:ring-1 focus:ring-indigo-500 disabled:bg-transparent disabled:text-gray-500"
                    >
                      {skillLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelConfig.color}`}>
                    {levelConfig.label}
                  </div>
                  
                  {!disabled && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Custom Skill Button */}
      {inputValue.trim() && !suggestions.some(s => s.name.toLowerCase() === inputValue.toLowerCase()) && (
        <button
          onClick={() => addCustomSkill(inputValue.trim())}
          disabled={disabled}
          className="inline-flex items-center space-x-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400"
          type="button"
        >
          <Plus className="h-4 w-4" />
          <span>Add "{inputValue.trim()}" as custom skill</span>
        </button>
      )}
    </div>
  );
};

export default SkillInput;