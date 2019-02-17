import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JoinComponent } from './components/join/join.component';
import { EditInfoComponent } from './components/edit-info/edit-info.component';
import { GatheringComponent } from './components/gathering/gathering.component';
import { RankingsComponent } from './components/rankings/rankings.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { ContactComponent } from './components/contact/contact.component';
import { ConnectComponent } from './components/connect/connect.component';
import { RecommendComponent } from './components/recommend/recommend.component';
import { GatheringsComponent } from './components/gatherings/gatherings.component';
import { NavComponent } from './components/nav/nav.component';

@NgModule({
  declarations: [
    AppComponent,
    JoinComponent,
    EditInfoComponent,
	GatheringComponent,
	GatheringsComponent,
    RankingsComponent,
    ContactsComponent,
    ContactComponent,
    ConnectComponent,
    RecommendComponent,
    NavComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
