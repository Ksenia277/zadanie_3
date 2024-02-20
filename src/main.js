Vue.component('task', {
    props: ['task', 'column'],
    template: `
      <div class="task-card">
        <div class="task-actions" v-if="isEditingTask(task) || isFirstTask(taskIndex, column.tasks)">
          <button @click="$emit('remove-task', task)">Удалить</button>
        </div>
        <input v-model="task.title" type="text" class="task-title" v-if="isEditingTask(task)">
        <p class="task-title" v-else>{{ task.title }}</p>
        <textarea v-model="task.description" class="task-description"></textarea>
        <input v-model="task.deadline" type="datetime-local" class="task-deadline" @input="checkDeadline(task)">
        <p>Дата редактирования: {{ task.lastChange | formatDate }}</p>
        <p>Дата создания: {{ task.createdAt | formatDate }}</p>
      </div>
    `,
    methods: {
        removeTask(task) {
            const index = this.column.tasks.indexOf(task);
            if (index !== -1) {
                this.column.tasks.splice(index, 1);
            }
        },
        isEditingTask(task) {
            return task.updatedAt === null;
        },
        isFirstTask(taskIndex, tasks) {
            return taskIndex === 0 && tasks[taskIndex].updatedAt === null;
        },
        checkDeadline(task) {
            const currentDate = new Date();
            const deadlineDate = new Date(task.deadline);
            console.log(task);
            if (deadlineDate < currentDate) {
                task.isOverdue = true;
            }
        }
    }
});


Vue.component('task-list', {
    props: ['tasks', 'column'],
    template: `
      <div class="task-list">
        <transition-group>
          <task v-for="(task, index) in tasks" :key="task.id" :task="task" :column="column" @remove-task="removeTask($event)"></task>
        </transition-group>
      </div>
    `,
    methods: {
        removeTask(task) {
            this.$emit('remove-task', task);
        }
    }
});


Vue.component('column', {
    props: ['column'],
    template: `
      <div class="column">
        <button v-if="column.title === 'Запланированные задачи'" @click="addTask(column)">Создать</button>
        <h3>{{ column.title }}</h3>
        <task-list :tasks="column.tasks" :column="column" @remove-task="removeTask($event)"></task-list>
        <button v-if="column.title === 'Задачи в работе'" @click="moveToTesting(column)">Перенести в "Тестирование"</button>
        <button v-if="column.title === 'Запланированные задачи'" @click="moveToWork(column)">Перенести в "Задачи в работе"</button>
        <button v-if="column.title === 'Тестирование'" @click="moveToWork(column)">Обратно в "Задачи в работе"</button>
        <input type="text" v-model="returnReason" placeholder="Reason for returning to work" class="return-reason" v-if="column.title === 'Тестирование'">
        <column
            v-for="column in columns"
            :key="column.title"
            :column="column"
            @move-to-testing="moveTaskToTesting($event)"
        ></column>      
      </div>
    `,
    methods: {
        addTask(column) {
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
        },
        moveToTesting(column) {
            if (column.tasks.length > 0) {
                const taskToMove = column.tasks.shift();
                this.$emit('move-to-testing', taskToMove);
            }
        },
        moveTaskToTesting(task) {
            const testingColumn = this.columns.find(col => col.title === 'Тестирование');
            if (testingColumn) {
                testingColumn.tasks.push(task);
            }
        },
        removeTask(task) {
            const index = this.column.tasks.indexOf(task);
            if (index !== -1) {
                this.column.tasks.splice(index, 1);
                // Обновляем состояние Vue, чтобы Vue мог отслеживать изменения
                this.$forceUpdate();
            }
        },
        moveToCompletedtasks() {
            const testingColumn = this.columns.find(col => col.title === 'Тестирование');
            const completedColumn = this.columns.find(col => col.title === 'Выполненные задачи');

            const index = testingColumn.tasks.findIndex(task => task.title === 'Task to Move');

            const task = testingColumn.tasks.splice(index, 1)[0];

            this.$parent.moveToCompletedtasks(column);
        },
        moveToWork(column) {
            if (column.tasks.length > 0) {
                const taskToMove = column.tasks[0];
                const workColumn = this.$parent.columns.find(col => col.title === 'Задачи в работе');
                if (workColumn) {
                    const index = column.tasks.indexOf(taskToMove);
                    if (index !== -1) {
                        // Удаляем задачу из исходного массива без мутации
                        const newTasks = [...column.tasks];
                        newTasks.splice(index, 1);
                        column.tasks = newTasks;
                        workColumn.tasks.push(taskToMove);
                    }
                }
            }
        }
    }
});

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
        removeTask(task) {
            const column = this.$parent.column;
            const index = column.tasks.indexOf(task);
            if (index !== -1) {
                column.tasks.splice(index, 1);
            }
        },
        checkDeadline(task) {
            const currentDate = new Date();
            const deadlineDate = new Date(task.deadline);
            if (deadlineDate < currentDate) {
                task.isOverdue = true;
            }
            // Обновляем дату редактирования задачи
            task.lastChange = new Date();
        },
        isEditingTask(task) {
            return task.updatedAt === null;
        },
        isFirstTask(taskIndex, tasks) {
            return taskIndex === 0 && tasks[taskIndex].updatedAt === null;
        },
        formatDate(date) {
            if (date instanceof Date) {
                return date.toLocaleString();
            } else {
                return date;
            }
        },
    }
});

Vue.filter('formatDate', function(value) {
    if (!value) return '';
    return new Date(value).toLocaleString();
});

