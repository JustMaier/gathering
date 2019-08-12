export default class LocalStorageStore {
  constructor (dbName) {
    this.dbName = dbName
    this.value = window.localStorage[dbName] ? JSON.parse(window.localStorage[dbName]) : {}
  }

  _save () {
    window.localStorage[this.dbName] = JSON.stringify(this.value || {})
  }

  get all () {
    return this.value
  }

  get (key) {
    return this.value[key]
  }

  set (key, value) {
    this.value[key] = value
    this._save()
  }

  put (key, value) {
    this.set(key, value)
  }

  del (key) {
    delete this.value[key]
    this._save()
  }
}
