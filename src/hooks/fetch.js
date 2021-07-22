import {ref} from 'vue'


export function useFetch(url, options) {
  const response = ref()
  const loading = ref(false)

  const request = async () => {
    loading.value = true;
    try {
      const res = await fetch(url, options)
      if (res.ok) {
        response.value = await res.json()
      }
    } catch (error) {
      console.log(error);
    } finally {
      // loading.value = false;
    }
  }

  return {response, request, loading}
}