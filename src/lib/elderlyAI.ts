/**
 * Elderly-Friendly Bhajan Search with Q&A Knowledge Base
 * Simple database search + knowledge base Q&A - no external APIs
 * Voice and text input → Intent detection → Knowledge base OR Database search → Display results
 * Production-ready
 */

import { Bhajan } from '@/data/bhajans';
import { searchUserBhajans } from './supabaseQueries';
import { 
  findMatchingKnowledge, 
  getRelatedKeywords, 
  isQuestionQuery,
  type KnowledgeItem 
} from './bhajanKnowledgeBase';

export interface AIResponse {
  text: string; // Simple acknowledgment message or Q&A answer
  bhajans?: Bhajan[]; // Search results from database
  intent: 'search' | 'recommend' | 'explain' | 'greeting' | 'help' | 'question';
  isQA?: boolean; // True if this is a Q&A response
  knowledgeItem?: KnowledgeItem; // Original knowledge base item
}

// Hindi stop words to ignore when extracting keywords
const HINDI_STOP_WORDS = [
  'से', 'का', 'के', 'की', 'भजन', 'गाना', 'गीत', 'दिखाएं', 
  'खोजें', 'लगाये', 'सुनें', 'चाहता', 'चाहती', 'है', 'हैं', 'को', 'में',
  'मुझे', 'मेरा', 'मेरे', 'तेरा', 'और', 'या'
];

// English stop words to ignore
const ENGLISH_STOP_WORDS = [
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'is', 'are', 'bhajan', 'song', 'show', 'find', 'search',
  'me', 'my', 'i', 'want', 'like'
];

/**
 * Extract keywords from user message
 * Example: "कृष्ण के भजन दिखाएं" → ["कृष्ण"]
 */
export function extractKeywords(message: string): string[] {
  if (!message) return [];

  // Convert to lowercase and split by spaces
  const tokens = message.toLowerCase().trim().split(/\s+/);
  
  // Filter out stop words and empty tokens
  const keywords = tokens.filter(token => {
    return token.length > 1 && 
           !HINDI_STOP_WORDS.includes(token) &&
           !ENGLISH_STOP_WORDS.includes(token);
  });

  console.log('Extracted keywords:', keywords);
  return keywords;
}

/**
 * Parse user intent from message
 */
export function parseIntent(message: string): AIResponse['intent'] {
  const lower = message.toLowerCase();

  // Check if it's a question first
  if (isQuestionQuery(message)) {
    return 'question';
  }

  if (
    lower.includes('नमस्ते') ||
    lower.includes('hello') ||
    lower.includes('hi') ||
    lower.includes('सुबह') ||
    lower.includes('नमो')
  ) {
    return 'greeting';
  }

  if (
    lower.includes('क्या है') ||
    lower.includes('मतलब') ||
    lower.includes('meaning') ||
    lower.includes('explain') ||
    lower.includes('समझाएं')
  ) {
    return 'explain';
  }

  if (
    lower.includes('सुझाव') ||
    lower.includes('पसंद') ||
    lower.includes('recommend') ||
    lower.includes('suggest') ||
    lower.includes('सुझाएं')
  ) {
    return 'recommend';
  }

  if (
    lower.includes('मदद') ||
    lower.includes('कैसे') ||
    lower.includes('help') ||
    lower.includes('how') ||
    lower.includes('कैसे')
  ) {
    return 'help';
  }

  return 'search';
}

/**
 * Generate simple acknowledgment message
 */
