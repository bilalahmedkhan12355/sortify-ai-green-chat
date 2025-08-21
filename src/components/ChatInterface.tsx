import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Recycle, Trash2, Leaf, Menu } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm Sortify, your AI recycling assistant. I can help you sort waste, find recycling centers, and learn about sustainable practices. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputValue),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border p-4 hidden md:flex flex-col">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-gradient-eco rounded-lg flex items-center justify-center">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-bold text-lg">Sortify.io</h2>
        </div>
        
        <div className="space-y-2 flex-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left h-auto p-3"
              onClick={() => setInputValue(action.text)}
            >
              <action.icon className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm">{action.text}</span>
            </Button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Made with 💚 for a sustainable future
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-semibold">Chat with Sortify</h1>
                <p className="text-sm text-muted-foreground">Your AI recycling assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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