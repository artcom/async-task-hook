import React from "react"
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

  it("should finish task", () => act(async () => {
    render(<TestComponent task={ TASK_1 } />)

    await delay(20)

    expect(results.length).toBe(2)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: FINISHED, result: TASK_1_RESULT })
  }))

  it("should cancel task", async () => act(async () => {
    const { unmount } = render(<TestComponent task={ TASK_1 } />)
    unmount()

    await delay(20)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({ status: RUNNING })
  }))

  it("should not re-run task on rerender", async () => act(async () => {
    const { rerender } = render(<TestComponent task={ TASK_1 } />)

    await delay(20)

    rerender(<TestComponent task={ TASK_1 } />)

    await delay(20)

    expect(results.length).toBe(3)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: FINISHED, result: TASK_1_RESULT })
    expect(results[2]).toEqual({ status: FINISHED, result: TASK_1_RESULT })
  }))

  it("should run another task after first task", async () => act(async () => {
    const { rerender } = render(<TestComponent task={ TASK_1 } />)

    await delay(20)

    rerender(<TestComponent task={ TASK_2 } />)

    await delay(20)

    expect(results.length).toBe(4)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: FINISHED, result: TASK_1_RESULT })
    expect(results[2]).toEqual({ status: RUNNING })
    expect(results[3]).toEqual({ status: FINISHED, result: TASK_2_RESULT })
  }))

  it("should run another task after first task cancelled", async () => act(async () => {
    const { rerender } = render(<TestComponent task={ TASK_1 } />)

    rerender(<TestComponent task={ TASK_2 } />)

    await delay(20)

    expect(results.length).toBe(3)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: RUNNING })
    expect(results[2]).toEqual({ status: FINISHED, result: TASK_2_RESULT })
  }))

  it("should return error on error", async () => act(async () => {
    render(<TestComponent
      task={ () => delay(10).then(() => { throw new Error("This is an error") }) } />
    )

    await delay(20)

    expect(results.length).toBe(2)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: ERROR, error: new Error("This is an error") })
  }))
})

function delay(time) {
  return new Promise(resolve => setTimeout(() => resolve(), time))
}
