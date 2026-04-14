import { createEffect, createLayoutEffect, createSignal } from "light-jsx/signals"

function Component() {
    const [count, setCount] = createSignal(0)

    return <button onclick={() => setCount(count() + 1)}>{count}</button>
}

document.body.append(<Component />)
