import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  public toggled: boolean = false;
  constructor() { }

  toggleMenu(){
    this.toggled = !this.toggled;
  }

}
