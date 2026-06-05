import type { DebounceSettings } from 'lodash'
import type { ComputedRef, MaybeRef, Ref } from 'vue'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import { isReadonly, nextTick, ref, toValue, watch } from 'vue'

export type UseDebounced<T> = {
  debounced: Ref<T>
}

export type UseDebouncedProps<T> = {
  valueRef: Ref<T> | ComputedRef<T>
  timeout?: number
  options?: DebounceSettings & {
    initialWait?: number
    debounceBidirectional?: boolean
  }
  onUpdate?: () => void
}

/**
 * A reactive debounce type with custom timeout and callback.
 */
export function useDebounced<T> ({
  valueRef,
  timeout = 500,
  options,
  onUpdate = () => ({}),
}: UseDebouncedProps<T>): UseDebounced<T> {
  const hasInitialWaited = ref(false)
  const start = dayjs()
  const debounced = ref(valueRef.value) as Ref<T>
  let lock = false

  async function update (from: MaybeRef<T>, to: Ref<T>) {
    if (options?.initialWait && !hasInitialWaited.value) {
      hasInitialWaited.value = true
      const diff = dayjs().diff(start)

      if (diff < options.initialWait) {
        await new Promise(res => setTimeout(res, options.initialWait! - diff))
      }
    }
    to.value = toValue(from)
    onUpdate?.()
  }

  watch(
    valueRef,
    debounce(async (newValue: T) => {
      update(newValue, debounced)
    }, timeout, options),
  )

  const debouncedReverseUpdate = debounce(async (newValue: T) => {
    update(newValue, valueRef)
    nextTick(() => {
      lock = false
    })
  }, timeout, options)

  watch(debounced, () => {
    if (isReadonly(valueRef) || lock) {
      return
    }
    if (options?.debounceBidirectional) {
      debouncedReverseUpdate(debounced.value)
    } else {
      (valueRef as Ref<T>).value = debounced.value
      nextTick(() => {
        lock = false
      })
    }
  })

  return {
    debounced,
  }
}
