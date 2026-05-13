import CloudBase from '@cloudbase/js-sdk'

let app = null
let db = null
let authInstance = null

const initCloudBase = () => {
  if (app) return Promise.resolve({ app, db, auth: authInstance })
  
  return new Promise((resolve, reject) => {
    try {
      app = CloudBase.init({
        env: import.meta.env.VITE_CLOUD_ENV || 'mortgagecalculator-9d0fqf0fbb151'
      })
      
      if (!app) {
        console.error('云开发初始化失败：app对象为空')
        reject(new Error('云开发初始化失败'))
        return
      }
      
      db = app.database()
      authInstance = app.auth({
        persistence: 'local'
      })
      
      console.log('云开发SDK初始化成功')
      resolve({ app, db, auth: authInstance })
    } catch (error) {
      console.error('云开发SDK初始化错误:', error)
      reject(error)
    }
  })
}

const getDb = async () => {
  if (!db) {
    await initCloudBase()
  }
  return db
}

const getAuth = async () => {
  if (!authInstance) {
    await initCloudBase()
  }
  return authInstance
}

export { app, initCloudBase, getDb, getAuth }
export default app
