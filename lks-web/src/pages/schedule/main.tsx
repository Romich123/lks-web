import { render } from "light-jsx"
import { createSignal } from "light-jsx/signals"

function Component() {
    const [count, setCount] = createSignal(0)
    const [count2, setCount2] = createSignal(0)

    return (
        <>
            <button onclick={() => setCount(count() + 1)}>{count}</button>
            <button onclick={() => setCount2(count2() + 1)}>{count2}</button>
        </>
    )
}

render(document.body, <Component />)
