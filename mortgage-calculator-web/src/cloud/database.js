import { getDb } from './cloudbase'

export const getRateData = async () => {
  try {
    const db = await getDb()
    if (!db) {
      console.error('数据库实例为空')
      return null
    }
    const res = await db.collection('LPRlist').orderBy('time', 'desc').limit(1).get()
    return res.data[0] || null
  } catch (err) {
    console.error('获取利率数据失败:', err)
    return null
  }
}

export const getPolicyList = async () => {
  try {
    const db = await getDb()
    if (!db) {
      console.error('数据库实例为空')
      return []
    }
    const res = await db.collection('policy_news').orderBy('sort', 'asc').get()
    return res.data
  } catch (err) {
    console.error('获取政策资讯失败:', err)
    return []
  }
}

export default {
  getRateData,
  getPolicyList
}
