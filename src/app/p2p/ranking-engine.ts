import defaultsDeep from '@nodeutils/defaults-deep';
import Connection from '../models/Connection';

class Score {
	public connections: number = 0;
	public recommendations: number = 0;
	public matches: number = 0;
	public stars: number = 0;
	public superMatches: number = 0;
	public points: number = 0;
	constructor(public hash: string){}
}

interface RankingEngineOptions {
	points: any;
	awards: any;
	leaderboardSize: number;
}

export default class RankingEngine {
    constructor(private options: RankingEngineOptions = null){
        this.options = {
            points: {
                connections: 1,
                recommendations: 1,
                matches: 3,
                stars: 5,
                superMatches: 10
            },
            awards: [
                {
                    name: 'Smoozer',
                    order: (a:Score,b:Score) => a.connections > b.connections,
                },
                {
                    name: 'Human Router',
                    order: (a:Score,b:Score) => a.recommendations > b.recommendations,
                },
                {
                    name: 'Cupid',
                    order: (a:Score,b:Score) => a.matches > b.matches,
                },
                {
                    name: 'High Priest',
                    order: (a:Score,b:Score) => a.stars > b.stars,
                },
                {
                    name: 'MVP',
                    order: (a:Score,b:Score) => a.points > b.points,
                },
                {
                    name: 'Oracle',
                    order: (a:Score,b:Score) => a.superMatches > b.superMatches,
                }
            ],
            leaderboardSize: 20
        }
        defaultsDeep(options, this.options);
    }

    rank(connections: {[k:string]: Connection}){
		const scores: {[k:string]: Score} = {};
		Object.values(connections).forEach((c:Connection)=>{
            const from = scores[c.from] = scores[c.from] || new Score(c.from);
            const recommender = c.recommender != null ? (scores[c.recommender] = scores[c.recommender] || new Score(c.recommender)) : null;
            from.connections++;
            from.points += this.options.points.connections;
            from.stars += (c.stars || 0);
            from.points += this.options.points.stars * (c.stars || 0);
            if(recommender){
                recommender.recommendations++;
                recommender.points += this.options.points.recommendations;
                if(c.active){
                    recommender.matches++;
                    recommender.points += this.options.points.matches;
                    recommender.superMatches += (c.stars || 0);
                    recommender.points += this.options.points.superMatches* (c.stars || 0);
                }
            }
        });

        const rankings = {};
        this.options.awards.forEach(a=>{
            rankings[a.name] = Object.values(scores).sort(a.order).slice(0, this.options.leaderboardSize);
        });

        return {scores, rankings};
    }
}

module.exports = RankingEngine;
