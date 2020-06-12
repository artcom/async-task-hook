# Use Async Task

Provides an react hook for async tasks.

## Features

Runs a given async task in a [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect) hook. The returned state contains the status of the runnning task as well as the result or error. The task completion will be ignored if the component has been unmounted.

Note: The given task function must not change (e.g. wrapped with [useCallback](https://reactjs.org/docs/hooks-reference.html#usecallback)) otherwise a new task (read [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect)) will be started and the previous result will be ignored.

## States

* `RUNNING` the initial state and the state while the task is running.
* `FINISHED` the final state as soon as the method has finished.
* `ERROR` the final state if the task threw an error.

## Example

This example queries content with [axios](https://github.com/axios/axios). The component receives the `url` as property and creates a persistent `queryFunc` which is fed to the async task hook. The returned result can be accessed when the async task has `FINISHED`. If the method throws an exception the status will be set to `ERROR`

```javascript
import axios from 'axios'
import React, { useCallback } from "react"
import { useAsyncTask, RUNNING, FINISHED, ERROR } from "@artcom/use-async-task"

const MyComponent = ({ url }) => {
  const queryFunc = useCallback(() => axios.get(url), [url])
  const query = useAsyncTask(queryFunc)

  switch(query.status) {
    case RUNNING: return <>Loading...</>
    case FINISHED: return <>query.result</>
    case ERROR: return <>query.error</>
  }
}
```

## Tests

Checkout the tests for different scenarios.

```bash
npm i && npm run test
```