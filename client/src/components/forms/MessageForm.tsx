import { useState, useContext } from "react";
import { UserContext } from "@/App";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type MessageFormProps = {
  receiverId: number;
  onMessageSent?: () => void;
};

export default function MessageForm({ receiverId, onMessageSent }: MessageFormProps) {
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const [message, setMessage] = useState("");

  const sendMessageMutation = useMutation({
    mutationFn: () => 
      apiRequest('POST', '/api/messages', {
        senderId: user?.id,
        receiverId,
        content: message
      }),
    onSuccess: () => {
      setMessage(""); // Clear input
      if (onMessageSent) onMessageSent();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate();
  };

  return (
    <form onSubmit={handleSendMessage} className="flex items-end gap-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="resize-none min-h-[80px]"
      />
      <Button 
        type="submit" 
        size="icon" 
        className="h-10 w-10" 
        disabled={!message.trim() || sendMessageMutation.isPending}
      >
        <Plane className="h-5 w-5" />
      </Button>
    </form>
  );
}
