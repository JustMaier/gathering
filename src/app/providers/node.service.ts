import { Injectable } from '@angular/core';
import AttendeeNode from '../p2p/attendee-node';
import Node from '../p2p/libp2p-bundle';
import RankingEngine from '../p2p/ranking-engine';
import Storage from '../p2p/storage';
import { createNode } from '../p2p/create-node';

@Injectable({
  providedIn: 'root'
})
export class NodeService {

  private attendeeNode: AttendeeNode;
  private storage: Storage;

  constructor() {
    createNode((err, node: LibP2p) => {
      const rankingEngine = new RankingEngine();
      this.storage = new Storage(rankingEngine);
      this.attendeeNode = new AttendeeNode(node, this.storage);

      node.start(err => {
        if (err)
          return console.log('WebRTC not supported');
      });
    })

  }

  public join(gatheringName: string, codename: string){
    this.storage.addGathering(gatheringName, codename);
    this.attendeeNode.joinGathering(gatheringName);
  }
}
