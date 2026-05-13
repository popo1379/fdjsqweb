import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRateStore = defineStore('rate', () => {
  const lprList = ref({
    standardrate: 3.5,
    gjjrate: 2.6,
    gjj_2_rate: 3.075,
    year: '2026年4月',
    lprTimeStr: '2026年4月最新LPR',
    gjjTimeStr: '2026年4月公积金利率'
  })

  const newList = ref([])

  const setLprList = (data) => {
    lprList.value = data
  }

  const setNewList = (data) => {
    newList.value = data.sort((a, b) => a.sort - b.sort)
  }

  return {
    lprList,
    newList,
    setLprList,
    setNewList
  }
})
