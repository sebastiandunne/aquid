import type { AquidClient } from '../client/aquid-client'

export abstract class BaseService<T extends AquidClient = AquidClient> {
  protected client: T

  constructor (client: T) {
    this.client = client

    // Ensures the correct `this` context without binding or using arrow functions.
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        const value = Reflect.get(target, prop, receiver)

        // Bind for functions to maintain the correct `this` context, but only for methods.
        if (typeof value === 'function' && prop !== 'constructor') {
          return value.bind(target)
        }

        return value
      },
    })
  }
}
