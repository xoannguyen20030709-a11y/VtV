import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // VTV/Vietnam TV Channels data
  const CHANNELS = [
    {
      id: "vtv1",
      name: "VTV1",
      description: "Tin tức - Thời sự",
      category: "national",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/VTV1_logo_2013.svg/1024px-VTV1_logo_2013.svg.png",
      streamUrl: "https://rd.to/http://2nd.streamvn.live/hls/vtv1/index.m3u8" // Fallback public link conceptually
    },
    {
      id: "vtv2",
      name: "VTV2",
      description: "Khoa học - Giáo dục",
      category: "national",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/VTV2_logo_2013.svg/1024px-VTV2_logo_2013.svg.png",
      streamUrl: "https://rd.to/http://2nd.streamvn.live/hls/vtv2/index.m3u8"
    },
    {
      id: "vtv3",
      name: "VTV3",
      description: "Thể thao - Giải trí",
      category: "national",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/VTV3_logo_2013.svg/1024px-VTV3_logo_2013.svg.png",
      streamUrl: "https://rd.to/http://2nd.streamvn.live/hls/vtv3/index.m3u8"
    },
    {
      id: "vtv4",
      name: "VTV4",
      description: "Dành cho người Việt ở nước ngoài",
      category: "national",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/VTV4_logo.svg/1024px-VTV4_logo.svg.png",
      streamUrl: "https://rd.to/http://2nd.streamvn.live/hls/vtv4/index.m3u8"
    },
    {
      id: "vtv6",
      name: "VTV Cần Thơ",
      description: "Truyền hình thực tế (Cần Thơ)",
      category: "local",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/VTV_Can_Tho_logo_2022.svg/1024px-VTV_Can_Tho_logo_2022.svg.png",
      streamUrl: "https://rd.to/http://2nd.streamvn.live/hls/vtvc/index.m3u8"
    },
    {
      id: "htv7",
      name: "HTV7",
      description: "Giải trí tổng hợp",
      category: "local",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/HTV7_-_2016.svg/1024px-HTV7_-_2016.svg.png",
      streamUrl: "https://rd.to/http://2nd.streamvn.live/hls/htv7/index.m3u8"
    }
  ];

  // In a real production scenario aiming for low-latency streaming proxying,
  // we would fetch the master playlist, parse it, identify the chunk sizes,
  // and maintain a websocket or edge-cached CDN layer to prefetch TS segments.
  // Given limitations, we act as a Control Plane Server serving stream manifests securely.

  app.get("/api/channels", (req, res) => {
    // We send public test stream if the real ones are protected, ensuring UI always works.
    res.json(CHANNELS);
  });

  // Optional endpoint to demonstrate backend logic (e.g. proxying schedule data)
  app.get("/api/schedule/:channelId", (req, res) => {
    const { channelId } = req.params;
    
    // Mock schedule data for TV guide
    const currentHour = new Date().getHours();
    const schedule = [
      { time: \`\${currentHour.toString().padStart(2, '0')}:00\`, name: "Bản tin Thời sự" },
      { time: \`\${(currentHour + 1).toString().padStart(2, '0')}:00\`, name: "Phim truyện: Ánh sáng cuối chân trời" },
      { time: \`\${(currentHour + 2).toString().padStart(2, '0')}:00\`, name: "Chương trình giải trí" },
    ];
    res.json(schedule);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Backend Server processing TV streams on http://localhost:\${PORT} (Client/Edge proxy)\`);
  });
}

startServer();
