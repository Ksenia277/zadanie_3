
Vue.component('task', {
    props: ['task', 'column'],
    template: `
      <div class="task-card">
        <div class="task-actions" v-if="isEditingTask(task) || isFirstTask(taskIndex, column.tasks)">
          <button @click="removeTask(task)">Удалить</button>
        </div>
        <input v-model="task.title" type="text" class="task-title" @input="updateTask(task)">
        <p class="task-title" v-else>{{ task.title }}</p>
        <textarea v-model="task.description" class="task-description" @input="updateTask(task)"></textarea>
        <input v-model="task.deadline" type="datetime-local" class="task-deadline" @input="updateTask(task)">
        <p>Дата редактирования: {{ task.updatedAt | formatDate }}</p>
        <p>Дата создания: {{ task.createdAt | formatDate }}</p>
      </div>
    `,
    methods: {

        updateTask(task) {
            task.updatedAt = new Date(); // Обновление времени последнего изменения задачи
        },
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
    props: ['column', 'columns'],
    data() {
        return {
            returnReason: '',
        };
    },
    computed: {
        showReturnInput() {
            return this.column.title === 'Тестирование' && this.column.tasks.some(task => task.isEditing);
        },
    },
    template: `
      <div class="column">
        <button v-if="column.title === 'Запланированные задачи'" @click="addTask(column)">Создать</button>
        <h3>{{ column.title }}</h3>
        <task-list :tasks="column.tasks" :column="column"></task-list>
        <button v-if="column.title === 'Задачи в работе'" @click="moveToTesting(column)">Перенести в 'Тестирование'</button>
        <button v-if="column.title === 'Запланированные задачи'" @click="moveToWork(column)">Перенести в 'Задачи в работе'</button>
        <button v-if="column.title === 'Тестирование'" @click="moveToWork(column)">Обратно в 'Задачи в работе'</button>
        <button v-if="column.title === 'Тестирование'" @click="moveToCompletedtasks">Перенести в выполненные</button>
        <div v-if="showReturnInput">
          <label>Причина возврата:</label>
          <input type="text" v-model="returnReason" @input="updateReasonToWork" placeholder="Введите причину возврата">
        </div>
        <column
            v-for="(col, index) in columns"
            :key="col.title + index"
            :column="col"
            :columns="columns"
            @move-to-testing="moveTaskToTesting"
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
        updateReasonToWork() {
            this.column.tasks.forEach(task => {
                if (task.isEditing) {
                    task.reasonToWork = this.returnReason;
                }
            });
        },
        moveToTesting(column) {
            this.updateReasonToWork();
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
        moveToCompletedtasks() {
            const testingColumn = this.columns.find(col => col.title === 'Тестирование');
            const completedColumn = this.columns.find(col => col.title === 'Выполненные задачи');

            if (testingColumn && testingColumn.tasks.length > 0) {
                const taskToMove = testingColumn.tasks.shift();
                if (completedColumn) {
                    completedColumn.tasks.push(taskToMove);
                }
            }
        },
        moveToWork(column) {
            if (column.tasks.length > 0) {
                const taskToMove = column.tasks[0];
                const workColumn = this.$parent.columns.find(col => col.title
                    === 'Задачи в работе');
                if (workColumn) {
                    const index = column.tasks.indexOf(taskToMove);
                    if (index !== -1) {
                        // Удаляем задачу из исходного массива без мутации
                        const newTasks = [...column.tasks];
                        newTasks.splice(index, 1);
                        column.tasks = newTasks;
                        workColumn.tasks.push(taskToMove);
                    }
                    task.returnReason = '';
                }
            }
        },
        }

});

Vue.filter('formatDate', function(value) {
    if (!value) return '';
    return new Date(value).toLocaleString();
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
        moveToWork(column) {
            if (column.tasks.length > 0) {
                const taskToMove = column.tasks[0];
                const workColumn = this.columns.find(col => col.title === 'Задачи в работе');
                if (workColumn) {
                    const index = column.tasks.indexOf(taskToMove);
                    if (index !== -1) {
                        // Удаляем задачу из исходного массива без мутации
                        const newTasks = [...column.tasks];
                        newTasks.splice(index, 1);
                        // Перемещаем задачу в столбец "Задачи в работе"
                        column.tasks = newTasks;
                        workColumn.tasks.push(taskToMove);
                    }
                }
            }
        },
        moveToTesting(taskToMove, column) {
            const testingColumn = this.columns.find(col => col.title ===
                'Тестирование');
            if (testingColumn) {
                testingColumn.tasks.push(taskToMove);
            }
            column.tasks.shift();
        },
        moveToCompletedtasks(task) {
            const index = this.completedTasks.indexOf(task);
            if (index !== -1) {
                this.completedTasks.splice(index, 1);
                // Добавляем задачу в столбец "Выполненные задачи"
                this.$root.$emit('move-to-completed-tasks', task);
            }
        },
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
        handleMoveToCompletedTasks(task) {
            // Добавляем задачу в столбец "Выполненные задачи"
            this.completedTasks.push(task);
        }
    },
    mounted() {
        this.$root.$on('move-to-completed-tasks', this.handleMoveToCompletedTasks);
    }
});

Vue.filter('formatDate', function (value) {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleString(); // Пример формата вывода даты, здесь используется стандартный метод Date API для форматирования даты и времени
});