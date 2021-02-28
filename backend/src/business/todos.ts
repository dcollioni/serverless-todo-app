import * as uuid from 'uuid'
import TodoItem from '../models/TodoItem'
import TodoRepo from '../data/TodoRepo'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { UpdateItemOutput, DeleteItemOutput } from 'aws-sdk/clients/dynamodb'

const todoRepo = new TodoRepo()

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todoRepo.getAllTodos(userId)
}

export function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return todoRepo.createTodo({
    todoId: todoId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false
  })
}

export function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  jwtToken: string
): Promise<UpdateItemOutput> {

  const userId = parseUserId(jwtToken)

  return todoRepo.updateTodo({
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }, todoId, userId)
}

export function deleteTodo(
  todoId: string,
  jwtToken: string
): Promise<DeleteItemOutput> {

  const userId = parseUserId(jwtToken)
  return todoRepo.deleteTodo(todoId, userId)
}
