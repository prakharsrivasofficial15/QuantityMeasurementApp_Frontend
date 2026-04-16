import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, LoginResponse, UserProfile } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'qm_token';
  private readonly USER_KEY = 'qm_user';

  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private _user = signal<UserProfile | null>(
    JSON.parse(localStorage.getItem(this.USER_KEY) || 'null')
  );

  isLoggedIn = computed(() => !!this._token());
  currentUser = computed(() => this._user());
  token = computed(() => this._token());

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, req).pipe(
      tap(res => {
        this._token.set(res.token);
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.loadProfile();
      })
    );
  }

  register(req: RegisterRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auth/register`, req);
  }

  loadProfile(): void {
    this.http.get<UserProfile>(`${environment.apiUrl}/api/user/profile`).subscribe({
      next: user => {
        this._user.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      },
      error: () => {},
    });
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/']);
  }
}
