export interface SchedulerStep {
  delayMs: number;
  action: () => void;
}

export interface Scheduler {
  run(steps: SchedulerStep[]): Promise<void>;
  cancel(): void;
}

export function createScheduler(): Scheduler {
  let token = 0;
  let pending: ReturnType<typeof setTimeout>[] = [];
  let currentResolve: (() => void) | null = null;

  function clearPending() {
    for (const h of pending) clearTimeout(h);
    pending = [];
  }

  return {
    run(steps) {
      token++;
      const myToken = token;
      clearPending();
      // Resolve any previously pending promise
      if (currentResolve) {
        currentResolve();
        currentResolve = null;
      }
      return new Promise<void>((resolve) => {
        currentResolve = resolve;

        if (steps.length === 0) {
          currentResolve = null;
          resolve();
          return;
        }

        let elapsed = 0;
        let remaining = steps.length;

        for (const step of steps) {
          elapsed += step.delayMs;
          const h = setTimeout(() => {
            if (token !== myToken) return;
            step.action();
            remaining--;
            if (remaining === 0) {
              currentResolve = null;
              resolve();
            }
          }, elapsed);
          pending.push(h);
        }
      });
    },

    cancel() {
      token++;
      clearPending();
      if (currentResolve) {
        const r = currentResolve;
        currentResolve = null;
        r();
      }
    }
  };
}
