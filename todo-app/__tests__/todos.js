const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates an todo and responds ", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    const parsedResponsess = JSON.parse(response.text);
    expect(parsedResponsess.id).toBeDefined();
  });

  test("Marks the todo as completed", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parsedResponsess = JSON.parse(response.text);
    const todoIDS = parsedResponsess.id;

    expect(parsedResponsess.completed).toBe(false);

    const markCompleteResponse = await agent
      .put(`/todos/${todoIDS}/markASCompleted`)
      .send();
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test("Fetches all the todos in the database ", async () => {
    await agent.post("/todos").send({
      title: "Buy xbox",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    await agent.post("/todos").send({
      title: "Buy ps3",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const response = await agent.get("/todos");
    const parsedResponsess = JSON.parse(response.text);

    expect(parsedResponsess.length).toBe(4);
    expect(parsedResponsess[3]["title"]).toBe("Buy ps3");
  });

  test("Deletes the todo with the given ID ", async () => {
    // FILL IN YOUR CODE HERE
    const response = await agent.post("/todos").send({
      title: "Buy a car",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parsedResponsess = JSON.parse(response.text);
    const todoIDS= parsedResponsess.id;

    const deleteTodoResponses = await agent.delete(`/todos/${todoIDS}`).send();
    const parsedDeleteResponses = JSON.parse(deleteTodoResponses.text);
    expect(parsedDeleteResponses).toBe(true);

    const deleteNonExistentTodoResponses = await agent
      .delete(`/todos/9999`)
      .send();
    const parsedDeleteNonExistentTodoResponses = JSON.parse(
      deleteNonExistentTodoResponses.text
    );
    expect(parsedDeleteNonExistentTodoResponses).toBe(false);
  });
});
