<template>
  <TresCanvas>
    <TresPerspectiveCamera />
    <TresMesh ref="boxRef" :scale="1">
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshNormalMaterial />
    </TresMesh>
  </TresCanvas>
</template>

<script setup lang="ts">
import { type ShallowRef, shallowRef } from "vue";

import { useRenderLoop, type TresInstance } from "@tresjs/core";

const boxRef = shallowRef(null);

const { onLoop } = useRenderLoop();

onLoop(({ elapsed }) => {
  boxRef.value.position.x = Math.sin(elapsed * 0.1) * 3;
});
</script>
