// import * as uuid from 'uuid'

import TodoItem from '../models/TodoItem'
import TodoRepo from '../data/TodoRepo'
// import { CreateGroupRequest } from '../requests/CreateGroupRequest'
import { parseUserId } from '../auth/utils'

const todoRepo = new TodoRepo()

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todoRepo.getAllTodos(userId)
}

// export async function createGroup(
//   createGroupRequest: CreateGroupRequest,
//   jwtToken: string
// ): Promise<Group> {

//   const itemId = uuid.v4()
//   const userId = getUserId(jwtToken)

//   return await groupAccess.createGroup({
//     id: itemId,
//     userId: userId,
//     name: createGroupRequest.name,
//     description: createGroupRequest.description,
//     timestamp: new Date().toISOString()
//   })
// }
