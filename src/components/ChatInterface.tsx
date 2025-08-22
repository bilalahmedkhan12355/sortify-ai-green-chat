import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Recycle, Trash2, Leaf, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  chatId?: string;
  onChatCreated?: (chatId: string) => void;
}

const ChatInterface = ({ chatId, onChatCreated }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId);
      loadChatMessages(chatId);
    } else if (!chatId && currentChatId) {
      setCurrentChatId(undefined);
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    if (messages.length === 0 && !chatId) {
      // Show welcome message for new chats
      setMessages([{
        id: "welcome",
        text: "Hello! I'm Sortify, your AI recycling assistant. I can help you sort waste, find recycling centers, and learn about sustainable practices. What would you like to know?",
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, [messages, chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = data?.map(msg => ({
        id: msg.id,
        text: msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.created_at)
      })) || [];

      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive",
      });
    }
  };

  const createOrUpdateChat = async (firstMessage: string): Promise<string> => {
    try {
      if (!user) throw new Error('User not authenticated');

      if (currentChatId) {
        return currentChatId;
      }

      // Create new chat
      const { data, error } = await supabase
        .from('chats')
        .insert({
          user_id: user.id,
          title: firstMessage.substring(0, 50) || 'New Chat'
        })
        .select()
        .single();

      if (error) throw error;

      const newChatId = data.id;
      setCurrentChatId(newChatId);
      onChatCreated?.(newChatId);
      return newChatId;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
      throw error;
    }
  };

  const saveMessage = async (chatId: string, content: string, role: 'user' | 'assistant') => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          content,
          role
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: "Error",
        description: "Failed to save message",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue;
    setInputValue("");

    try {
      // Create or get chat ID
      let activeChatId = currentChatId;
      if (!activeChatId) {
        activeChatId = await createOrUpdateChat(messageText);
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev.filter(m => m.id !== "welcome"), userMessage]);
      setIsTyping(true);

      // Save user message
      await saveMessage(activeChatId, messageText, 'user');

      // Simulate AI response
      setTimeout(async () => {
        const aiResponseText = getAIResponse(messageText);
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponseText,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);

        // Save AI response
        await saveMessage(activeChatId, aiResponseText, 'assistant');
      }, 1500);
    } catch (error) {
      setIsTyping(false);
      console.error('Error sending message:', error);
    }
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("plastic") || input.includes("bottle")) {
      return "Plastic bottles can be recycled! Remove caps and labels, rinse clean, and place in your recycling bin. Look for the recycling symbol with numbers 1-7 to identify the plastic type. 🌱";
    }
    
    if (input.includes("paper") || input.includes("cardboard")) {
      return "Paper and cardboard are highly recyclable! Keep them dry, remove any plastic wrapping, and place in your paper recycling bin. Pizza boxes can be recycled if they're not too greasy. 📄♻️";
    }
    
    if (input.includes("glass")) {
      return "Glass is 100% recyclable and can be recycled endlessly! Rinse containers clean and remove lids. Clear, brown, and green glass can all be recycled. 🫙✨";
    }
    
    if (input.includes("battery") || input.includes("electronic")) {
      return "Electronic waste needs special handling! Never throw batteries or electronics in regular trash. Take them to designated e-waste collection points or retailer drop-off programs. 🔋♻️";
    }
    
    return "I'd be happy to help you with recycling questions! You can ask me about specific materials like plastic, paper, glass, electronics, or find local recycling centers. What specific item would you like to know about? 🌍💚";
  };

  const quickActions = [
    { icon: Recycle, text: "How to recycle plastic?", color: "bg-primary" },
    { icon: Trash2, text: "Find recycling centers", color: "bg-primary-light" },
    { icon: Leaf, text: "Eco-friendly tips", color: "bg-success" },
  ];

  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col">
        {/* Messages or Welcome Screen */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 1 ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-eco bg-clip-text text-transparent">
                  How can I help you today?
                </h1>
                <p className="text-muted-foreground text-lg">
                  I'm your AI recycling assistant. Ask me about waste sorting, recycling centers, or sustainable practices.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="p-6 h-auto flex flex-col items-center space-y-3 hover:bg-primary/5 transition-colors"
                    onClick={() => setInputValue(action.text)}
                  >
                    <action.icon className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                >
                  <div className={message.isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start animate-scale-in">
                  <div className="chat-bubble-ai">
                    <div className="typing-indicator">
                      <div className="typing-dot" style={{ '--delay': '0ms' } as any}></div>
                      <div className="typing-dot" style={{ '--delay': '150ms' } as any}></div>
                      <div className="typing-dot" style={{ '--delay': '300ms' } as any}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-card">
          <div className="flex space-x-2 max-w-4xl mx-auto">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about recycling, waste sorting, or sustainability..."
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="bg-gradient-eco hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Sortify can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;