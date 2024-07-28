const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const days = require('date-fns')
const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
const invalid = (request, response, next) => {
  const {status, priority, category} = request.query

  if (status != undefined) {
    const statuslist = ['TO DO', 'IN PROGRESS', 'DONE']
    if (!prioritylist.includes(priority)) {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  }
}
initializeDBAndServer()
const haspriority = query => {
  return query.priority !== undefined
}
const haspriorityandcategory = query => {
  return query.priority !== undefined && query.category !== undefined
}
const haspriorityandstatus = query => {
  return query.priority !== undefined && query.status !== undefined
}
const hascategory = query => {
  return query.category !== undefined
}
const hasstatus = query => {
  return query.status !== undefined
}
const hascategoryandstatus = query => {
  return (query.category !== undefined) & (query.status !== undefined)
}
const checkpriority = priority => {
  const prioritylist = ['HIGH', 'LOW', 'MEDIUM']
  if (!prioritylist.includes(priority)) {
    return false
  } else {
    return true
  }
}
const checkcategory = category => {
  const categorylist = ['WORK', 'HOME', 'LEARNING']
  if (!categorylist.includes(category)) {
    return false
  } else {
    return true
  }
}
const checkstatus = status => {
  const statuslist = ['TO DO', 'IN PROGRESS', 'DONE']
  if (!statuslist.includes(status)) {
    return false
  } else {
    return true
  }
}
const converttodbarr = each => {
  return {
    id: each.id,
    todo: each.todo,
    priority: each.priority,
    status: each.status,
    category: each.category,
    dueDate: each.due_date,
  }
}
app.get('/todos/', async (request, response) => {
  const {status, priority, search_q = '', category} = request.query
  switch (true) {
    case haspriorityandcategory(request.query):
      if (checkpriority(priority) && checkcategory(category)) {
        const priorityandcategory = `select * from todo where category = '${category}' and priority = '${priority}';`
        const dbget1 = await db.all(priorityandcategory)
        response.send(
          dbget1.map(each => {
            return converttodbarr(each)
          }),
        )
      } else {
        response.status(400)
        if (checkpriority(priority) == false) {
          response.send('Invalid Todo Priority')
        } else {
          response.send('Invalid Todo Category')
        }
      }
      break
    case haspriorityandstatus(request.query):
      if (checkpriority(priority) && checkstatus(status)) {
        const priorityandcategory = `select * from todo where status = '${status}' and priority = '${priority}';`
        const dbget1 = await db.all(priorityandcategory)
        response.send(
          dbget1.map(each => {
            return converttodbarr(each)
          }),
        )
      } else {
        response.status(400)
        if (checkpriority(priority) == false) {
          response.send('Invalid Todo Priority')
        } else {
          response.send('Invalid Todo Status')
        }
      }
      break
    case hascategoryandstatus(request.query):
      if (checkstatus(status) && checkcategory(category)) {
        const priorityandcategory = `select * from todo where category = '${category}' and status = '${status}';`
        const dbget1 = await db.all(priorityandcategory)
        response.send(
          dbget1.map(each => {
            return converttodbarr(each)
          }),
        )
      } else {
        response.status(400)
        if (checkcategory(category) == false) {
          response.send('Invalid Todo Category')
        } else {
          response.send('Invalid Todo Status')
        }
      }
      break
    case haspriority(request.query):
      if (checkpriority(priority)) {
        const statusquery = `select * from todo where priority = '${priority}';`
        const dbget1 = await db.all(statusquery)
        response.send(
          dbget1.map(each => {
            return converttodbarr(each)
          }),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasstatus(request.query):
      if (checkstatus(status)) {
        const statusquery = `select * from todo where status = '${status}';`
        const dbget1 = await db.all(statusquery)
        response.send(
          dbget1.map(each => {
            return converttodbarr(each)
          }),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case hascategory(request.query):
      if (checkcategory(category)) {
        const statusquery = `select * from todo where category = '${category}';`
        const dbget1 = await db.all(statusquery)
        response.send(
          dbget1.map(each => {
            return converttodbarr(each)
          }),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    default:
      const searchquery = `select * from todo where todo like '%${search_q}%';`
      const dbsearch = await db.all(searchquery)
      response.send(dbsearch.map(each => converttodbarr(each)))
      break
  }
})

app.get('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const gettodoidquery = `select * from todo where id = ${todoId};`
  const dbgettodo = await db.get(gettodoidquery)
  response.send(converttodbarr(dbgettodo))
})
app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  const datequery = `select * from todo where due_date = '${date}';`
  const dbdate = db.all(datequery)
  response.send(dbdate.map(each => converttodbarr(each)))
})
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (!checkpriority(priority)) {
    response.status(400)
    response.send('Invalid Todo Priority')
  } else if (!checkcategory(category)) {
    response.status(400)
    response.send('Invalid Todo Category')
  } else if (!checkstatus(status)) {
    response.status(400)
    response.send('Invalid Todo Status')
  } else {
    const postquery = `insert into todo(id,todo,priority,status,category,due_date)
  values(${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`
    const postresult = await db.run(postquery)
    response.send('Todo Successfully Added')
  }
})
app.put('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const {status, category, dueDate, todo, priority} = request.body
  if (status !== undefined) {
    if (!checkstatus(status)) {
      response.status(400)
      response.send('Invalid Todo Status')
    } else {
      const putquery = `update todo set status = '${status}' where id =${todoId}; `
      const dbput = await db.run(putquery)
      response.send('Status Updated')
    }
  } else if (category !== undefined) {
    if (!checkcategory(category)) {
      response.status(400)
      response.send('Invalid Todo Category')
    } else {
      const putquery = `update todo set category = '${category}' where id =${todoId}; `
      const dbput = await db.run(putquery)
      response.send('Category Updated')
    }
  } else if (priority !== undefined) {
    if (!checkpriority(priority)) {
      response.status(400)
      response.send('Invalid Todo Priority')
    } else {
      const putquery = `update todo set priority = '${priority}' where id =${todoId}; `
      const dbput = await db.run(putquery)
      response.send('Priority Updated')
    }
  } else if (todo !== undefined) {
    const putquery = `update todo set todo = '${todo}' where id =${todoId}; `
    const dbput = await db.run(putquery)
    response.send('Todo Updated')
  } else {
    const putquery = `update todo set due_date = '${dueDate}' where id =${todoId}; `
    const dbput = await db.run(putquery)
    response.send('Due Date Updated')
  }
})
app.delete('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const deletequery = `delete from todo where id =${todoId};`
  const dbdelete = await db.exec(deletequery)
  response.send('Todo Deleted')
})
module.exports = app
