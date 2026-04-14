declare global {
    namespace JSX {
        type Renderable = (Node | Node[]) | Renderable[]

        type ElementType = (string & keyof IntrinsicElements) | ((...p: any) => JSX.Element)
        type Element = Renderable

        interface IntrinsicElements {
            [k: string]: any
        }
    }
}
