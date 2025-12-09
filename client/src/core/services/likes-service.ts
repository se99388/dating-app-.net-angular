import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/internal/operators/tap';
import { Member } from '../../types/member';
import { PaginatedResult } from '../../types/pagination';

@Injectable({
  providedIn: 'root',
})
export class LikesService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  likeIds = signal<string[]>([]);

  toggleLike(targetMemberId: string) {
    return this.http.post<string[]>(`${this.baseUrl}likes/${targetMemberId}`, {})
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {

    const params = new HttpParams()
      .set('predicate', predicate)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<PaginatedResult<Member>>(`${this.baseUrl}likes`, { params })
  }

  getLikeIds() {
    return this.http.get<string[]>(`${this.baseUrl}likes/list`).subscribe({
      next: likeIds => this.likeIds.set(likeIds)
    });
  }

  clrearLikeIds() {
    this.likeIds.set([]);
  }
}
