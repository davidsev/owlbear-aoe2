export class EventRateLimiter<Callback extends (...args: any[]) => any> {
    private readonly callback: Callback;
    private nextCall: null | Parameters<Callback> = null;
    private timeout: null | NodeJS.Timeout = null;

    constructor (callback: Callback) {
        this.callback = callback;
    }

    public call (...args: Parameters<Callback>): void {
        if (!this.timeout)
            this.timeout = setTimeout(this.timeoutTriggered.bind(this), 5);
        if (this.nextCall)
            console.warn('Skipping event call because the previous event has not been processed yet.');
        this.nextCall = args;
    }

    private timeoutTriggered (): void {
        if (this.nextCall)
            this.callback.apply(null, this.nextCall);
        this.nextCall = null;
        this.timeout = null;
    }
}
