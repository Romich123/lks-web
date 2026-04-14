type Context = {
    onUpdate: () => void
}

let currentContext: Context | null = null

export type Setter<T> = {
    (val: T): void
    getter: Getter<T>
}
export type Getter<T> = {
    (): T
    setter: Setter<T>
    dependand: Set<Context>
}

export function createSignal<T>(defaultValue: T) {
    let currentValue = defaultValue
    const get = (() => {
        if (currentContext) get.dependand.add(currentContext)

        return currentValue
    }) as Getter<T>

    const set = ((val: T) => {
        currentValue = val

        for (const effect of get.dependand) {
            effect.onUpdate()
        }

    }) as Setter<T>

    get.dependand = new Set()
    get.setter = set

    set.getter = get

    return [get, set] as const
}

export function createEffect(fn: () => any, getters?: Getter<any>[]) {
    const parentContext = currentContext
    currentContext = {
        onUpdate: fn,
    }

    fn()

    if (getters) {
        for (const getter of getters) {
            getter.dependand.add(currentContext)
        }
    }

    currentContext = parentContext
}

const effectPool = new Set<() => void>()
let drawRequest: ReturnType<typeof window.requestAnimationFrame> | null = null

function updatePool() {
    for (const effect of effectPool) {
        effect()
    }
    effectPool.clear()
    drawRequest = null
}

export function createLayoutEffect(fn: () => any, getters?: Getter<any>[]) {
    const parentContext = currentContext
    currentContext = {
        onUpdate() {
            effectPool.add(fn)

            if (drawRequest) return

            drawRequest = window.requestAnimationFrame(updatePool)
        },
    }

    fn()

    if (getters) {
        for (const getter of getters) {
            getter.dependand.add(currentContext)
        }
    }

    currentContext = parentContext
}
