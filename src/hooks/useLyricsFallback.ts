/**
 * Hook: useLyricsFallback
 * 
 * Manages lyrics search orchestration state for SearchPage
 * - Tracks search results and fallback attempts
 * - Manages loading and error states
 * - Handles assistant handoff context
 */

import { useState, useCallback } from 'react';
import { orchestrateLyricsSearch, OrchestrationResult, checkLyricsAvailability } from '@/lib/lyricsSearchOrchestrator';

export interface FallbackState {
  query: string;
  isLoading: boolean;
  error: string | null;
  result: OrchestrationResult | null;
  
  // Tracking which sources have been tried
  triedLocal: boolean;
  triedCache: boolean;
  triedAPIs: boolean;
  
  // Assistant handoff context
  showAssistantSuggestion: boolean;
  assistantContext: {
    originalQuery: string;
    searchResult: OrchestrationResult | null;
    availableLocally: boolean;
  } | null;
}

export function useLyricsFallback() {
  const [state, setState] = useState<FallbackState>({
    query: '',
    isLoading: false,
    error: null,
    result: null,
    triedLocal: false,
    triedCache: false,
    triedAPIs: false,
    showAssistantSuggestion: false,
    assistantContext: null,
  });

  /**
   * Execute lyrics search with full orchestration pipeline
   */
  const searchLyrics = useCallback(async (query: string) => {
    const trimmed = query.trim();
    
    if (!trimmed) {
      setState(prev => ({
        ...prev,
        query: '',
        result: null,
        error: null,
        showAssistantSuggestion: false,
        assistantContext: null,
      }));
      return null;
    }

    setState(prev => ({
      ...prev,
      query: trimmed,
      isLoading: true,
      error: null,
      triedLocal: false,
      triedCache: false,
      triedAPIs: false,
    }));

    try {
      const result = await orchestrateLyricsSearch(trimmed);

      setState(prev => ({
        ...prev,
        result,
        isLoading: false,
        triedLocal: true, // All phases attempted in orchestrator
        triedCache: true,
        triedAPIs: true,
        showAssistantSuggestion: result.source === null, // Show suggestion if nothing found
        assistantContext:
          result.source === null
            ? {
                originalQuery: trimmed,
                searchResult: result,
                availableLocally: false,
              }
            : null,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        result: null,
        showAssistantSuggestion: true,
        assistantContext: {
          originalQuery: trimmed,
          searchResult: null,
          availableLocally: false,
        },
      }));

      console.error('Lyrics search error:', error);
      return null;
    }
  }, []);

  /**
   * Check if lyrics are available without full search
   * Used for pre-fetch or UI indication
   */
  const checkAvailability = useCallback(async (query: string) => {
    try {
      return await checkLyricsAvailability(query);
    } catch (error) {
      console.error('Availability check error:', error);
      return false;
    }
  }, []);

  /**
   * Prepare context for assistant handoff
   */
  const getAssistantHandoffContext = useCallback(() => {
    if (!state.result) {
      return {
        originalQuery: state.query,
        searchAttempted: true,
        lyricsFound: false,
        resultSource: null,
      };
    }

    return {
      originalQuery: state.query,
      searchAttempted: true,
      lyricsFound: state.result.source !== null,
      resultSource: state.result.source,
      resultTitle: state.result.title,
      resultArtist: state.result.artist,
      confidence: state.result.confidence,
    };
  }, [state]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      query: '',
      isLoading: false,
      error: null,
      result: null,
      triedLocal: false,
      triedCache: false,
      triedAPIs: false,
      showAssistantSuggestion: false,
      assistantContext: null,
    });
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    // State
    query: state.query,
    isLoading: state.isLoading,
    error: state.error,
    result: state.result,
    showAssistantSuggestion: state.showAssistantSuggestion,
    assistantContext: state.assistantContext,
    
    // Methods
    searchLyrics,
    checkAvailability,
    getAssistantHandoffContext,
    reset,
    clearError,
  };
}
