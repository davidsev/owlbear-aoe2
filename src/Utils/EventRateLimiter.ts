/**
 * Coalesces rapid calls so a slow callback doesn't fall behind: while one call is being processed,
 * further calls just overwrite a single `pending` slot, so we skip the stale ones in between and
 * always process the newest arguments.  The last call is never dropped - after each callback we
 * re-check `pending`, so we don't rely on another event arriving to flush the final one.
 *
 * The awkward bit is how we wait between iterations.  Awaiting the callback alone isn't enough:
 * that only yields a microtask, and microtasks all drain before the browser delivers the next
 * message, so the queued pointer events never get a chance to update `pending` and nothing is
 * ever coalesced.  We need a macrotask - but setTimeout/rAF get throttled to ~1s in a background
 * iframe (which is why the original version of this class was removed).  MessageChannel isn't in
 * that throttling bucket, and it's the same delivery mechanism the SDK's own events use, so
 * posting to ourselves puts us behind the queued events and lets them land first.
 */
export class EventRateLimiter<Callback extends (...args: never[]) => unknown> {
    private readonly callback: Callback;
    private pending: null | Parameters<Callback> = null;
    private flushing = false;
    private readonly channel = new MessageChannel();
    private resolveTick: null | (() => void) = null;

    constructor(callback: Callback) {
        this.callback = callback;
        this.channel.port1.onmessage = () => {
            const resolve = this.resolveTick;
            this.resolveTick = null;
            resolve?.();
        };
    }

    public call(...args: Parameters<Callback>): void {
        this.pending = args;
        if (!this.flushing) void this.flush();
    }

    private tick(): Promise<void> {
        return new Promise(resolve => {
            this.resolveTick = resolve;
            this.channel.port2.postMessage(null);
        });
    }

    private async flush(): Promise<void> {
        this.flushing = true;
        try {
            let args = this.pending;
            while (args) {
                this.pending = null;
                await this.callback.apply(null, args);
                await this.tick();
                args = this.pending;
            }
        } finally {
            // Without this a single throw would wedge `flushing` on and stop all drawing.
            this.flushing = false;
        }
    }
}
