# USe Async Task

Provides an react hook for async tasks.

## Features

Runs the given async task in a `useEffect` hook. The returned state contains the status of the runnning task as well as the result or error. The task completion will be ignored if the component has been unmounted.

Note: The given task function must not change (e.g. wrapped with `useCallback`) otherwise a new task (read `useEffect`) will be started and the previous result will be ignored.

## Example

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
    case RUNNING: return <>query.error</>
  }
}
```

## Tests

Checkout the tests for different scenarios.

```bash
npm i && npm run test
```