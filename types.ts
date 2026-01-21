export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export interface Message {
  id: string;
  role: Sender;
  content: string;
  timestamp: number;
  image?: string; // Base64 data URL
  isStreaming?: boolean;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}