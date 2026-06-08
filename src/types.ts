export interface Channel {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  streamUrl: string;
}

export interface ScheduleItem {
  time: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
}
