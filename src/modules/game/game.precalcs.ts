import { Metrics } from './game.physics'

export class Precalcs {
  constructor(
    private readonly metrics: Metrics,

    public readonly halfFieldWidth = metrics.fieldWidth * 0.5,
    public readonly halfFieldDepth = metrics.fieldDepth * 0.5,
    public readonly halfPaddleDepth = metrics.paddleDepth * 0.5,
    public readonly halfPaddleWidth = metrics.paddleRatio *
      metrics.fieldWidth *
      0.5,
    public readonly halfBall = metrics.ballRadius * 0.5,
    public readonly initBallPosY = 1.4 * metrics.fieldDepth * 0.1 -
      0.5 * (1 / metrics.fieldDepth)
  ) {}
  public calculateBallY(posZ: number): number {
    return (
      -((posZ - 1) ** 2 / this.metrics.fieldDepth ** 2) * this.halfFieldDepth +
      1.4 * this.metrics.fieldDepth * 0.1
    )
  }
}
