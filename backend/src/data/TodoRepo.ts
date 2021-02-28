import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient, UpdateItemOutput } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import TodoItem from '../models/TodoItem'
import TodoUpdate from '../models/TodoUpdate'

export default class TodoRepo {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE_NAME,
    private readonly todosIndex = process.env.TODOS_INDEX_NAME) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    return result.Items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo(todo: TodoUpdate, todoId: string, userId: string): Promise<UpdateItemOutput> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId and todoId = :todoId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoId': todoId
      },
      ScanIndexForward: false
    }).promise()

    if (result.Count !== 1) {
      throw new Error('Unable to find todo item')
    }

    const item = result.Items[0]

    return this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        createdAt: item.createdAt
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ":name": todo.name,
        ":dueDate": todo.dueDate,
        ":done": todo.done,
        ":todoId": todoId
      },
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ReturnValues: 'ALL_NEW'
    }).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
