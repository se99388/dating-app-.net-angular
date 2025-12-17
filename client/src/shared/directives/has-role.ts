import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccountService } from '../../core/services/account-service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRole implements OnInit {
  @Input() appHasRole: string[] = [];
  private accountService = inject(AccountService);
  private viewContainerRef = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef);

  ngOnInit(): void {
    const user = this.accountService.currentUser();
    if (user && user.roles.some(role => this.appHasRole.includes(role))) {
      // Show the content (create the view)
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      // Hide the content (clear the view)
      this.viewContainerRef.clear();
    }
  }
}
