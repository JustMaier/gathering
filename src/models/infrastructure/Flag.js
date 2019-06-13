class Flag extends Number {
  constructor (value, map) {
    super(value)

    if (Array.isArray(map)) {
      var mapObj = {}
      map.forEach(x => { mapObj[x.key] = x.value })
      map = mapObj
    }

    this.value = this.valueOf()
    this.valueOf = () => this.value
    this.map = map
    this.length = this.getFlags().length
  }
  hasFlags () {
    return this.length > 0
  }
  hasFlag (flag) {
    flag = typeof flag === 'string' ? this.map[flag] : flag
    return (this.valueOf() & flag) === flag
  }
  getFlags (fn) {
    if (fn == null) fn = (key, map) => key
    return Object.keys(this.map).filter(key => this.hasFlag(key)).map(key => fn(key, this.map))
  }
  forEach (cb) {
    return this.getFlags().forEach(key => cb(key, this.map[key]))
  }
  toObject () {
    const obj = {}
    this.forEach((key, val) => { obj[key] = val })
    return obj
  }
  toString () {
    return this.getFlags().join(', ')
  }
  toggleFlag (flag, setTo = null) {
    flag = typeof flag === 'string' ? this.map[flag] : flag
    if (setTo === true) this.value = this.valueOf() | flag
    else if (setTo === false) this.value = this.valueOf() & ~flag
    else this.value = this.valueOf() ^ flag
    this.length = this.getFlags().length
    return this
  }
  setFlags (flag) {
    this.value = flag
    this.length = this.getFlags().length
    return this
  }
}

export default Flag
