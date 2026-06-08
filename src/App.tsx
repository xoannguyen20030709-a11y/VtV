import { useEffect, useState } from "react";
import axios from "axios";
import HLSPlayer from "./components/HLSPlayer";
import { Channel, ScheduleItem, ChatMessage } from "./types";
import { Tv, MessageSquare, Clock, Users, Send, Radio, ChevronRight, Menu, X } from "lucide-react";

export default function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axios.get<Channel[]>("/api/channels");
        setChannels(response.data);
        if (response.data.length > 0) {
          setActiveChannel(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch channels", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChannels();
  }, []);

  // Fetch Schedule and reset chat when channel changes
  useEffect(() => {
    if (!activeChannel) return;

    const fetchSchedule = async () => {
      try {
        const response = await axios.get<ScheduleItem[]>(\`/api/schedule/\${activeChannel.id}\`);
        setSchedule(response.data);
      } catch (error) {
        console.error("Failed to fetch schedule", error);
      }
    };

    fetchSchedule();
    setChatMessages([
      { id: "1", user: "Hệ thống", text: \`Chào mừng bạn đến với kênh \${activeChannel.name}\`, time: new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) }
    ]);
  }, [activeChannel]);

  // Handle mock chat sending
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "Bạn",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput("");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-medium tracking-widest text-sm uppercase">Đang kết nối vệ tinh...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg flex items-center justify-between px-4 lg:px-8 relative z-50">
        <div className="flex items-center gap-3">
          <button 
            className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2 text-red-600">
            <Radio className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              VTV<span className="text-red-600">GO</span> <span className="font-medium text-zinc-500 text-sm xl:text-base hidden sm:inline ml-2">| Hệ thống truyền phát tốc độ cao</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="hidden sm:flex items-center gap-2 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            Máy chủ biên (Edge) đang hoạt động
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full transition-colors text-xs sm:text-sm shadow-lg shadow-red-600/20">
            Đăng nhập
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar - Channels */}
        <div className={\`
          absolute lg:static top-0 left-0 h-full w-64 bg-zinc-950/95 lg:bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-300 z-40 backdrop-blur-xl lg:backdrop-blur-none
          \${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        \`}>
          <div className="p-4 flex items-center justify-between lg:justify-start gap-2 border-b border-zinc-800/50">
            <Tv className="w-5 h-5 text-red-500" />
            <h2 className="font-semibold text-zinc-200">Danh sách kênh</h2>
            <div className="lg:hidden w-5"></div> {/* Spacer for close button alignment */}
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
            <div className="p-2 space-y-1">
              {channels.map(channel => {
                const isActive = activeChannel?.id === channel.id;
                return (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setActiveChannel(channel);
                      setIsSidebarOpen(false);
                    }}
                    className={\`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group \${
                      isActive 
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                        : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                    }\`}
                  >
                    <div className={\`w-10 h-10 rounded-md bg-white p-1 shrink-0 flex items-center justify-center \${isActive ? 'opacity-100 ring-2 ring-white/30' : 'opacity-80 group-hover:opacity-100'}\`}>
                      <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="font-bold truncate">{channel.name}</div>
                      <div className={\`text-xs truncate \${isActive ? "text-red-200" : "text-zinc-500 group-hover:text-zinc-400"}\`}>
                        {channel.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Center - Player & Info */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-black">
          {activeChannel && (
            <div className="flex-1 flex flex-col">
              {/* Player Container */}
              <div className="w-full bg-black">
                <div className="max-w-6xl mx-auto w-full aspect-video">
                  <HLSPlayer streamUrl={activeChannel.streamUrl} />
                </div>
              </div>

              {/* Title & Info Banner */}
              <div className="w-full bg-zinc-950 px-4 py-6 sm:px-8 border-b border-zinc-800">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">TRỰC TIẾP</span>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">{activeChannel.name}</h2>
                    </div>
                    <p className="text-zinc-400 mt-1">{activeChannel.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span>124.5K người đang xem</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Area - Split down below player on small screens, or uses full width on large screens */}
            </div>
          )}
        </div>

        {/* Right Sidebar - Social & Schedule (Hidden on smaller screens, togglable) */}
        <div className="hidden xl:flex w-80 bg-zinc-950 border-l border-zinc-800 flex-col">
          
          {/* Lịch phát sóng */}
          <div className="flex-1 border-b border-zinc-800 flex flex-col min-h-0">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Clock className="w-4 h-4 text-blue-400" />
                Lịch phát sóng
              </div>
              <span className="text-xs text-zinc-500 font-medium">Hôm nay</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">
              {schedule.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 group">
                  <div className="text-emerald-500 font-mono text-sm font-semibold pt-1">{item.time}</div>
                  <div className="flex-1">
                    <div className={\`text-sm font-medium \${idx === 0 ? "text-white" : "text-zinc-300"}\`}>{item.name}</div>
                    {idx === 0 && <div className="text-xs text-red-400 mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping"></span> Đang chiếu</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Chat */}
          <div className="flex-[1.5] flex flex-col min-h-0 bg-zinc-950">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2 font-semibold text-white shrink-0">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Bình luận trực tiếp
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">
              {chatMessages.map(msg => (
                <div key={msg.id} className="text-sm">
                  <span className="text-zinc-500 text-xs mr-2">{msg.time}</span>
                  <span className={\`font-medium mr-2 \${msg.user === 'Hệ thống' ? 'text-red-400' : msg.user === 'Bạn' ? 'text-blue-400' : 'text-zinc-300'}\`}>
                    {msg.user}:
                  </span>
                  <span className="text-zinc-200">{msg.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-900/30 shrink-0">
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500 transition-all">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Nhập nội dung..."
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="text-white disabled:text-zinc-600 hover:text-blue-400 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
