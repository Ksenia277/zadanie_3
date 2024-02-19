const app = new Vue({
    el: '#app',
    data() {
        return {
            returnReason: '',
            isOverdue: false,
            lastChange: null,
            dateCreation: null,
            columns: [
                {
                    title: 'Запланированные задачи',
                    tasks: [
                        {
                            id: 1,
                            title: '',
                            description: '',
                            lastChange: null,
                            dateCreation: new Date(),
                            deadline: '',
                            createdAt: new Date(),
                            updatedAt: null,
                        },
                    ],
                },
                {
                    title: 'Задачи в работе',
                    tasks: [],
                },
                {
                    title: 'Тестирование',
                    tasks: [],
                },
                {
                    title: 'Выполненные задачи',
                    tasks: [],
                },
            ],
            completedTasks: [],
        };
    },
    filters: {
        formatDate(value) {
            if (value instanceof Date) {
                return value.toLocaleString();
            } else {
                return value;
            }
        }
    },
    methods: {
        addTask(column) {
            if (column === this.columns[0]) {
                const newTask = {
                    id: Date.now(),
                    title: '',
                    description: '',
                    deadline: '',
                    createdAt: new Date(),
                    updatedAt: null,
                    isEditing: false,
                    initialDeadline: null,
                    isOverdue: false,
                    reasonToWork: null,
                    testingDate: null,
                };
                column.tasks.push(newTask);
            }
        },
        moveTask(task, targetColumn) {
            const sourceColumnIndex = this.columns.findIndex((column) => column.tasks.includes(task));
            this.columns[sourceColumnIndex].tasks = this.columns[sourceColumnIndex].tasks.filter((t) => t.id !== task.id);
            targetColumn.tasks.push(task);
            this.updateTaskDates(task);
        },
        removeTask(task, column) {
            column.tasks = column.tasks.filter((t) => t.id !== task.id);
            this.updateTaskDates(task);
        },
        isEditingTask(task) {
            return task.updatedAt === null;
        },
        isFirstTask(taskIndex, tasks) {
            return taskIndex === 0 && tasks[taskIndex].updatedAt === null;
        },
        updateTaskDates(task) {
            if (task.updatedAt === null) {
                task.createdAt = new Date();
            }
            task.updatedAt = new Date();
            task.lastChange = task.updatedAt;
        },
        moveToInProgress(column) {
            const taskToMove = column.tasks.shift();
            this.columns[1].tasks.push(taskToMove);
            this.updateTaskDates(taskToMove);
        },
        moveToTesting(column) {
            const taskToMove = column.tasks.shift();
            this.columns[2].tasks.push(taskToMove);
            this.updateTaskDates(taskToMove);
        },
        moveToDone(column) {
            const taskToMove = column.tasks.shift();
            this.columns[3].tasks.push(taskToMove);
            this.updateTaskDates(taskToMove);
            // checkDeadline(taskToMove);
        },
        moveToWork(column) {
            if (!this.returnReason) {
                alert('Please provide a reason for returning the task to work.');
                return;
            }

            const taskToMove = column.tasks.shift();
            taskToMove.returnReason = this.returnReason;
            taskToMove.testingDate = new Date();
            this.columns[1].tasks.push(taskToMove);
            this.updateTaskDates(taskToMove);
        },
        moveToCompletedtasks() {
            const testingColumn = this.columns.find(col => col.title === 'Тестирование');
            const completedColumn = this.columns.find(col => col.title === 'Выполненные задачи');

            const index = testingColumn.tasks.findIndex(task => task.title === 'Task to Move');

            const task = testingColumn.tasks.splice(index, 1)[0];

            completedColumn.tasks.push(task);
        },
        formatDate(date) {
            if (date instanceof Date) {
                return date.toLocaleString();
            } else {
                return date;
            }
        },
        checkDeadline(task) {
            const currentDate = new Date();
            const deadlineDate = new Date(task.deadline);
            console.log(task);
            if (deadlineDate < currentDate) {
                task.isOverdue = true;
            }
        },
    },
});

Vue.filter('formatDate', function(value) {
    if (value instanceof Date) {
        return value.toLocaleString();
    } else {
        return value;
    }
});

