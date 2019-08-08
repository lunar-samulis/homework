import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {Repository} from '../repository';
import {RepositoryService} from '../repository.service';
import {Observable, of} from 'rxjs';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  repository$: Observable<Repository>;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private repositoryService: RepositoryService
  ) { }

  ngOnInit() {
    const owner = this.route.snapshot.paramMap.get('owner');
    const repo = this.route.snapshot.paramMap.get('repo');

    this.repository$ = this.repositoryService.getRepository(owner + '/' + repo);
  }

  unstar(repository: Repository) {
    this.repositoryService.unstar(repository.name);
  }

  star(repository: Repository) {
    this.repositoryService.star(repository.name);
  }
}
