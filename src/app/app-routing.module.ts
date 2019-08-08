import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ListComponent} from './list/list.component';
import {DetailsComponent} from './details/details.component';


const routes: Routes = [
  {path: 'list', component: ListComponent},
  {path: 'details/:owner/:repo', component: DetailsComponent},
  {path: '', redirectTo: '/list', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
