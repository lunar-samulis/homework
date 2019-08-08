import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {Repository} from './repository';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

  private baseUri = 'https://api.github.com';

  constructor(private http: HttpClient) { }

  searchRepositories(term: string): Observable<Repository[]> {
    if (!term.trim() || term.trim().length < 2) {
      return of([]);
    }

    // @ts-ignore
    return this.http.get(this.baseUri + '/search/repositories?q=' + term.trim() + '+language:javascript&sort=stars&order=desc',
      {headers: this.getAuthHeaders()}).pipe(
        map(object => object.items.map( repo => this.toRepository(repo))),
    );
  }

  getStarredRepositories(): Observable<Repository[]> {
    // @ts-ignore
    return this.http.get(this.baseUri + '/user/starred?t=' + Math.random() /*todo timestamp*/, {headers: this.getAuthHeaders()}).pipe(
      map(object => object.map(repo => this.toRepository(repo)))
    );
  }

  getRepository(fullName: string): Observable<Repository> {
    return this.http.get(this.baseUri + '/repos/' + fullName, {headers: this.getAuthHeaders()}).pipe(
      map(repo => this.toRepository(repo))
    );
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

  // todo remove
  sampleRepo(): Repository {
    return new Repository(123, 'name', 'description', 'lince', 'http://www.lt.lt',
      false, 'javascript', 143, 14, 15, 200);
  }
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      // 'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      //   Pragma: 'no-cache',
      // Expires: '0',
      // 'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Credentials': 'true',
      // 'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
      // 'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Origin,Accept, ' +
      //   'X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization'
  })
      .append('Content-Type', 'application/json')
      .append('Authorization', 'Basic ' + btoa('user:password')); // todo move to config
      // .append('Cache-Control', 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0')
      // .append('Pragma', 'no-cache')
      // .append('Expires', '0');
  }

  isStarred(repository: Repository, starredRepositories: Repository[]): boolean {
    return starredRepositories.findIndex(repo => repo.name === repository.name) !== -1;
  }

  star(fullName: string): void {
    this.http.put(this.baseUri + '/user/starred/' + fullName, {}, {headers: this.getAuthHeaders()}).subscribe();
  }

  unstar(fullName: string): void {
    this.http.delete(this.baseUri + '/user/starred/' + fullName, {headers: this.getAuthHeaders()}).subscribe();
  }
}
