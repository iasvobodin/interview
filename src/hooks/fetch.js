import {ref} from 'vue'


export function useFetch(url, options) {
  const response = ref()

  const request = async () => {
    try {
      const res = await fetch(url, options)
      if (res.ok) {
        response.value = await res.json()
      }
    } catch (error) {
      console.log(error);
    } finally {
      // store.commit("changeLoader", false)
    }
  }

  return {response, request}
}