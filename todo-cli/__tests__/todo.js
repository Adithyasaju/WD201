/* eslint-disable no-undef */
const db = require("../models");

const getJSDate = (days) => {
  if (!Number.isInteger(days)) {
    throw new Error("Need to pass an integer as days");
  }
  const today = new Date();
  const oneDay = 60 * 60 * 24 * 1000;
  return new Date(today.getTime() + days * oneDay);
};

describe("Test the list of items", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  test("Add overdue items", async () => {
    const todo = await db.Todo.addTask({
      title: "This is a sample item",
      dueDate: getJSDate(-2),
      completed: false,
    });
    const items = await db.Todo.overdue();
    expect(items.length).toBe(1);
  });

  test("Add due today items", async () => {
    const dueTodayItems = await db.Todo.dueToday();
    const todo = await db.Todo.addTask({
      title: "This is a sample item",
      dueDate: getJSDate(0),
      completed: false,
    });
    const items = await db.Todo.dueToday();
    expect(items.length).toBe(dueTodayItems.length + 1);
  });

  test("Add due later item", async () => {
    const dueLaterItems = await db.Todo.dueLater();
    const todo = await db.Todo.addTask({
      title: "This is a sample item",
      dueDate: getJSDate(2),
      completed: false,
    });
    const items = await db.Todo.dueLater();
    expect(items.length).toBe(dueLaterItems.length + 1);
  });

  test("Mark as completed", async () => {
    const overdueItems = await db.Todo.overdue();
    const sTodo = overdueItems[0];
    expect(sTodo.completed).toBe(false);
    await db.Todo.markAsComplete(sTodo.id);
    await sTodo.reload();

    expect(sTodo.completed).toBe(true);
  });

  test("Test is completed ", async () => {
    const overdueItems = await db.Todo.overdue();
    const sTodo = overdueItems[0];
    expect(sTodo.completed).toBe(true);
    const displayValue = sTodo.displayableString();
    expect(displayValue).toBe(
      `${sTodo.id}. [x] ${sTodo.title} ${sTodo.dueDate}`
    );
  });

  test("Test is incomplete ", async () => {
    const dueLaterItems = await db.Todo.dueLater();
    const sTodo = dueLaterItems[0];
    expect(sTodo.completed).toBe(false);
    const displayValue = sTodo.displayableString();
    expect(displayValue).toBe(
      `${sTodo.id}. [ ] ${sTodo.title} ${sTodo.dueDate}`
    );
  });

  test("Test is incomplete dueToday ", async () => {
    const dueTodayvalues = await db.Todo.dueToday();
    const sTodo = dueTodayvalues[0];
    expect(sTodo.completed).toBe(false);
    const displayitems = sTodo.displayableString();
    expect(displayitems).toBe(`${sTodo.id}. [ ] ${sTodo.title}`);
  });

  test("Test is completed dueToday ", async () => {
    const dueTodayvalues = await db.Todo.dueToday();
    const sTodo = dueTodayvalues[0];
    expect(sTodo.completed).toBe(false);
    await db.Todo.markAsComplete(sTodo.id);
    await sTodo.reload();
    const displayitems = sTodo.displayableString();
    expect(displayitems).toBe(`${sTodo.id}. [x] ${sTodo.title}`);
  });
});
