import { useCallback, useEffect, useState, useRef } from "react"

export const RUNNING = "RUNNING"
export const FINISHED = "FINISHED"
export const ERROR = "ERROR"

export function useAsyncTask(task) {
  const taskRef = useRef(task)
  const stateRef = useRef({ status: RUNNING })

  const [, setTick] = useState(0)
  const update = useCallback(() => setTick(tick => tick + 1), [])

  if (taskRef.current !== task) {
    taskRef.current = task
    stateRef.current = { status: RUNNING }
  }

  useEffect(() => {
    let cancelled = false

    const runTask = async () => {
      try {
        const result = await taskRef.current()

        if (!cancelled) {
          stateRef.current = { status: FINISHED, result }
          update()
        }
      } catch (error) {
        if (!cancelled) {
          stateRef.current = { status: ERROR, error }
          update()
        }
      }
    }

    runTask()

    return () => { cancelled = true }
  }, [taskRef.current])

  return stateRef.current
}
