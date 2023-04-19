<template>
  <canvas ref="canvas" class="w-full h-full absolute bg-black top-0 left-0 z-0"></canvas>
</template>

<script lang="ts">
export default {
  name: 'GameCanvas',
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

    // Set the initial position and size of the paddles
    const paddleWidth = 10
    const paddleHeight = 50
    const leftPaddleX = 10
    const rightPaddleX = canvas.width - 20
    let rightPaddleVelocityY = 1
    let leftPaddleY = canvas.height / 2 - paddleHeight / 2
    let rightPaddleY = canvas.height / 2 - paddleHeight / 2

    // Define a function to draw the ball on the canvas
    function drawBall() {
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()
      ctx.closePath()
    }

    // Define a function to draw the paddles on the canvas
    function drawPaddles() {
      // Left paddle
      ctx.beginPath()
      ctx.rect(leftPaddleX, leftPaddleY, paddleWidth, paddleHeight)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
      ctx.closePath()

      // Right paddle
      ctx.beginPath()
      ctx.rect(rightPaddleX, rightPaddleY, paddleWidth, paddleHeight)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
      ctx.closePath()
    }

    // Define a function to clear the canvas
    function clearCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    // Define a function to update the ball's position and velocity
    function update() {
      // Bounce off the top or bottom walls
      if (y + dy > canvas.height - radius || y + dy < radius) {
        dy = -dy
      }

      // Bounce off the left or right paddles
      if (
        (x - radius <= leftPaddleX + paddleWidth &&
          x + radius >= leftPaddleX &&
          y + radius >= leftPaddleY &&
          y - radius <= leftPaddleY + paddleHeight) ||
        (x + radius >= rightPaddleX &&
          x - radius <= rightPaddleX + paddleWidth &&
          y + radius >= rightPaddleY &&
          y - radius <= rightPaddleY + paddleHeight)
      ) {
        dx = -dx
      }

      if (x + dx > canvas.width - radius || x + dx < radius) {
        // Disable the game loop
        // cancelAnimationFrame(gameLoopId)
        // Set the ball's position back to the middle of the canvas
        x = canvas.width / 2
        y = canvas.height / 2

        // Set the ball's velocity to move towards the opposite direction
        dx = -dx
        dy = -dy
      }

      // Move the ball
      x += dx
      y += dy
    }

    // Define the animation loop
    function animate() {
      clearCanvas()
      drawBall()
      drawPaddles()
      update()
      // Move the right paddle automatically
      rightPaddleY += rightPaddleVelocityY
      if (rightPaddleY + paddleHeight > canvas.height || rightPaddleY < 0) {
        rightPaddleVelocityY = -rightPaddleVelocityY
      }
      requestAnimationFrame(animate)
    }

    // Start the animation loop
    animate()
  }
}
</script>
