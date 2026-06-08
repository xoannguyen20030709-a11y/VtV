import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle } from "lucide-react";

interface HLSPlayerProps {
  streamUrl: string;
  poster?: string;
  autoPlay?: boolean;
}

// Fallback stream in case the Vietnam IPTV link is offline/geo-blocked
const FALLBACK_STREAM = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export default function HLSPlayer({ streamUrl, poster, autoPlay = true }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [playingFallback, setPlayingFallback] = useState(false);

  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;

    if (!video) return;

    const loadStream = (url: string) => {
      setError(null);
      if (Hls.isSupported()) {
        if (hls) {
          hls.destroy();
        }
        
        // Low latency optimization configurations
        hls = new Hls({
          maxBufferLength: 30, // lower buffer for closer to live
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            video.play().catch(e => console.log("Auto-play prevented", e));
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("fatal network error encountered, try to recover");
                hls?.startLoad();
                if (!playingFallback) {
                  console.warn("Switching to fallback stream due to VTV link constraint");
                  setPlayingFallback(true);
                  loadStream(FALLBACK_STREAM); // Use fallback stream
                } else {
                  setError("Không thể tải luồng dữ liệu. Vui lòng thử lại sau.");
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("fatal media error encountered, try to recover");
                hls?.recoverMediaError();
                break;
              default:
                hls?.destroy();
                setError("Có lỗi hệ thống khi tải video.");
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          if (autoPlay) {
            video.play().catch(e => console.log("Auto-play prevented", e));
          }
        });
        video.addEventListener("error", () => {
          if (!playingFallback) {
            setPlayingFallback(true);
            video.src = FALLBACK_STREAM;
            video.play().catch(e => console.log("Fallback auto-play prevented", e));
          } else {
            setError("Không thể tải luồng dữ liệu. Vui lòng thử lại sau.");
          }
        });
      } else {
        setError("Trình duyệt của bạn không hỗ trợ định dạng video này.");
      }
    };

    loadStream(streamUrl);
    setPlayingFallback(false);

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl, autoPlay]); // Re-run when streamUrl changes

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-xl border border-white/10">
      {error ? (
        <div className="flex flex-col items-center text-red-500 p-4 text-center">
          <AlertCircle className="w-12 h-12 mb-2 text-red-500" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-contain bg-black"
            controls
            poster={poster}
            playsInline
          />
          {playingFallback && (
            <div className="absolute top-4 left-4 bg-yellow-500/90 text-black text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1 backdrop-blur-sm z-10">
              <AlertCircle className="w-3 h-3" />
              TÍN HIỆU DỰ PHÒNG (Demo)
            </div>
          )}
          {!playingFallback && !error && (
            <div className="absolute top-4 left-4 bg-red-600/90 text-white text-xs font-bold px-3 py-1 animate-pulse rounded-full shadow flex items-center gap-1 backdrop-blur-sm z-10">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              TRỰC TIẾP
            </div>
          )}
        </>
      )}
    </div>
  );
}
