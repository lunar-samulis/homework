import { Component, OnInit } from '@angular/core';
import {Repository} from '../repository';
import {Observable, of, Subject} from 'rxjs';
import {RepositoryService} from '../repository.service';
import {debounceTime, distinctUntilChanged, filter, switchMap, map} from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  repositories$: Observable<Repository[]>;
  private searchTerms = new Subject<string>();
  private loading = false;

  constructor(private repositoryService: RepositoryService) {}

  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.repositories$ = this.searchTerms.pipe(
      distinctUntilChanged(),
      debounceTime(1000),
      switchMap(term => this.repositoryService.searchRepositories(term)),
    );
  }
}
