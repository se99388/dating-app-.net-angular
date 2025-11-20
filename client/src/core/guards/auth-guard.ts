import { CanActivateFn } from '@angular/router';
import { AccountService } from '../services/account-service';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast-service';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  if (accountService.currentUser()) return true;

  const toast = inject(ToastService);
  toast.error('You shall not pass!');
  return false;
};
