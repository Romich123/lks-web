import { addRenderable } from "./jsx-dev-runtime";

export function render(root: Node, r: JSX.Renderable) {
    addRenderable(root, r)
}