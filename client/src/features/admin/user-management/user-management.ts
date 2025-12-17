import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { User } from '../../../types/user';
import { AdminService } from '../../../core/services/admin-service';

@Component({
  selector: 'app-user-management',
  imports: [],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  @ViewChild('rolesModal') rolesModal!: ElementRef<HTMLDialogElement>;
  private adminService = inject(AdminService);
  protected users = signal<User[]>([]);
  protected availableRoles = ['Admin', 'Moderator', 'Member'];
  protected selectedUser = signal<User | null>(null);

  ngOnInit() {
    // Initialization logic here
    this.getUsersWithRoles();
  }

  getUsersWithRoles() {
    this.adminService.getUserWithRoles().subscribe({
      next: users => {
        this.users.set(users);
      }
    });
  }

  openRolesModal(user: User) {
    this.selectedUser.set(user);
    this.rolesModal.nativeElement.showModal();
  }

  toggleRole(event: Event, role: string) {
    const currentUser = this.selectedUser();
    if (!currentUser) return;
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.selectedUser.set({ ...currentUser, roles: [...currentUser.roles, role] });
    } else {
      this.selectedUser.set({ ...currentUser, roles: currentUser.roles.filter(r => r !== role) });
    }
  }

  updateRoles() {
    const currentUser = this.selectedUser();
    if (!currentUser) return;
    this.adminService.updateUserRoles(currentUser.id, currentUser.roles).subscribe({
      next: updatedRoles => {
        this.users.update(users => users.map(user => {
          if (user.id === currentUser.id) {
            return { ...user, roles: updatedRoles };
          }
          return user;
        }));
        this.selectedUser.set(null);
        this.rolesModal.nativeElement.close();
      },
      error: error => {
        console.error('Error updating roles:', error);
      }
    });
  }
}
