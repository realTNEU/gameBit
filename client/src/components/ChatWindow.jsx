import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { getSocket } from "../lib/socket";
import useAuthStore from "../store/authStore";

export default function ChatWindow({ chatId, onClose }) {
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState({});
  const messagesEndRef = useRef(null);
  const socket = getSocket();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: chat } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => api.get(`/chat/${chatId}`).then(res => res.data),
    enabled: !!chatId
  });

  const sendMessage = useMutation({
    mutationFn: (data) => api.post("/chat", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
    }
  });

  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit("join_chat", chatId);

    socket.on("new_message", (data) => {
      if (data.chatId === chatId) {
        queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
      }
    });

    socket.on("typing", (data) => {
      if (data.userId !== user?._id) {
        setIsTyping({ ...isTyping, [data.userId]: data.isTyping });
        setTimeout(() => {
          setIsTyping(prev => {
            const next = { ...prev };
            delete next[data.userId];
            return next;
          });
        }, 3000);
      }
    });

    return () => {
      socket.emit("leave_chat", chatId);
      socket.off("new_message");
      socket.off("typing");
    };
  }, [socket, chatId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !chatId) return;

    socket.emit("send_message", {
      chatId,
      content: message,
      attachments: []
    });

    setMessage("");
    setTyping(false);
    socket.emit("typing", { chatId, isTyping: false });
  };

  let typingTimeout;

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!typing) {
      setTyping(true);
      socket?.emit("typing", { chatId, isTyping: true });
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setTyping(false);
      socket?.emit("typing", { chatId, isTyping: false });
    }, 1000);
  };

  const otherParticipant = chat?.participants?.find(p => p._id !== user?._id);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="font-semibold">{otherParticipant?.username}</h3>
          <p className="text-xs text-gray-500">
            {otherParticipant?.online ? "Online" : "Offline"}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat?.messages?.map((msg, idx) => {
          const isOwn = msg.sender?._id === user?._id;
          return (
            <div
              key={idx}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                  {isOwn && msg.read && " ✓✓"}
                </p>
              </div>
            </div>
          );
        })}
        {Object.keys(isTyping).length > 0 && (
          <div className="text-sm text-gray-500 italic">
            {Object.keys(isTyping).map(id => {
              const user = chat?.participants?.find(p => p._id === id);
              return user?.username;
            }).join(", ")} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

