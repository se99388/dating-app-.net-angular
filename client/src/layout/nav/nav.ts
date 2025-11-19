import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { LoginCreds } from '../../types/user';

@Component({
  selector: 'app-nav',
  imports: [FormsModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  protected accountService = inject(AccountService)
  protected creds: any = {
  }


  login() {

    this.accountService.login(this.creds).subscribe({
      next: response => {
        this.creds = {};
        console.log(response);

      },
      error: error => {
        console.error(error.message);
      }
    });
  }

  logout() {
    this.accountService.logout()
  }
}
