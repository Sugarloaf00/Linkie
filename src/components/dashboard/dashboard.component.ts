
import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { GeminiService } from '../../services/gemini.service';
import { LinkItemComponent } from '../link-item/link-item.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [LinkItemComponent, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  sessionService = inject(SessionService);
  geminiService = inject(GeminiService);

  newLinkUrl = signal('');
  isSubmitting = signal(false);
  submissionError = signal<string | null>(null);
  
  session = this.sessionService.currentSession;
  links = computed(() => this.session()?.links || []);

  async handleAddLink() {
    const url = this.newLinkUrl().trim();
    if (!url) {
      this.submissionError.set('URL cannot be empty.');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(url);
    } catch (_) {
      this.submissionError.set('Please enter a valid URL.');
      return;
    }

    this.isSubmitting.set(true);
    this.submissionError.set(null);

    const details = await this.geminiService.generateLinkDetails(url);
    if (details) {
      this.sessionService.addLink(url, details.title, details.description);
      this.newLinkUrl.set('');
    } else {
      this.submissionError.set(this.geminiService.error() || 'Failed to generate link details.');
    }
    
    this.isSubmitting.set(false);
  }
}
