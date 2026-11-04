// The game's heartbeat: one requestAnimationFrame loop that reports
// elapsed seconds to its tick function. Nothing else in the codebase
// schedules time, so there is exactly one timer and nothing to leak.

export type Tick = (elapsedSeconds: number) => void;

/**
 * Start the loop. Returns a stop function that cancels the pending
 * frame and stops scheduling; call it when tearing the game down.
 */
export function startGameLoop(tick: Tick): () => void {
  let last = performance.now();
  let running = true;
  let handle = 0;

  function frame(now: number): void {
    if (!running) return;
    tick((now - last) / 1000);
    last = now;
    handle = requestAnimationFrame(frame);
  }

  handle = requestAnimationFrame(frame);
  return () => {
    running = false;
    cancelAnimationFrame(handle);
  };
}
