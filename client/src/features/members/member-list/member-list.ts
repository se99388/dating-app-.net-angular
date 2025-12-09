import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Member, MemberParams } from '../../../types/member';
import { MemberCard } from "../member-card/member-card";
import { PaginatedResult } from '../../../types/pagination';
import { Paginator } from "../../../shared/paginator/paginator";
import { FilterModal } from '../filter-modal/filter-modal';

@Component({
  selector: 'app-member-list',
  imports: [MemberCard, Paginator, FilterModal],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css',
})
export class MemberList implements OnInit {
  @ViewChild('filterModal') modal!: FilterModal

  private memberService = inject(MemberService);
  protected paginatedMembers = signal<PaginatedResult<Member> | null>(null);

  protected memberParams = new MemberParams();

  constructor() {
    const filters = localStorage.getItem('filters');
    if (filters) {
      this.memberParams = JSON.parse(filters);
    }
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers(this.memberParams).subscribe(result => {
      this.paginatedMembers.set(result);
    });
  }

  onPageChanged(event: { pageNumber: number; pageSize: number }) {
    this.memberParams.pageNumber = event.pageNumber;
    this.memberParams.pageSize = event.pageSize;
    this.loadMembers();
  }

  openModal() {
    this.modal.open()
  }

  onClose() {
    console.log('Modal closed');
  }

  onFilterChange(data: MemberParams) {
    console.log('Filters applied:', data);
    this.memberParams = { ...data };
    this.loadMembers();
  }

  resetFilters() {
    this.memberParams = new MemberParams();
    localStorage.removeItem('filters');
    this.loadMembers();
  }

  get displayMessage(): string {
    const defaultParams = new MemberParams();
    const filters = [];
    if (this.memberParams.gender) {
      filters.push(`Gender: ${this.memberParams.gender}`);
    } else {
      filters.push('Gender: Any');
    }

    if (this.memberParams.minAge !== defaultParams.minAge || this.memberParams.maxAge !== defaultParams.maxAge) {
      filters.push(`Age: ${this.memberParams.minAge} - ${this.memberParams.maxAge}`);
    } else {
      filters.push('Age: Any');
    }

    filters.push(`Order by: ${this.memberParams.orderBy === 'lastActive' ? 'Recently Active' : 'Newest members'}`);

    return filters.length ? `Selected filters: ${filters.join('  | ')}` : 'No filters applied';
  }
}
