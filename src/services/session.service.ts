import { Injectable, signal, computed, effect } from '@angular/core';
import { Session, User, Link, Comment, Vote } from '../models/entities';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private sessions = signal<Map<string, Session>>(new Map());
  
  currentUser = signal<User | null>(null);
  currentSessionId = signal<string | null>(null);
  
  currentSession = computed<Session | undefined>(() => {
    const sessionId = this.currentSessionId();
    if (!sessionId) return undefined;
    return this.sessions().get(sessionId);
  });
  
  sessionExists = (sessionId: string) => this.sessions().has(sessionId);

  constructor() {
    // For demonstration purposes, create a sample session.
    this.createDebugSession();
  }

  private createDebugSession() {
    const debugUser: User = { 
      id: 'user-debug', 
      name: 'Alice',
      avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=Alice&backgroundColor=4f46e5,10b981,4338ca&textColor=f9fafb'
    };
    const debugLink1: Link = { 
        id: 'link-1', 
        url: 'https://angular.dev', 
        title: 'Angular Official Website', 
        description: 'The official documentation and resources for the Angular framework.', 
        submittedBy: debugUser,
        votes: [{userId: 'user-debug', direction: 'up'}],
        comments: [{id: 'comment-1', user: debugUser, text: 'Great resource!', timestamp: new Date()}],
        createdAt: new Date()
    };
    const debugSession: Session = {
        id: '12345',
        users: [debugUser],
        links: [debugLink1]
    };
    const newSessions = new Map<string, Session>();
    newSessions.set('12345', debugSession);
    this.sessions.set(newSessions);
  }

  createSession(username: string): string {
    const user = this.getOrCreateUser(username);
    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newSession: Session = {
      id: sessionId,
      users: [user],
      links: [],
    };
    
    this.sessions.update(sessions => {
      // FIX: Explicitly type the new Map to ensure correct type inference for its contents.
      const newSessions = new Map<string, Session>(sessions);
      newSessions.set(sessionId, newSession);
      return newSessions;
    });

    this.currentUser.set(user);
    this.currentSessionId.set(sessionId);
    return sessionId;
  }

  joinSession(sessionId: string, username: string): boolean {
    const session = this.sessions().get(sessionId);
    if (!session) {
      return false;
    }

    const user = this.getOrCreateUser(username);
    
    this.sessions.update(sessions => {
        // FIX: Explicitly type the new Map to ensure correct type inference for its contents. This resolves the error on line 80 and 81.
        const newSessions = new Map<string, Session>(sessions);
        const existingSession = newSessions.get(sessionId);
        if(existingSession && !existingSession.users.find(u => u.id === user.id)){
            existingSession.users.push(user);
        }
        return newSessions;
    });

    this.currentUser.set(user);
    this.currentSessionId.set(sessionId);
    return true;
  }

  leaveSession() {
    this.currentUser.set(null);
    this.currentSessionId.set(null);
  }

  addLink(url: string, title: string, description: string) {
    const sessionId = this.currentSessionId();
    const user = this.currentUser();
    if (!sessionId || !user) return;

    const newLink: Link = {
      id: `link-${Date.now()}`,
      url,
      title,
      description,
      submittedBy: user,
      votes: [],
      comments: [],
      createdAt: new Date(),
    };

    this.sessions.update(sessions => {
      // FIX: Explicitly type the new Map to ensure correct type inference for its contents. This resolves the error on line 116 and 118.
      const newSessions = new Map<string, Session>(sessions);
      const session = newSessions.get(sessionId);
      if (session) {
        session.links.push(newLink);
        // Sort links by creation date, newest first
        session.links.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return newSessions;
    });
  }

  vote(linkId: string, direction: 'up' | 'down') {
    const sessionId = this.currentSessionId();
    const user = this.currentUser();
    if (!sessionId || !user) return;

    this.sessions.update(sessions => {
        // FIX: Explicitly type the new Map to ensure correct type inference for its contents. This resolves the error on line 133.
        const newSessions = new Map<string, Session>(sessions);
        const session = newSessions.get(sessionId);
        if (session) {
            const link = session.links.find(l => l.id === linkId);
            if (link) {
                const existingVoteIndex = link.votes.findIndex(v => v.userId === user.id);
                if (existingVoteIndex > -1) {
                    // If clicking the same direction, remove vote. Otherwise, change direction.
                    if (link.votes[existingVoteIndex].direction === direction) {
                        link.votes.splice(existingVoteIndex, 1);
                    } else {
                        link.votes[existingVoteIndex].direction = direction;
                    }
                } else {
                    link.votes.push({ userId: user.id, direction });
                }
            }
        }
        return newSessions;
    });
  }

  addComment(linkId: string, text: string) {
    const sessionId = this.currentSessionId();
    const user = this.currentUser();
    if (!sessionId || !user || !text.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      user,
      text: text.trim(),
      timestamp: new Date(),
    };

    this.sessions.update(sessions => {
        // FIX: Explicitly type the new Map to ensure correct type inference for its contents. This resolves the error on line 168.
        const newSessions = new Map<string, Session>(sessions);
        const session = newSessions.get(sessionId);
        if (session) {
            const link = session.links.find(l => l.id === linkId);
            if(link) {
                link.comments.push(newComment);
            }
        }
        return newSessions;
    });
  }

  private getOrCreateUser(name: string): User {
    // In a real app, this would be more robust. Here, we simplify.
    const sanitizedName = encodeURIComponent(name);
    return { 
      id: `user-${name.toLowerCase()}`, 
      name,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${sanitizedName}&backgroundColor=4f46e5,10b981,4338ca&textColor=f9fafb`
    };
  }
}