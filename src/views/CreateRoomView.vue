<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto text-black">
    <div class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify">
      <h2 class="text-2xl font-bold mb-8 text-black">Create a game</h2>

      <div class="w-fit flex items-center justify-center z-10">
        <Form ref="formRef" :validation-schema="signInSchema" @submit="submitForm">
          <div class="mb-6">
            <label class="block font-medium mb-1" for="name">Name</label>
            <Field
              class="neobrutalist-input w-full text-black"
              id="name"
              name="name"
              type="text"
              placeholder="Enter a name for your game"
            />
            <ErrorMessage class="font-normal text-base text-red-600" name="name" />
          </div>
          <div class="flex flex-row items-center">
            <label class="block font-medium mb-1" for="private">Private game</label>
            <input type="checkbox" name="private" v-model="isPrivate" class="ml-4 toggle rounded-none" />
          </div>
          <div class="flex items-center justify-between mt-8">
            <button
              class="btn border-zinc-900 bg-zinc-900 text-white"
              type="submit"
              :disabled="isFetching"
            >
              Create game
            </button>
            <div>
              {{ error }} <!-- todo: add style -->
            </div>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form, Field, ErrorMessage } from 'vee-validate'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import fetcher from '@/utils/fetcher'

const router = useRouter()

const signInSchema = {
  name: 'required|min:3|max:15'
}

const isFetching = ref(false)
const error = ref('')
const isPrivate = ref(false)

const submitForm = async (values: Record<string, any>): Promise<void> => {
  try {
    isFetching.value = true
    const res = await fetcher.post('/games', {
      name: values.name,
      isPrivate: isPrivate.value
    })

    await router.push(`/room/${res.id}`)
  } catch (err: any) {
    error.value = err.message
  } finally {
    isFetching.value = false
  }
}
</script>
