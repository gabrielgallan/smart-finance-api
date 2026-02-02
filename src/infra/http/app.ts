import fastify from 'fastify'

const app = fastify()

app.get('/', () => {
  return { success: true }
})

export default app
