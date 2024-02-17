const app = new Vue({
    el: '#app',
    data() {
        return {
            columns: [
                {
                    title: 'Запланированные задачи',
                    tasks: [
                        {
                            id: 1,
                            title: '',
                            description: '',
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
        };
    },
    methods: {
        addTask(column) {
            const newTask = {
                id: Date.now(),
                title: '',
                description: '',
                deadline: '',
                createdAt: new Date(),
            };
            column.tasks.push(newTask);
            this.$nextTick(() => {
                this.isFirstTask(column.tasks.length - 1, column.tasks);
            });
        },
        removeTask(task, column) {
            column.tasks = column.tasks.filter((t) => t.id !== task.id);
            this.updateTaskDates(task);
        },
        saveTask(task) {
            task.updatedAt = new Date();
        },
        isFirstTask(taskIndex, tasks) {
            return taskIndex === 0 && tasks[taskIndex].updatedAt === null;
        },
        updateTaskDates(task) {
            if (task.updatedAt === null) {
                task.createdAt = new Date();
            }
            task.updatedAt = new Date();
        },
    },
});