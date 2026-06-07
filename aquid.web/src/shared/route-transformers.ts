export function routeTransformNumber (significantDigits = 0) {
  return {
    transform: {
      get: Number,
      set: (value: unknown) => {
        const num = Number(value)
        if (significantDigits === 0) {
          return `${num}`
        }
        const multiplier = Math.pow(10, significantDigits)
        const truncated = Math.trunc(num * multiplier) / multiplier
        return `${truncated}`
      },
    },
  }
}

export function routeTransformBoolean () {
  return {
    transform: {
      get: (value: string) => value === 'true',
      set: (value: unknown) => value === true ? 'true' : 'false',
    },
  }
}
