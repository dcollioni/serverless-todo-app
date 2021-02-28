import * as uuid from 'uuid'
import TodoItem from '../models/TodoItem'
import UploadUrl from '../models/UploadUrl'
import TodoRepo from '../data/TodoRepo'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { UpdateItemOutput, DeleteItemOutput } from 'aws-sdk/clients/dynamodb'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const todoRepo = new TodoRepo()

export function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
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
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
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

export function generateUploadUrl(todoId: string): UploadUrl {
  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })

  return { uploadUrl }
}
