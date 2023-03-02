import { useState, ChangeEvent } from 'react'
import { trpc } from '../utils/trpc'

type todoType = {
  id: number
  name: string
  isComplete: boolean
}

const TodoList = () => {
  const hello = trpc.hello.useQuery()
  const helloName = trpc.helloName.useQuery({ name: 'Taka Harada' })

  const { data: todos } = trpc.todos.useQuery()
  const utils = trpc.useContext()
  const addTodo = trpc.addTodo.useMutation({
    onError: () => console.log("mutationエラー"),
    onSuccess: () => {
      utils.todos.invalidate()
    },
    onSettled: () => console.log("mutation完了")
  })
  const deleteTodo = trpc.deleteTodo.useMutation({
    onSuccess: () => {
      utils.todos.invalidate()
    }
  })

  const [inputValue, setInputValue] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const handleInputValue = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }
  const submitInputValue = () => {
    addTodo.mutate({ name: inputValue }) //ここではオブジェクトで渡す
    setInputValue('')
  }

  const handleSelectboxValue = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedId(e.target.value)
  }
  const submitSelectboxValue = () => {
    deleteTodo.mutate(Number(selectedId)) //idのみを渡してみる {id: selectedId}でもよい
    setSelectedId('')
  }


  return (
    <>
      <h1>Todo List</h1>
      <ul>
        {todos?.map((todo: todoType) => (
          <li key={todo.id}>{todo.id} : {todo.name}</li>
        ))}
      </ul>
      <div>
        <label id="name">Add Todo:</label>
        <input name="name" value={inputValue} onChange={handleInputValue}/>
        <button onClick={submitInputValue}>データを追加</button>
      </div>

      <div>
        <label id="id">Delete Todo:</label>
        <select name="deleteTodo" onChange={handleSelectboxValue}>
          {todos?.map((todo: todoType) => (
            <option value={todo.id}>{todo.name}</option>
          ))}
        </select>
        {/* <input name="id" value={inputId} onChange={handleInputId} /> */}
        <button onClick={submitSelectboxValue}>データを削除</button>
      </div>

      <p>Author : <span>{helloName.data?.author}</span></p>
    </>
  )
}

export default TodoList
