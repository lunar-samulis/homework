import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {Repository} from '../repository';
import {RepositoryService} from '../repository.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  starredRepositories: Repository[];

  @Input() repo: Repository;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private repositoryService: RepositoryService
  ) { }

  ngOnInit() {
    this.repositoryService.getStarredRepositories().subscribe(
      repos =>  this.starredRepositories = repos,
    );

    const owner = this.route.snapshot.paramMap.get('owner');
    const repo = this.route.snapshot.paramMap.get('repo');

    this.repositoryService.getRepository(owner + '/' + repo)
      .subscribe(repository => this.repo = repository);
  }

  unstar(repository: Repository) {
    this.repositoryService.unstar(repository.name);

    const index = this.starredRepositories.findIndex(repo => repo.name === repository.name);
    if (index !== -1) {
      this.starredRepositories.splice(index, 1);
    }
  }

  star(repository: Repository) {
    this.repositoryService.star(repository.name);
    this.starredRepositories.push(repository);
  }
}
