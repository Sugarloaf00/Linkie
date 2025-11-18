
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Vote {
  userId: string;
  direction: 'up' | 'down';
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: Date;
}

export interface Link {
  id: string;
  url: string;
  title: string;
  description: string;
  submittedBy: User;
  votes: Vote[];
  comments: Comment[];
  createdAt: Date;
}

export interface Session {
  id: string;
  users: User[];
  links: Link[];
}