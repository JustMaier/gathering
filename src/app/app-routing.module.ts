import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GatheringsComponent } from './components/gatherings/gatherings.component';
import { JoinComponent } from './components/join/join.component';
import { EditInfoComponent } from './components/edit-info/edit-info.component';
import { GatheringComponent } from './components/gathering/gathering.component';
import { ContactComponent } from './components/contact/contact.component';
import { ConnectComponent } from './components/connect/connect.component';
import { RankingsComponent } from './components/rankings/rankings.component';
import { RecommendComponent } from './components/recommend/recommend.component';

const routes: Routes = [
	{
		path: '',
		component: GatheringsComponent
	},
	{
		path: 'join',
		component: JoinComponent
	},
	{
		path: 'edit',
		component: EditInfoComponent
	},
	{
		path: 'me',
		component: GatheringComponent
	},
	{
		path: 'contact/:hash',
		component: ContactComponent
	},
	{
		path: 'connect',
		component: ConnectComponent
	},
	{
		path: 'rankings',
		component: RankingsComponent
	},
	{
		path: 'contact/:hash/recommend',
		component: RecommendComponent
	}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
