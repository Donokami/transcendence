<template>
  <TresCanvas clear-color="#82DBC5" shadows alpha>
    <TresScene>
      <TresPerspectiveCamera
        :position="[1, 2, 5]"
        :fov="45"
        :aspect="1"
        :near="0.1"
        :far="1000"
      />
      <TresMesh ref="boxRef" :scale="1" cast-shadow>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshNormalMaterial />
      </TresMesh>
    </TresScene>
  </TresCanvas>
</template>

<script setup lang="ts">
import { type ShallowRef, shallowRef } from "vue";

import { useRenderLoop, type TresObject} from '@tresjs/core';

const boxRef: ShallowRef<TresObject | null> = shallowRef(null);

const { onLoop } = useRenderLoop();

onLoop(({ delta, elapsed }) => {
  if (boxRef.value) {
    boxRef.value.rotation.y += delta;
    boxRef.value.rotation.z = elapsed * 0.2;
  }
});
</script>
