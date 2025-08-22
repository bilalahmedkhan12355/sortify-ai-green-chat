import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import IntroScreen from "@/components/IntroScreen";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    setShowIntro(false);
  };

  const handleNewChat = () => {
    setCurrentChatId(undefined);
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroScreen onComplete={handleIntroComplete} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
        />
        
        <main className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="ml-2" />
            <h1 className="ml-4 font-semibold text-foreground">EcoChat Assistant</h1>
          </header>
          
          <div className="flex-1">
            <ChatInterface 
              chatId={currentChatId}
              onChatCreated={(id: string) => setCurrentChatId(id)}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
