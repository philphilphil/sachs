export class ProgressionTracker {
  private window: boolean[] = [];
  private readonly size: number;
  private readonly threshold: number;

  constructor(size = 20, threshold = 0.85) {
    this.size = size;
    this.threshold = threshold;
  }

  record(correct: boolean): void {
    this.window.push(correct);
    if (this.window.length > this.size) this.window.shift();
  }

  shouldAdvance(): boolean {
    if (this.window.length < this.size) return false;
    const correct = this.window.filter(Boolean).length;
    return correct / this.size >= this.threshold;
  }

  reset(): void {
    this.window = [];
  }
}
