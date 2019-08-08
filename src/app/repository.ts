export class Repository {
  id: number;
  name: string;
  description: string;
  licence: string;
  link: string;
  starred: boolean;
  language: string;
  contributors: number;
  stars: number;
  forks: number;
  issues: number;


  constructor(id: number, name: string, description: string, licence: string, link: string, starred: boolean,
              language: string, contributors: number, stars: number, forks: number, issues: number) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.licence = licence;
    this.link = link;
    this.starred = starred;
    this.language = language;
    this.contributors = contributors;
    this.stars = stars;
    this.forks = forks;
    this.issues = issues;
  }
}
