import express from 'express'
import { inferAsyncReturnType, initTRPC } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import cors from 'cors'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const app = express()
const PORT = 3000
app.use(cors())
const prisma = new PrismaClient()
const createContext = (opts: trpcExpress.CreateExpressContextOptions) => {
  console.log(!"createContext内でheadersにアクセス",opts.req.headers)
  return { prisma }
};
type Context = inferAsyncReturnType<typeof createContext>

const t = initTRPC.context<Context>().create()

// MEMO: zodで省略可能なプロパティ指定したいけどできない？？
const TestSchema = z.object({
  name: z.string(),
  age: z.number().optional()
})

const appRouter = t.router({
  hello: t.procedure.query(() => {
    return 'Hello tRPC World!!'
  }),
  hoge: t.procedure.query(() => {
    return 'Hollo hogehoge!!!'
  }),
  helloName: t.procedure
    .input(TestSchema)
    .query(({ input }) => {
      return {
        greeting: `Hello World ${input.name}`,
        author: `created by ${input.name}`,
        age: input.age
      }
    }),
  todos: t.procedure
    .query(async ({ ctx }: any) => {
      const todos = await ctx.prisma.todo.findMany()
      return todos
  }),
  //クライアント側で入力したnameをオブジェクト(z.object({ name: z.string() }))で受け取る
  addTodo: t.procedure.input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      //prismaのtodoテーブル？に{data: xxxx}をcreateする？
      const todo = await ctx.prisma.todo.create({ data: input })
      return todo
    }),
  //クライアント側で入力したidをvalueだけ(z.number())で受け取る
  deleteTodo: t.procedure.input(z.number()).mutation(async ({ ctx, input }) => {
    const deleteTarget = await ctx.prisma.todo.delete({ where: { id: input } })
    return deleteTarget
  }),
  //クライアント側で入力したidをオブジェクトで受け取る
  // deleteTodo: t.procedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
  //   const target = await ctx.prisma.todo.delete({ where: input })
  // })
})

app.get('/', (_req, res) => res.send('hello'))
app.use('/trpc', trpcExpress.createExpressMiddleware({ router: appRouter, createContext}))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));

export type AppRouter = typeof appRouter
