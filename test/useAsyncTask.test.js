/**
 * @jest-environment jsdom
 */

import { render, act } from "@testing-library/react"
import { useAsyncTask, FINISHED, RUNNING, ERROR } from "../src/index"

const TASK_1_RESULT = "TASK_1_RESULT"
const TASK_1 = () => delay(10).then(() => TASK_1_RESULT)

const TASK_2_RESULT = "TASK_2_RESULT"
const TASK_2 = () => delay(10).then(() => TASK_2_RESULT)

const results = []

const TestComponent = ({ task }) => {
  const taskState = useAsyncTask(task)
  results.push(taskState)
  return <></>
}

describe("useAsyncTask", () => {
  beforeEach(() => {
    results.length = 0
  })

  test("shows the children when the checkbox is checked", async () => {
    render(<TestComponent task={TASK_1} />)

    await act(() => delay(20))

    expect(results.length).toBe(2)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: FINISHED, result: TASK_1_RESULT })
  })

  test("should finish task", async () => {
    render(<TestComponent task={TASK_1} />)

    await act(() => delay(20))

    expect(results.length).toBe(2)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: FINISHED, result: TASK_1_RESULT })
  })

  test("should cancel task", async () => {
    const { unmount } = render(<TestComponent task={TASK_1} />)
    unmount()

    await act(() => delay(20))

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({ status: RUNNING })
  })

  test("should not re-run task on rerender", async () => {
    const { rerender } = render(<TestComponent task={TASK_1} />)

    await act(() => delay(20))

    rerender(<TestComponent task={TASK_1} />)

    await act(() => delay(20))

    expect(results.length).toBe(3)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: FINISHED, result: TASK_1_RESULT })
    expect(results[2]).toEqual({ status: FINISHED, result: TASK_1_RESULT })
  })

  test("should run another task after first task", async () => {
    const { rerender } = render(<TestComponent task={TASK_1} />)

    await act(() => delay(20))

    rerender(<TestComponent task={TASK_2} />)

    await act(() => delay(20))

    expect(results.length).toBe(4)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: FINISHED, result: TASK_1_RESULT })
    expect(results[2]).toEqual({ status: RUNNING })
    expect(results[3]).toEqual({ status: FINISHED, result: TASK_2_RESULT })
  })

  test("should run another task after first task cancelled", async () => {
    const { rerender } = render(<TestComponent task={TASK_1} />)

    rerender(<TestComponent task={TASK_2} />)

    await act(() => delay(20))

    expect(results.length).toBe(3)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: RUNNING })
    expect(results[2]).toEqual({ status: FINISHED, result: TASK_2_RESULT })
  })

  test("should return error on error", async () => {
    render(
      <TestComponent
        task={() =>
          delay(10).then(() => {
            throw new Error("This is an error")
          })
        }
      />
    )

    await act(() => delay(20))

    expect(results.length).toBe(2)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: ERROR, error: new Error("This is an error") })
  })
})

function delay(time) {
  return new Promise((resolve) => setTimeout(() => resolve(), time))
}
