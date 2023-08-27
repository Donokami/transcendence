<template>
  <canvas
    ref="canvas"
    class="sm:w-full h-full absolute top-0 left-0 z-0"></canvas>
</template>

<script lang="ts">
export default {
  name: 'AuthBallCanvas',
  mounted() {
    const canvas = this.$refs.canvas as HTMLCanvasElement
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    let x = canvas.width / 2
    let y = canvas.height / 2
    let dx = 1.5
    let dy = 1.5
    const radius = 2

    function drawBall(): void {
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = 'black'
      ctx.fill()
      ctx.closePath()
    }

    function clearCanvas(): void {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    function update(): void {
      if (x + dx > canvas.width - radius || x + dx < radius) {
        dx = -dx
      }

      if (y + dy > canvas.height - radius || y + dy < radius) {
        dy = -dy
      }

      x += dx
      y += dy
    }

    function animate(): void {
      clearCanvas()
      drawBall()
      update()
      requestAnimationFrame(animate)
    }

    animate()
  }
}
</script>
