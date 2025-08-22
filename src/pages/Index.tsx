import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import IntroScreen from "@/components/IntroScreen";
import ChatInterface from "@/components/ChatInterface";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const { user, session, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth");
    }
  }, [session, loading, navigate]);

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse-eco">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to auth
  }

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
          <header className="h-12 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2" />
              <h1 className="font-semibold text-foreground">EcoChat Assistant</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
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
