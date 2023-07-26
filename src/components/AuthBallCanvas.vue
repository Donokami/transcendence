<template>
  <canvas ref="canvas" class="w-full h-full absolute top-0 left-0 z-0"></canvas>
</template>

<script lang="ts">
export default {
  name: 'AuthBallCanvas',
  mounted() {
    // Get the canvas element and its context
    const canvas = this.$refs.canvas as HTMLCanvasElement
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    // Set the initial position and velocity of the ball
    let x = canvas.width / 2
    let y = canvas.height / 2
    let dx = 1.5
    let dy = 1.5
    const radius = 2

    // Define a function to draw the ball on the canvas
    function drawBall(): void {
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = 'black'
      ctx.fill()
      ctx.closePath()
    }

    // Define a function to clear the canvas
    function clearCanvas(): void {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    // Define a function to update the ball's position and velocity
    function update(): void {
      // Bounce off the left or right walls
      if (x + dx > canvas.width - radius || x + dx < radius) {
        dx = -dx
      }

      // Bounce off the top or bottom walls
      if (y + dy > canvas.height - radius || y + dy < radius) {
        dy = -dy
      }

      // Move the ball
      x += dx
      y += dy
    }

    // Define the animation loop
    function animate(): void {
      clearCanvas()
      drawBall()
      update()
      requestAnimationFrame(animate)
    }

    // Start the animation loop
    animate()
  }
}
</script>
