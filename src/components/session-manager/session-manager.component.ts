
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-session-manager',
  templateUrl: './session-manager.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionManagerComponent {
  username = signal('');
  sessionId = signal('');
  error = signal<string | null>(null);

  constructor(public sessionService: SessionService) {}

  handleCreateSession() {
    if (!this.username().trim()) {
      this.error.set('Please enter a username.');
      return;
    }
    this.error.set(null);
    this.sessionService.createSession(this.username().trim());
  }

  handleJoinSession() {
    if (!this.username().trim() || !this.sessionId().trim()) {
      this.error.set('Please enter a username and session ID.');
      return;
    }
    const sessionId = this.sessionId().trim();
    if (!this.sessionService.sessionExists(sessionId)) {
      this.error.set('Session ID not found.');
      return;
    }
    this.error.set(null);
    this.sessionService.joinSession(sessionId, this.username().trim());
  }
}
