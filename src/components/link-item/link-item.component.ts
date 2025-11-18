
import { Component, ChangeDetectionStrategy, input, computed, signal, inject } from '@angular/core';
import { Link, User } from '../../models/entities';
import { SessionService } from '../../services/session.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-link-item',
  templateUrl: './link-item.component.html',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkItemComponent {
  link = input.required<Link>();
  sessionService = inject(SessionService);
  currentUser = this.sessionService.currentUser;
  
  newCommentText = signal('');
  showComments = signal(false);

  voteCount = computed(() => {
    return this.link().votes.reduce((acc, vote) => acc + (vote.direction === 'up' ? 1 : -1), 0);
  });

  userVote = computed(() => {
    const userId = this.currentUser()?.id;
    if (!userId) return null;
    return this.link().votes.find(v => v.userId === userId)?.direction || null;
  });

  upvote() {
    this.sessionService.vote(this.link().id, 'up');
  }

  downvote() {
    this.sessionService.vote(this.link().id, 'down');
  }

  addComment() {
    if (this.newCommentText().trim()) {
      this.sessionService.addComment(this.link().id, this.newCommentText());
      this.newCommentText.set('');
    }
  }

  toggleComments() {
    this.showComments.update(v => !v);
  }
}
