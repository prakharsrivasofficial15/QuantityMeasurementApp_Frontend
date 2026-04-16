import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
})
export class AuthModalComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  mode = signal<'login' | 'register'>('login');
  loading = signal(false);
  error = signal('');

  loginForm = { username: '', password: '' };
  registerForm = { username: '', email: '', password: '' };

  constructor(private auth: AuthService) {}

  switchMode(m: 'login' | 'register') {
    this.mode.set(m);
    this.error.set('');
  }

  submit() {
    this.error.set('');
    this.loading.set(true);

    if (this.mode() === 'login') {
      this.auth.login(this.loginForm).subscribe({
        next: () => {
          this.loading.set(false);
          this.success.emit();
          this.closed.emit();
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Login failed. Check your credentials.');
        },
      });
    } else {
      this.auth.register(this.registerForm).subscribe({
        next: () => {
          this.loading.set(false);
          this.switchMode('login');
          this.error.set('');
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Registration failed.');
        },
      });
    }
  }

  close() {
    this.closed.emit();
  }
}