export function generateAcknowledgment(userMessage: string, resultCount: number): string {
  const messages = {
    found: [
      `${resultCount} भजन मिले।`,
      `यहाँ ${resultCount} भजन हैं।`,
      `ये ${resultCount} भजन आपके लिए हैं।`,
      `${resultCount} भजन ढूंढे गए।`,
    ],
    notFound: [
      'क्षमा करें, भजन नहीं मिले। फिर से खोजें।',
      'यह भजन नहीं मिला। दूसरा नाम बताएं।',
      'ये भजन हमारे पास नहीं हैं।',
      'खोज में कोई परिणाम नहीं।',
    ],
  };

  if (resultCount > 0) {
    const msgs = messages.found;
    return msgs[Math.floor(Math.random() * msgs.length)];
  } else {
    const msgs = messages.notFound;
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
}

/**
 * Generate welcome message for elderly users
 */
export function getWelcomeMessage(): string {
  return `🙏 नमस्ते! मैं आपका भजन सहायक हूं।

आप मुझसे पूछ सकते हैं:
• "कृष्ण के भजन"
• "हनुमान भजन"
• "शांत संगीत"
• "राम के गाने"

बस बोलिए या लिखिए! 🎵`;
}

/**
 * Format response for elderly users (keep it short and simple)
 */
export function formatForElderly(text: string): string {
  return text
    .trim()
    .substring(0, 300);
}

/**
 * Main function to process elderly user request (Database search + Q&A Knowledge Base)
 */
export async function processElderlyRequest(
  userMessage: string,
  bhajans: Bhajan[],
  userName: string = 'भाई/बहन',
  allDeities?: Array<{ id: number; name: string; nameHindi: string }>,
  previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<AIResponse> {
  const intent = parseIntent(userMessage);

  try {
    console.log('Processing message:', userMessage, 'Intent:', intent);
    
    // First, check if it's a Q&A question
    if (intent === 'question') {
      const knowledgeItem = findMatchingKnowledge(userMessage);
      
      if (knowledgeItem) {
        console.log('Found knowledge item:', knowledgeItem.id);
        
        // Get related bhajans using keywords from knowledge base
        const relatedKeywords = getRelatedKeywords(knowledgeItem);
        let relatedBhajans: Bhajan[] = [];
        
        if (relatedKeywords.length > 0) {
          try {
            const matchedResults = await searchUserBhajans(relatedKeywords.join(' '), 5);
            relatedBhajans = matchedResults.map((b: any) => ({
              id: parseInt(b.id),
              slug: b.title.toLowerCase().replace(/\s+/g, '-'),
              title: b.title,
              titleHindi: b.title_hindi,
              deityId: b.deity_id,
              singerName: b.singer_name,
              composerName: b.composer_name || '',
              youtubeUrl: b.youtube_url || '',
              lyricsHindi: b.lyrics_hindi,
              lyricsTransliteration: '',
              playCount: b.play_count || 0,
              rating: b.average_rating || 0,
              tags: b.mood_tags || [],
              featured: false,
            }));
          } catch (searchError) {
            console.log('Could not find related bhajans:', searchError);
          }
        }

        // Use Hindi answer by default
        return {
          text: knowledgeItem.answerHindi || knowledgeItem.answer,
          bhajans: relatedBhajans.length > 0 ? relatedBhajans : undefined,
          intent: 'question',
          isQA: true,
          knowledgeItem
        };
      }
    }
    
    // If not a Q&A or no knowledge match, do regular bhajan search
    const keywords = extractKeywords(userMessage);
    
    if (keywords.length === 0) {
      // No keywords found - return greeting
      return {
        text: 'नमस्ते! कृपया कोई भजन का नाम बताएं या देवता का नाम कहें। 🙏',
        bhajans: [],
        intent: 'greeting',
      };
    }

    // Search database for matching bhajans using first keyword
    const searchQuery = keywords.join(' ');
    console.log('Searching for bhajans:', searchQuery);
    
    const matchedBhajans = await searchUserBhajans(searchQuery, 10);
    
    console.log('Found bhajans:', matchedBhajans.length);

    // Convert results to Bhajan format
    const formattedBhajans: Bhajan[] = matchedBhajans.map((b: any) => ({
      id: parseInt(b.id),
      slug: b.title.toLowerCase().replace(/\s+/g, '-'),
      title: b.title,
      titleHindi: b.title_hindi,
      deityId: b.deity_id,
      singerName: b.singer_name,
      composerName: b.composer_name || '',
      youtubeUrl: b.youtube_url || '',
      lyricsHindi: b.lyrics_hindi,
      lyricsTransliteration: '',
      playCount: b.play_count || 0,
      rating: b.average_rating || 0,
      tags: b.mood_tags || [],
      featured: false,
    }));

    // Generate simple acknowledgment
    const acknowledgment = generateAcknowledgment(userMessage, formattedBhajans.length);

    return {
      text: acknowledgment,
      bhajans: formattedBhajans,
      intent: formattedBhajans.length > 0 ? 'search' : 'help',
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      text: 'क्षमा करें, खोज में समस्या आई। कृपया फिर से कोशिश करें।',
      bhajans: [],
      intent: 'help',
    };
  }
}
