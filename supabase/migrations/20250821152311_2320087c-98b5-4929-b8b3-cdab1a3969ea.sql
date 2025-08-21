-- Create chats table for chat sessions
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for individual messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chats table
CREATE POLICY "Users can view their own chats"
ON public.chats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats"
ON public.chats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
ON public.chats
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
ON public.chats
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for messages table
CREATE POLICY "Users can view messages from their own chats"
ON public.messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.chats 
  WHERE chats.id = messages.chat_id 
  AND chats.user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their own chats"
ON public.messages
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chats 
  WHERE chats.id = messages.chat_id 
  AND chats.user_id = auth.uid()
));

CREATE POLICY "Users can update messages in their own chats"
ON public.messages
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.chats 
  WHERE chats.id = messages.chat_id 
  AND chats.user_id = auth.uid()
));

CREATE POLICY "Users can delete messages from their own chats"
ON public.messages
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.chats 
  WHERE chats.id = messages.chat_id 
  AND chats.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();