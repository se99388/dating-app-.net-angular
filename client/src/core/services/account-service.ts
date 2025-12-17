import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCreds, RegisterCreds, User } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesService } from './likes-service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private likesService = inject(LikesService);
  currentUser = signal<User | null>(null);

  private baseUrl = environment.apiUrl;

  register(creds: RegisterCreds) {
    return this.http.post<User>(this.baseUrl + 'account/register', creds, { withCredentials: true }).pipe(tap(user => {
      if (user) {
        this.setCurrentUser(user);
        this.startTokenRefreshInterval();
      }
    }))
  }

  login(creds: LoginCreds) {
    return this.http.post<User>(this.baseUrl + 'account/login', creds, { withCredentials: true }).pipe(tap(user => {
      if (user) {
        this.setCurrentUser(user);
        this.startTokenRefreshInterval();
      }
    }));
  }

  logout() {
    this.http.post(this.baseUrl + 'account/logout', {}, { withCredentials: true }).subscribe({
      next: () => {
        this.currentUser.set(null);
        localStorage.removeItem('filters');
        this.likesService.clearLikeIds();
      },
    });

  }

  refreshToken() {
    return this.http.post<User>(this.baseUrl + 'account/refresh-token', {}, { withCredentials: true }).pipe(tap(user => {
      if (user) {
        this.setCurrentUser(user);
      }
    }));
  }

  startTokenRefreshInterval() {
    setInterval(() => {
      this.http.post<User>(this.baseUrl + 'account/refresh-token', {}, { withCredentials: true }).subscribe({
        next: user => {

          this.setCurrentUser(user);
        },
        error: error => {
          this.logout();
        }
      });
    }, 5 * 60 * 1000); // every 5 minutes
  }

  setCurrentUser(user: User) {
    user.roles = this.getDecodedToken(user);
    this.currentUser.set(user);
    this.likesService.getLikeIds();
  }

  private getDecodedToken(user: User) {
    const payload = user.token.split('.')[1];
    const decoded = atob(payload);
    const tokenData = JSON.parse(decoded);

    return Array.isArray(tokenData.role) ? tokenData.role : [tokenData.role];
  }
}
