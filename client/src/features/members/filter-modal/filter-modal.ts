import { Component, ElementRef, output, ViewChild } from '@angular/core';
import { MemberParams } from '../../../types/member';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-modal',
  imports: [FormsModule],
  templateUrl: './filter-modal.html',
  styleUrl: './filter-modal.css',
})
export class FilterModal {
  @ViewChild('filterModal') modalRef!: ElementRef<HTMLDialogElement>
  onCloseModal = output();
  submitData = output<MemberParams>();
  memberParams = new MemberParams();


  open() {
    const filters = localStorage.getItem('filters');
    if (filters) {
      this.memberParams = JSON.parse(filters);
    } else {
      this.memberParams = new MemberParams();
    }

    this.modalRef.nativeElement.showModal();

  }

  close() {
    this.modalRef.nativeElement.close();
    this.onCloseModal.emit();
  }

  submit() {
    this.submitData.emit(this.memberParams);
    this.close();
  }

  onMinAgeChange() {
    if (this.memberParams.minAge < 18) this.memberParams.minAge = 18;

  }

  onMaxAgeChange() {
    if (this.memberParams.maxAge < this.memberParams.minAge) {
      this.memberParams.maxAge = this.memberParams.minAge;
    }
    // if (this.memberParams.maxAge > 100) this.memberParams.maxAge = 100;
  }

}
