import "./JSXTypes"
import { createLayoutEffect } from "./signals"

type Renderable = (Node | Node[]) | Renderable[]

function getParent(r: Renderable): Node | null {
    if (Array.isArray(r)) {
        if (r.length) return getParent(r[0]!)

        return null
    }

    return r.parentNode
}

function removeRenderable(rs: Renderable) {
    if (Array.isArray(rs)) {
        for (const r of rs) {
            removeRenderable(r)
        }
        return
    }

    if (rs.parentNode) rs.parentNode.removeChild(rs)
}

function addRenderable(parent: Node, rs: Renderable) {
    if (Array.isArray(rs)) {
        for (const r of rs) {
            addRenderable(parent, r)
        }
        return
    }

    parent.appendChild(rs)
}

function replaceRenderable(a: Renderable, b: Renderable) {
    const parent = getParent(a)

    if (!parent) {
        return false
    }

    removeRenderable(a)
    addRenderable(parent, b)

    return true
}

function functionToRenderable(fn: () => any): Renderable {
    let value!: Renderable
    let first = true
    createLayoutEffect(() => {
        if (first) {
            value = anyToRenderable(fn())
            first = false
            return
        }

        const prevVal = value
        const newVal = anyToRenderable(fn())

        const replaceResult = replaceRenderable(prevVal, newVal)

        if (!replaceResult) {
            console.error("When rendering function no parent was found, which most likely indicates that component was called without being mounted in DOM")
            return
        }

        value = newVal
    })

    return value
}

function anyToRenderable(value: any): Renderable {
    if (value instanceof Node) {
        return value
    }

    switch (typeof value) {
        case "string":
        case "number":
        case "bigint":
            console.log(value)
            return document.createTextNode(value + "")
        case "boolean":
            if (value) {
                return new Text("true")
            }

            // empty text nodes don't change layout visually
            return new Text("")
        case "symbol":
            throw new Error("Symbols are not supported as JSX child")
        case "object":
            if (!value) {
                return new Text("")
            }

            if (Array.isArray(value)) {
                return value.map(anyToRenderable)
            }

            throw new Error("Objects are not supported as JSX child")

        case "undefined":
            return new Text("")
        case "function":
            return functionToRenderable(value)
    }
}

function setAttribute(elm: HTMLElement, name: string, val: any) {
    if (name.startsWith("on") && name.toLowerCase() in window) {
        elm.addEventListener(name.toLowerCase().substring(2), val)
    } else if (name === "ref") {
        val(elm)
    } else if (typeof val === "function") {
        createLayoutEffect(() => {
            setAttribute(elm, name, val())
        })
    } else if (name === "style") {
        Object.assign(elm.style, val)
    } else if (val === true) {
        elm.setAttribute(name, name)
    } else if (val !== false && val != null) {
        elm.setAttribute(name, val)
    } else if (val === false) {
        elm.removeAttribute(name)
    }
}

function basicElement(tag: string, props: { [k: string]: any } & { children?: JSX.Element[] }): Node {
    let result
    if (props.xmlns && typeof props.xmlns === "string") {
        result = document.createAttributeNS(props.xmlns, tag)
    } else {
        result = document.createElement(tag)
    }
}

export function jsxDEV(tag: JSX.ElementType, props: { [k: string]: any } & { children?: JSX.Element[] }): JSX.Element {
    console.log(...arguments)
    const children = props.children

    if (typeof tag === "string") {
        const result = document.createElement(tag)

        if (!children) return result

        addRenderable(result, anyToRenderable(children))

        for (const propKey in props) {
            result.setAttribute()
        }

        return result
    }

    // Fragment
    if (typeof tag === "undefined") {
        return anyToRenderable(children)
    }

    let value!: Renderable
    let first = true
    createLayoutEffect(() => {
        if (first) {
            value = anyToRenderable(tag(props))
            first = false
            return
        }

        const prevVal = value
        const newVal = anyToRenderable(tag(props))

        const replaceResult = replaceRenderable(prevVal, newVal)

        if (!replaceResult) {
            console.error("When rendering function no parent was found, which most likely indicates that component was called without being mounted in DOM")
            return
        }

        value = newVal
    })

    return value
}
