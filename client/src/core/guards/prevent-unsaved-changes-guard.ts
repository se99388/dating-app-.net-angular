import { CanDeactivateFn } from '@angular/router';
import { MemberProfile } from '../../features/members/member-profile/member-profile';

export const preventUnsavedChangesGuard: CanDeactivateFn<MemberProfile> = (component, _currentRoute, _currentState, _nextState) => {
  if (component.editForm?.dirty) {
    return confirm('Are you sure you want to continue? All unsaved changed will be lost')
  }
  return true;
};
