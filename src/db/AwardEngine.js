const pointValues = {
  requests: -1,
  requestsAccepted: 2,
  requestsDeclined: -1,
  recommendations: 2,
  matches: 3,
  stars: 5,
  superMatches: 4
}
export const trackedEvents = ['stars:add', 'connections:request', 'connections:accept', 'connections:decline', 'recommendations:add']

class Score {
  constructor (id) {
    this.id = id
    this.requests = 0
    this.requestsAccepted = 0
    this.requestsDeclined = 0
    this.recommendations = 0
    this.matches = 0
    this.stars = 0
    this.superMatches = 0
    this.points = 0
    this.recommendationIds = {}
    this.requestIds = {}
  }

  addStar (from, members, events) {
    this.stars++
    this.points += pointValues.stars
    if (this.recommendationIds[from]) this.recommendationIds[from].forEach(recommenderId => members[recommenderId].addSuperMatch())
  }

  addRequestAccepted (to, members, events) {
    members[to].requestsAccepted++
    members[to].points += pointValues.requestsAccepted
    if (this.recommendationIds[to]) this.recommendationIds[to].forEach(recommenderId => members[recommenderId].addMatch())
  }

  addRequestDeclined (to, members, events) {
    members[to].requestsDeclined++
    members[to].points += pointValues.requestsDeclined
  }

  addRequest (to, members, events) {
    if (members[to].requests[this.id]) return
    this.requests++
    this.points += pointValues.requests
    members[to].requestIds[this.id] = true
  }

  addRecommendation (to, forId, members, events) {
    if (!members[to].recommendationIds[forId]) members[to].recommendationIds[forId] = []
    members[to].recommendationIds[forId].push(this.id)
    this.recommendations++
    this.points += pointValues.recommendations
  }

  addSuperMatch () {
    this.superMatches++
    this.points += pointValues.superMatches
  }

  addMatch () {
    this.matches++
    this.points += pointValues.matches
  }

  processEvent ({ type, from, to, payload }, members, events) {
    if (this.id === to) {
      switch (type) {
        case 'stars:add':
          this.addStar(from, members, events)
          break
        case 'connections:accept':
          this.addRequestAccepted(to, members, events)
          break
        case 'connections:decline':
          this.addRequestDeclined(to, members, events)
          break
        default: break
      }
    } else {
      switch (type) {
        case 'connections:request':
          this.addRequest(to, members, events)
          break
        case 'recommendations:add':
          this.addRecommendation(to, payload, members, events)
          break
        default: break
      }
    }
  }
}

export default class AwardEngine {
  constructor (yourId, options = {}) {
    this.yourId = yourId
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
          property: 'requestsAccepted'
        },
        {
          name: 'Human Router',
          property: 'recommendations'
        },
        {
          name: 'Cupid',
          property: 'matches'
        },
        {
          name: 'High Priest',
          property: 'stars'
        },
        {
          name: 'MVP',
          property: 'points'
        },
        {
          name: 'Oracle',
          property: 'superMatches'
        }
      ],
      ...options
    }
  }

  processEvents (eventLog, nameMap) {
    const events = eventLog.iterator({ limit: -1 }).collect().map(e => ({
      from: e.identity.id,
      ...e.payload.value
    })).filter(x => trackedEvents.includes(x.type))

    const members = {}
    events.forEach((event) => {
      if (!members[event.from]) members[event.from] = new Score(event.from)
      if (event.to && !members[event.to]) members[event.to] = new Score(event.to)

      members[event.from].processEvent(event, members, events)
      members[event.to].processEvent(event, members, events)
    })

    const ranks = {}
    this.options.awards.forEach(a => {
      ranks[a.name] = Object.values(members)
        .map(x => ({
          id: x.id,
          name: nameMap[x.id],
          score: x[a.property]
        }))
        .sort((ma, mb) => ma.score > mb.score)
        .map((x, rank) => ({ ...x, rank: rank + 1 }))
    })

    return this.options.awards.map(a => ({
      name: a.name,
      rank: ranks[a.name],
      your: ranks[a.name].find(x => x.id === this.yourId)
    }))
  }
}
