import cliProgress from "cli-progress";

class Progress {
  bar!: cliProgress.SingleBar;

  start(total: number, start: number = 0) {
    this.bar = new cliProgress.SingleBar(
      {
        clearOnComplete: true,
        barsize: 20,
      },
      cliProgress.Presets.shades_grey
    );

    this.bar.start(total, start);
  }

  increment() {
    this.bar.increment();
  }

  update(curr: number) {
    this.bar.update(curr);
  }

  stop() {
    this.bar.stop();
  }
}

const bar = new Progress();
export { bar };
