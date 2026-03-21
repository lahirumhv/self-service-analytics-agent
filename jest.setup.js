import '@testing-library/jest-dom'

// Polyfill for Next.js App Router tests since JSDOM doesn't have them
if (typeof Request === 'undefined') {
  global.Request = class {
    constructor(input, init) {
      this.url = input
      this.method = init?.method || 'GET'
      this.body = init?.body
    }
    async json() {
      return JSON.parse(this.body)
    }
  }
}

if (typeof Response === 'undefined') {
  global.Response = class {
    constructor(body, init) {
      this.body = body
      this.status = init?.status || 200
    }
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
    }
    static json(data, init) {
      return new Response(data, init)
    }
  }
}

if (typeof Headers === 'undefined') {
  global.Headers = class {
    constructor() {
      this.map = {}
    }
    append(key, value) {
      this.map[key] = value
    }
    get(key) {
      return this.map[key]
    }
  }
}
