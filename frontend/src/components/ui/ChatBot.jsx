import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Upload, 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2,
  TreePine,
  User,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  Leaf
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { mockApiCall } from "@/utils/mockGeminiAPI";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hi! 👋 I'm your **CleanSight Assistant**. Ask about recycling, disposal or reuse. 🌱" }
  ]);
  const liveRegionRef = useRef(null);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Convert file to base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  // Ensure Gemini output is Markdown formatted
  const formatGeminiOutput = (text) => {
    // Remove any "Response" prefixes that might come from the API
    let cleanText = text.replace(/^Response\s*:?\s*/i, '');
    cleanText = cleanText.replace(/^##\s*Response\s*:?\s*/i, '');
    cleanText = cleanText.replace(/^\*\*Response\*\*\s*:?\s*/i, '');
    return cleanText.trim();
  };

  const handleSend = async () => {
    if (!input && !image) return;

    const newMessage = {
      role: "user",
      content: input || "📷 Image uploaded",
      image: image ? URL.createObjectURL(image) : null,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

  try {
      // Take last 10 messages for context
      const recentMessages = messages.slice(-10);

      // Generate dynamic summary for follow-ups
      const contextSummary = recentMessages
        .map(
          (msg, idx) =>
            `${msg.role === "bot" ? "AI" : "User"}: ${msg.content}`
        )
        .join("\n");

      let parts = [];

      // Include user input and image
      if (input) parts.push({ text: input });
      if (image) {
        const base64 = await fileToBase64(image);
        parts.push({ inline_data: { mime_type: image.type, data: base64 } });
      }

      // Construct message payload
      const contents = [
        {
          role: "user",
          parts: [
            {
              text: `
You are CleanSight 🌱, a friendly AI assistant for recycling, reuse, disposal questions.
- Keep responses CONCISE and to the point (max 3-4 bullet points)
- Use simple, actionable advice
- Include relevant emojis (♻️, ✅, ⚠️, 🌱)
- Use brief markdown formatting
- Focus on practical steps, not explanations
- Conversation context:
${contextSummary}

User's query:
            `.trim(),
            },
            ...parts,
          ],
        },
      ];

      // Call mock API for development (replace with real API in production)
      const res = await mockApiCall.post("/api/gemini", { contents });
      const rawReply = res.data.reply || "⚠️ No response from CleanSight AI.";
      const botReply = formatGeminiOutput(rawReply);

      setMessages((prev) => [...prev, { role: "bot", content: botReply }]);
      setTimeout(()=>{ if(liveRegionRef.current) liveRegionRef.current.textContent='New AI reply'; }, 30);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠️ Error getting response from CleanSight AI. Please try again later." },
      ]);
      if(liveRegionRef.current) liveRegionRef.current.textContent='Error getting AI reply';
    }

    setLoading(false);
    setImage(null);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Enhanced Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="absolute inset-0 rounded-full ring-4 ring-green-300/40 animate-pulse" />
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleChat}
              className="relative w-16 h-16 bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              title="Open CleanSight AI Assistant"
            >
              <div className="absolute inset-0 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors" />
              <div className="relative z-10 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`fixed bottom-6 right-6 bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl flex flex-col border border-green-100 overflow-hidden z-50 transition-all duration-300 ${
              isMinimized ? "w-80 h-14" : "w-[25rem] h-[34rem] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-6rem)]"
            }`}
          >
            {/* Enhanced Header */}
            <div className="relative px-5 py-3 bg-green-600 text-white">
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-md">
                    <TreePine className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-sm tracking-wide">CleanSight AI</h1>
                    <p className="text-green-100 text-[11px]">Assistant • Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={minimizeChat}
                    className="p-2 hover:bg-white/20 rounded-md transition-all duration-200"
                    title={isMinimized ? "Expand" : "Minimize"}
                  >
                    {isMinimized ? (
                      <Maximize2 className="w-4 h-4" />
                    ) : (
                      <Minimize2 className="w-4 h-4" />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeChat}
                    className="p-2 hover:bg-white/20 rounded-md transition-all duration-200"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Enhanced Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/60 backdrop-blur-sm max-h-80 custom-scrollbar">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className={`flex items-end gap-3 ${msg.role === "bot" ? "justify-start" : "justify-end"}`}
                    >
                      {/* Avatar for bot messages */}
                      {msg.role === "bot" && (
                        <div className="flex-shrink-0 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center shadow ring-2 ring-white/60">
                          <TreePine className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}

                      <div
                        className={`relative max-w-[85%] transition-all duration-300 ${
                          msg.role === "bot"
                            ? "bg-white text-gray-800 rounded-2xl shadow-sm border border-gray-200"
                            : "bg-green-600 text-white rounded-2xl shadow"
                        }`}
                      >
                        {/* Message tail */}
                        <div className={`absolute ${
                          msg.role === "bot" 
                            ? "-left-2 bottom-3 w-4 h-4 bg-white transform rotate-45 border-l border-b border-gray-200" 
                            : "-right-2 bottom-3 w-4 h-4 bg-green-600 transform rotate-45"
                        }`} />

                        <div className="relative p-4">
                          {msg.image && (
                            <motion.img
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              src={msg.image}
                              alt="uploaded"
                              className="mb-3 max-h-40 rounded-2xl border-2 border-emerald-200/50 w-full object-cover shadow-md"
                            />
                          )}
                          
                          {msg.role === "bot" ? (
                            <div className="prose prose-emerald prose-sm max-w-none">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({node, ...props}) => <h1 className="text-sm font-semibold text-green-700 mb-1" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-sm font-semibold text-green-600 mb-1" {...props} />,
                                  p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-2 text-sm" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-none space-y-1" {...props} />,
                                  li: ({node, ...props}) => <li className="flex items-start gap-2 text-gray-700 text-sm" {...props} />,
                                  strong: ({node, ...props}) => <strong className="text-green-700 font-semibold" {...props} />,
                                  code: ({node, ...props}) => <code className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-[11px]" {...props} />
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <span className="text-sm font-medium">{msg.content}</span>
                          )}
                        </div>
                      </div>

                      {/* Avatar for user messages */}
                      {msg.role === "user" && (
                        <div className="flex-shrink-0 w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center shadow ring-2 ring-white/60">
                          <User className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Enhanced Loading Indicator */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-end gap-3 justify-start"
                    >
                      <div className="flex-shrink-0 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center shadow ring-2 ring-white/60">
                        <TreePine className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-white p-3 rounded-2xl rounded-bl-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                              className="w-2 h-2 bg-green-600 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                              className="w-2 h-2 bg-green-600 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                              className="w-2 h-2 bg-green-600 rounded-full"
                            />
                          </div>
                          <span className="text-xs text-gray-600 font-medium">AI is thinking...</span>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-4 h-4 text-green-600" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                  
                  {/* Quick Action Buttons */}
                  {messages.length === 1 && !loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-wrap gap-2 px-4 py-2"
                    >
                      {[
                        { label: "♻️ Plastic recycling", action: "How do I recycle plastic bottles?" },
                        { label: "🗑️ E-waste disposal", action: "How to dispose electronic waste safely?" },
                        { label: "🌱 Composting tips", action: "How can I start composting at home?" },
                        { label: "📱 Identify waste", action: "Help me identify waste from a photo" }
                      ].map((quickAction, index) => (
                        <motion.button
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 * index + 0.6 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setInput(quickAction.action);
                            setTimeout(handleSend, 100);
                          }}
                          className="px-3 py-1.5 bg-white/80 hover:bg-green-50 border border-green-200 rounded-full text-xs font-medium text-gray-700 hover:text-green-700 transition-all duration-200"
                        >
                          {quickAction.label}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Enhanced Input Area */}
                <div className="p-3 border-t border-gray-200 bg-white/90 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <motion.label 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="cursor-pointer group"
                    >
                      <div className="p-2.5 bg-green-50 rounded-xl group-hover:bg-green-100 transition-all duration-200 shadow-sm border border-green-100">
                        <Upload className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                      />
                    </motion.label>

                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about recycling, disposal, or reuse..."
                        className="w-full p-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-500"
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        disabled={loading}
                        aria-label="Chat message input"
                      />
                      {input && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <Leaf className="w-4 h-4 text-green-600" />
                        </motion.div>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={loading || (!input && !image)}
                      className="p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl shadow-sm hover:shadow transition-all duration-200 disabled:cursor-not-allowed group"
                      aria-label="Send message"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Enhanced Image Preview */}
                {image && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-3 bg-white/90 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200/50">
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="preview"
                          className="w-12 h-12 rounded-xl border-2 border-emerald-200 object-cover shadow-md"
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-2 h-2 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{image.name}</p>
                        <p className="text-xs text-gray-500">Ready to analyze</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setImage(null)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={liveRegionRef} aria-live="polite" className="sr-only" />

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(16, 185, 129, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #059669);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #047857);
        }
      `}</style>
    </>
  );
};

export default ChatBot;
