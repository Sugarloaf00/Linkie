
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { Link, User } from '../../models/entities';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent {
  sessionService = inject(SessionService);
  session = this.sessionService.currentSession;

  totalLinks = computed(() => this.session()?.links.length || 0);
  
  totalVotes = computed(() => {
    return this.session()?.links.reduce((sum, link) => sum + link.votes.length, 0) || 0;
  });

  totalComments = computed(() => {
    return this.session()?.links.reduce((sum, link) => sum + link.comments.length, 0) || 0;
  });

  topVotedLinks = computed(() => {
    const links = this.session()?.links || [];
    return [...links].sort((a, b) => {
      const scoreA = a.votes.reduce((acc, v) => acc + (v.direction === 'up' ? 1 : -1), 0);
      const scoreB = b.votes.reduce((acc, v) => acc + (v.direction === 'up' ? 1 : -1), 0);
      return scoreB - scoreA;
    }).slice(0, 5);
  });

  mostActiveUsers = computed(() => {
    const users = this.session()?.users || [];
    const links = this.session()?.links || [];
    const userActivity = new Map<string, { user: User, score: number }>();

    users.forEach(user => userActivity.set(user.id, { user, score: 0 }));

    links.forEach(link => {
      // Points for submitting
      const submitter = userActivity.get(link.submittedBy.id);
      if (submitter) submitter.score += 3;

      // Points for voting
      link.votes.forEach(vote => {
        const voter = userActivity.get(vote.userId);
        if (voter) voter.score += 1;
      });

      // Points for commenting
      link.comments.forEach(comment => {
        const commenter = userActivity.get(comment.user.id);
        if (commenter) commenter.score += 2;
      });
    });

    return Array.from(userActivity.values()).sort((a, b) => b.score - a.score).slice(0, 5);
  });

  getVoteScore(link: Link): number {
    return link.votes.reduce((acc, v) => acc + (v.direction === 'up' ? 1 : -1), 0);
  }
}
