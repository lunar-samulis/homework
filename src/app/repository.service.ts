import { Injectable } from '@angular/core';
import {forkJoin, from, Observable, of} from 'rxjs';
import {Repository} from './repository';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map, flatMap, mergeMap, toArray} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

  private baseUri = 'https://api.github.com';
  private searchMaxResults = '20';
  private credentials = '';

  constructor(private http: HttpClient) { }

   searchRepositories(term: string): Observable<Repository[]> {
    const repositories = forkJoin(this.searchPlainRepositories(term), this.getStarredRepositories()).pipe(
      map(([foundRepositories, starredRepositories]) => {
        return foundRepositories.map(repo => this.adjustStar(repo, starredRepositories));
      })
    );
    return this.applyContributorsOnList(repositories);
  }

  private applyContributorsOnList(repositories: Observable<Repository[]>) {
    return repositories.pipe(
      mergeMap(repos => from(repos).pipe(
        mergeMap(repo => this.applyContributors(repo)),
        toArray()
      ))
    );
  }

  private searchPlainRepositories(term: string): Observable<Repository[]> {
    if (!term.trim() || term.trim().length < 2) {
      return of([]);
    }

    return this.http.get(
      this.baseUri + '/search/repositories?q=' + term.trim() + '&sort=stars&order=desc&per_page=' + this.searchMaxResults,
      {headers: this.getAuthHeaders()}
      ).pipe(
      // @ts-ignore
        map(object => object.items.map( repo => this.toRepository(repo))),
    );
  }

  private applyContributors(repository: Repository): Observable<Repository> {
    return this.http.get(
      this.baseUri + '/repos/' + repository.name + '/contributors?per_page=1',
      {observe: 'response', headers: this.getAuthHeaders()}
      ).pipe(
      map(response => ({... repository, contributors: this.extractLastPage(response.headers.get('Link'))}))
    );
  }

  private extractLastPage(linkHeader: string): number {
    const rx = /.*=(.*)>; rel="last"$/g;
    const captures = rx.exec(linkHeader);

    return captures !== null ? parseInt(captures[1], 10) : 0;
  }

  getRepository(fullName: string): Observable<Repository> {
    return this.getPlainRepository(fullName).pipe(
      flatMap(repo => this.getStarredRepositories().pipe(
        flatMap(starredRepositories => this.applyContributors(this.adjustStar(repo, starredRepositories)))
      ))
    );
  }

  getStarredRepositories(): Observable<Repository[]> {
    return this.http.get(this.baseUri + '/user/starred?t=' + Math.random(), {headers: this.getAuthHeaders()}).pipe(
      // @ts-ignore
      map(object => object.map(repo => this.toRepository(repo)))
    );
  }

  private getPlainRepository(fullName: string): Observable<Repository> {
    return this.http.get(this.baseUri + '/repos/' + fullName, {headers: this.getAuthHeaders()}).pipe(
      map(data => this.toRepository(data))
    );
  }

  private adjustStar(repository: Repository, starredRepositories: Repository[]): Repository {
    if (starredRepositories.filter(r => r.name === repository.name).length === 1) {
        return {... repository, starred: true};
    }

    return repository;
  }

  private toRepository(repo) {
    return new Repository(
      repo.id,
      repo.full_name,
      repo.description,
      repo.license ? repo.license.name : null,
      repo.html_url,
      false,
      repo.language,
      0,
      repo.stargazers_count,
      repo.forks_count,
      repo.open_issues_count
    );
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', 'Basic ' + btoa(this.credentials));
  }

  star(fullName: string): void {
    this.http.put(this.baseUri + '/user/starred/' + fullName, {}, {headers: this.getAuthHeaders()}).subscribe();
  }

  unstar(fullName: string): void {
    this.http.delete(this.baseUri + '/user/starred/' + fullName, {headers: this.getAuthHeaders()}).subscribe();
  }
}
