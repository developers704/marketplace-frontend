'use client';
import { searchQuery } from '@/framework/basic-rest/university/dashboardApi';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  fetchSuggestions?: (query: string) => Promise<string[]>;
}

function SearchBar({
  placeholder = 'Search...',
  onSearch,
  fetchSuggestions,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const mockFetchSuggestions = async (query: string): Promise<string[]> => {
    const fakeData = [
      'Math Basics',
      'Math Advanced',
      'Marketing',
      'Machine Learning',
    ];
    return fakeData.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase()),
    );
  };
  // hide suggestions if input is empty or loses focus
  useEffect(() => {
    if (!query.trim() || !isFocused) {
      setShowSuggestions(false);
    }
  }, [query, isFocused]);
  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      if (searchQuery) {
        try {
          const result = await searchQuery(query);
          console.log(result, 'result');
          setSuggestions(result?.data?.courses);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }
    }, 300); // debounce delay in ms
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
    setShowSuggestions(false);
  };

  const handleSelect = (suggestion: any) => {
    // setQuery(suggestion);
    // onSearch?.(suggestion);
    setShowSuggestions(false);
    router.push(`/valliani-university/courses/chapters/${suggestion?._id}`);
  };

  return (
    <div className="relative w-full lg:max-w-md">
      <form onSubmit={handleSubmit} className="flex items-center relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)} // delay ensures click on suggestion works
          placeholder={placeholder}
          className="w-full py-3 px-5 pr-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
        />
        <button
          type="submit"
          className="absolute right-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
        >
          <SearchIcon />
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-md mt-2 w-full shadow-md max-h-60 overflow-y-auto">
          {suggestions.map((item: any, index) => (
            <li
              key={index}
              className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              {item?.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default SearchBar;
