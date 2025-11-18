
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionManagerComponent } from './components/session-manager/session-manager.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SessionManagerComponent,
    DashboardComponent,
    StatisticsComponent,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  sessionService = inject(SessionService);
  currentView = signal<'dashboard' | 'statistics'>('dashboard');

  session = this.sessionService.currentSession;
  currentUser = this.sessionService.currentUser;
  
  leaveSession() {
    this.sessionService.leaveSession();
  }

  copySessionId() {
    const sessionId = this.session()?.id;
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
    }
  }
}
