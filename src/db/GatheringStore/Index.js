const STARS_LIMIT = 3

export const ConnectionStatus = {
  deleted: -2,
  declined: -1,
  pending: 0,
  accepted: 1
}

export const RecommendationStatus = {
  declined: -1,
  pending: 0,
  accepted: 1
}

function setupStores (stores, keys, initialValue = {}) {
  keys.forEach(key => stores.filter(x => x[key] == null).forEach(store => {
    store[key] = { ...initialValue }
  }))
}

const reducers = {
  default: (target, handled, { op, key, value }) => {
    if (handled[key]) return

    if (op === 'PUT') target[key] = value
    else if (op === 'DEL') delete target[key]
    handled[key] = true
  },
  members: (target, handled, { op, key, value, by }) => {
    setupStores([handled, target], [by])
    if (handled[by] === true) return

    if (op === 'PUT') target[by] = { ...value, id: by }
    handled[by] = true
  },
  connections: (target, handled, { op, to, by, value }) => {
    setupStores([handled, target], [to, by])
    if (handled[by][to] !== 'merge') {
      if (op === 'ACCEPT') {
        target[by][to] = { status: ConnectionStatus.accepted }
        handled[by][to] = 'merge'
      } else if (op === 'DECLINE') {
        target[by][to] = { status: ConnectionStatus.declined }
        handled[by][to] = 'merge'
      } else if (op === 'DELETE') {
        target[by][to] = { status: ConnectionStatus.deleted }
        handled[by][to] = 'merge'
      }
    } else if (handled[to][by] === true) return

    if (op === 'PUT') {
      if (handled[to][by] === 'merge') target[to][by] = { ...value, ...target[to][by] }
      else target[to][by] = value
      handled[to][by] = true
    }
  },
  recommendations: (target, handled, { op, to, by, forId }) => {
    setupStores([target], [to, by])
    if (op === 'ACCEPT') target[by][forId] = { status: RecommendationStatus.accepted }
    if (op === 'DECLINE') target[by][forId] = { status: RecommendationStatus.declined }
    if (op === 'PUT') {
      if (!target[to][forId]) target[to][forId] = { by: {}, status: RecommendationStatus.pending }
      if (!target[to][forId].by) target[to][forId].by = {}
      target[to][forId].by[by] = true
    }
  },
  stars: (target, handled, { op, to, by }) => {
    setupStores([target], [to])
    if (target[to][by] == null) target[to][by] = 0

    if (op === 'INC') target[to][by]++
  },
  starsAvailable: (target, handled, { op, by }) => {
    if (target[by] == null) target[by] = STARS_LIMIT

    if (op === 'INC') target[by]++
    else if (op === 'DEC') target[by]--
  },
  affinities: (target, handled, { op, name, data, by }) => {
    setupStores([handled, target], [name])

    if (!target[name].members) target[name].members = {}
    if (op === 'PUT') target[name] = { name, ...data, members: target[name].members }
    else if (op === 'ADD_MEMBER' && handled[name][by] !== true) {
      target[name].members[by] = true
      handled[name][by] = true
    } else if (op === 'DEL_MEMBER' && handled[name][by] !== true) {
      delete target[name].members[by]
      handled[name][by] = true
    }
  }
}

const pointValues = {
  request: -1,
  requestAccepted: 2,
  requestDeclined: -1,
  recommendation: 1,
  recommendationAccepted: 1,
  recommendationDeclined: -1,
  star: 3,
  superMatch: 4
}

const scoreProcessor = (scoreTable, future, { table, op, by, to, forId }) => {
  setupStores([scoreTable], [by, to], {
    requests: 0,
    requestsAccepted: 0,
    requestsDeclined: 0,
    recommendations: 0,
    recommendationsAccepted: 0,
    recommendationsDeclined: 0,
    stars: 0,
    superMatches: 0,
    points: 0
  })
  setupStores([future], [by, to], {
    acceptsRecommendation: {},
    declinesRecommendation: {},
    acceptsRequest: {},
    declinesRequest: {},
    givesStar: {}
  })

  if (table === 'stars' && op === 'INC') {
    scoreTable[to].stars++
    scoreTable[to].points += pointValues.star
    future[by].givesStar[to] = true
  } else if (table === 'recommendations') {
    if (op === 'PUT') {
      scoreTable[by].recommendations++
      scoreTable[by].points += pointValues.recommendation
      if (future[to].acceptsRecommendation[forId]) {
        scoreTable[by].recommendationsAccepted++
        scoreTable[by].points += pointValues.recommendationAccepted
      }
      if (future[to].declinesRecommendation[forId]) {
        scoreTable[by].recommendationsDeclined++
        scoreTable[by].points += pointValues.recommendationDeclined
      }
      if (future[to].givesStar[forId]) {
        scoreTable[by].superMatches++
        scoreTable[by].points += pointValues.superMatch
      }
    } else if (op === 'ACCEPT') future[by].acceptsRecommendation[forId] = true
    else if (op === 'DECLINE') future[by].declinesRecommendation[forId] = true
  } else if (table === 'connections') {
    if (op === 'PUT') {
      scoreTable[by].requests++
      scoreTable[by].points += pointValues.request
      if (future[to].acceptsRequest[by]) {
        scoreTable[by].requestsAccepted++
        scoreTable[by].points += pointValues.requestAccepted
      }
      if (future[to].declinesRequest[by]) {
        scoreTable[by].requestsDeclined++
        scoreTable[by].points += pointValues.requestDeclined
      }
    } else if (op === 'ACCEPT') future[by].acceptsRequest[to] = true
    else if (op === 'DECLINE') future[by].declinesRequest[to] = true
  }
}

export default class GatheringIndex {
  constructor () {
    this._tables = {
      gathering: {},
      members: {},
      affinities: {},
      connections: {},
      recommendations: {},
      stars: {},
      starsAvailable: {},
      score: {}
    }
  }

  get (key) {
    return this._tables.gathering[key]
  }

  updateIndex (oplog) {
    // Reset number based tables that inc/dec
    this._tables.score = {}
    this._tables.stars = {}
    this._tables.starsAvailable = {}
    this._size = oplog.length

    oplog.values
      .slice()
      .reverse()
      .reduce((handled, { payload: { table, op, ...payload }, identity: { id: by } }) => {
        const reducer = reducers[table] || reducers.default
        reducer(this._tables[table], handled[table], { table, op, ...payload, by })
        scoreProcessor(this._tables.score, handled.scoreHistory, { table, op, ...payload, by })
        return handled
      }, {
        gathering: {},
        members: {},
        affinities: {},
        connections: {},
        recommendations: {},
        stars: {},
        starsAvailable: {},
        scoreHistory: {}
      })
  }
}
