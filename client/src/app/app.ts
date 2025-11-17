import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private http = inject(HttpClient);
  protected readonly title = signal('Dating app');

  protected members = signal<Array<{ id: number, displayName: string }>>([]);

  async ngOnInit() {
    this.members.set(await this.getMembers());
  }

  getMembers() {
    try {
      return lastValueFrom(this.http.get<Array<{ id: number, displayName: string }>>('https://localhost:5001/api/members'));
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
