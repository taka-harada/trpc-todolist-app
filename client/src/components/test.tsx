import { trpc } from '../utils/trpc'

// type TestType = {
//   name: string,
//   age?: number
// }

// const test: TestType = { name: 'John' }
//const result = TestSchema.parse(test)
const addTodo = trpc.addTodo.useMutation()

const Test = () => {
  const hello = trpc.hello.useQuery()
  const helloName = trpc.helloName.useQuery({ name: 'John' })
  const { data: todos } = trpc.todos.useQuery()

  return (
    <>
      <h1>Todo</h1>
      <div>{helloName.data?.age}</div>
    </>
  )
}

export default Test
