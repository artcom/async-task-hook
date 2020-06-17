import React from "react"
import { render, act } from "@testing-library/react"
import { useAsyncTask, FINISHED, RUNNING, ERROR } from "../src/index"

const FINAL_RESULT = "FINAL_RESULT"
const VERY_FINAL_RESULT = "VERY_FINAL_RESULT"

describe("useAsyncTask", () => {
  it("should finish task", () => act(async () => {
    const results = []

    const Component = ({ task }) => {
      const taskState = useAsyncTask(task)
      results.push(taskState)
      return <></>
    }

    render(<Component task={ () => delay(10).then(() => FINAL_RESULT) } />)

    await delay(20)

    expect(results.length).toBe(2)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: FINISHED, result: FINAL_RESULT })
  }))

  it("should cancel task", async () => act(async () => {
    const results = []

    const Component = ({ task }) => {
      const taskState = useAsyncTask(task)
      results.push(taskState)
      return <></>
    }

    const { unmount } = render(<Component task={ () => delay(10).then(() => FINAL_RESULT) } />)
    unmount()

    await delay(20)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({ status: RUNNING })
  }))

  it("should not re-run task on rerender", async () => act(async () => {
    const results = []

    const Component = ({ task }) => {
      const taskState = useAsyncTask(task)
      results.push(taskState)
      return <></>
    }

    const task = () => delay(10).then(() => FINAL_RESULT)

    const { rerender } = render(<Component task={ task } />)
    await delay(20)

    rerender(<Component task={ task } />)
    await delay(20)

    expect(results.length).toBe(3)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: FINISHED, result: FINAL_RESULT })
    expect(results[2]).toEqual({ status: FINISHED, result: FINAL_RESULT })
  }))

  it("should run another task after first task", async () => act(async () => {
    const results = []

    const Component = ({ task }) => {
      const taskState = useAsyncTask(task)
      results.push(taskState)
      return <></>
    }

    const { rerender } = render(<Component task={ () => delay(10).then(() => FINAL_RESULT) } />)
    await delay(20)

    rerender(<Component task={ () => delay(10).then(() => VERY_FINAL_RESULT) } />)
    await delay(20)

    expect(results.length).toBe(4)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: FINISHED, result: FINAL_RESULT })
    expect(results[2]).toEqual({ status: RUNNING })
    expect(results[3]).toEqual({ status: FINISHED, result: VERY_FINAL_RESULT })
  }))

  it("should run another task after first task cancelled", async () => act(async () => {
    const results = []

    const Component = ({ task }) => {
      const taskState = useAsyncTask(task)
      results.push(taskState)
      return <></>
    }

    const { rerender } = render(<Component task={ () => delay(10).then(() => FINAL_RESULT) } />)

    rerender(<Component task={ () => delay(10).then(() => VERY_FINAL_RESULT) } />)

    await delay(20)

    expect(results.length).toBe(3)
    expect(results[0]).toEqual({ status: RUNNING })
    expect(results[1]).toEqual({ status: RUNNING })
    expect(results[2]).toEqual({ status: FINISHED, result: VERY_FINAL_RESULT })
  }))

  it("should return error on error", async () => act(async () => {
    const results = []

    const Component = ({ task }) => {
      const taskState = useAsyncTask(task)
      results.push(taskState)
      return <></>
    }

    render(<Component
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
