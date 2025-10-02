"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { SearchSuggestion, SearchHistory } from "@/lib/search-types"
import { Search, Clock, TrendingUp, Package, Tag, X, Mic } from "lucide-react"

interface SearchBarProps {
  initialQuery?: string
  onSearch: (query: string) => void
  placeholder?: string
  showVoiceSearch?: boolean
  className?: string
}

export function SearchBar({
  initialQuery = "",
  onSearch,
  placeholder = "Search for products...",
  showVoiceSearch = false,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("quickmarket-search-history")
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  // Fetch suggestions with debouncing
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/products/search-suggestions?q=${encodeURIComponent(query)}`)
        const data = await response.json()

        if (data.suggestions) {
          setSuggestions(data.suggestions)
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Only show suggestions when there's text in the input
  useEffect(() => {
    if (query.trim().length === 0) {
      setShowSuggestions(false)
    }
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query)
  }

  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Add to search history
    const newHistoryItem: SearchHistory = {
      query: searchQuery,
      timestamp: Date.now(),
      resultCount: 0, // This would be updated after search results
    }

    const updatedHistory = [newHistoryItem, ...searchHistory.filter((item) => item.query !== searchQuery)].slice(0, 5) // Keep only last 5 searches

    setSearchHistory(updatedHistory)
    localStorage.setItem("quickmarket-search-history", JSON.stringify(updatedHistory))

    setShowSuggestions(false)
    onSearch(searchQuery)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    setShowSuggestions(false)
    onSearch(suggestion.text)
  }

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    setShowSuggestions(false)
    onSearch(historyQuery)
  }

  const handleInputFocus = () => {
    if (query.trim().length > 0 || searchHistory.length > 0) {
      setShowSuggestions(true)
    }
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem("quickmarket-search-history")
  }

  const removeHistoryItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the history click
    const updatedHistory = searchHistory.filter((_, i) => i !== index)
    setSearchHistory(updatedHistory)
    localStorage.setItem("quickmarket-search-history", JSON.stringify(updatedHistory))
  }

  // Voice search functionality (Web Speech API)
  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search is not supported in your browser")
      return
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event:any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      setShowSuggestions(false)
      onSearch(transcript)
    }

    recognition.onerror = (event:any) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4" />
      case "category":
        return <Tag className="h-4 w-4" />
      case "popular":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  // Determine if we should show suggestions dropdown
  const shouldShowSuggestions = showSuggestions && (query.trim().length > 0 || searchHistory.length > 0)

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setQuery("")
                setShowSuggestions(false)
              }} 
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {showVoiceSearch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={startVoiceSearch}
              className={`h-6 w-6 p-0 ${isListening ? "text-red-500" : ""}`}
              disabled={isListening}
            >
              <Mic className="h-3 w-3" />
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {shouldShowSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto py-0" ref={suggestionsRef}>
          <CardContent className="p-0">
            {/* Search History - Only show when no query or empty query */}
            {searchHistory.length > 0 && query.trim().length === 0 && (
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
                  <Button variant="ghost" size="sm" onClick={clearSearchHistory} className="h-6 text-xs">
                    Clear All
                  </Button>
                </div>
                <div className="space-y-1">
                  {searchHistory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between group">
                      <button
                        onClick={() => handleHistoryClick(item.query)}
                        className="flex items-center space-x-2 text-sm hover:text-primary flex-1 text-left py-1"
                      >
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{item.query}</span>
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => removeHistoryItem(index, e)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions - Only show when there's a query */}
            {query.trim().length >= 2 && (
              <div className="p-3">
                {suggestions.length > 0 ? (
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-center justify-between w-full text-left py-2 px-2 rounded hover:bg-muted group"
                      >
                        <div className="flex items-center space-x-2">
                          {getSuggestionIcon(suggestion.type)}
                          <span className="text-sm">{suggestion.text}</span>
                          {suggestion.type === "category" && (
                            <Badge variant="outline" className="text-xs">
                              Category
                            </Badge>
                          )}
                        </div>
                        {suggestion.count && (
                          <span className="text-xs text-muted-foreground">{suggestion.count} items</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* No Suggestions Found */
                  !loading && (
                    <div className="text-center py-4">
                      <span className="text-sm text-muted-foreground">No suggestions found</span>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && query.trim().length >= 2 && (
              <div className="p-3 text-center">
                <span className="text-sm text-muted-foreground">Loading suggestions...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}