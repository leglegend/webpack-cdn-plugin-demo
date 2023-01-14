import { defineStore } from 'pinia'

export const useEventStore = defineStore('event', () => {
  const map = new Map()
  function emit(e: string) {
    const event = map.get(e)
    if (event) event()
  }
  function on(e: string, event: () => void) {
    map.set(e, event)
  }
  return { emit, on }
})
