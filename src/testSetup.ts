// Registered via `--import` before test files load. The OBR SDK expects to run inside an iframe
// and touches `window` at module-load time (building its message bus), which crashes under plain
// Node otherwise. Shape/geometry code is what we're testing, and it drags in `roomMetadata` (and
// therefore the SDK) transitively — this stub just lets those modules load without a real OBR host.
if (typeof (globalThis as { window?: unknown }).window === 'undefined') {
    (globalThis as unknown as { window: unknown }).window = {
        location: { search: '' },
        addEventListener: () => {},
        removeEventListener: () => {},
        parent: undefined,
        setTimeout: (...args: Parameters<typeof setTimeout>) => setTimeout(...args),
    };
}
