export const isHmtlInputElement = (element: unknown): element is HTMLInputElement =>
    element instanceof HTMLInputElement;


export const isElement = (element: unknown): element is HTMLElement =>
    element instanceof HTMLElement;

export const isHTMLDivElement = (element: unknown): element is HTMLDivElement =>
    element instanceof HTMLDivElement;