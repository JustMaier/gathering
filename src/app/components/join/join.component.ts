import { Component, OnInit } from '@angular/core';
import { NodeService } from 'src/app/providers/node.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent {

  public gatheringName: string;
  public codename: string;
  constructor(private nodeService: NodeService, private router: Router) { }
  public join(){
    this.nodeService.join(this.gatheringName, this.codename);
    this.router.navigateByUrl('/edit');
  }
}
