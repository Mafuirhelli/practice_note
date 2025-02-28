Vue.component('card', {
    props: ['card'],
    template:
        `<div class="card">
      <h3>{{ card.title }}</h3>
      <ul>
        <li v-for="(item, index) in card.items" :key="index">
          <input type="checkbox" :checked="item.completed" @change="handleCheckboxChange(item)"  :disabled="item.completed">
          <span :class="{ completed: item.completed }">{{ item.text }}</span>
        </li>
      </ul>
      <p v-if="card.completedAt">Завершено: {{ card.completedAt }}</p>
    </div>`,
    methods: {
        handleCheckboxChange(item) {
            if (!item.completed) {
                this.$set(item, 'completed', true); // Устанавливаем только в true
                this.$emit('update'); // Оповещаем родительский компонент о изменениях
            }
        }
    }
});

new Vue({
    el: '#app',
    data: {
        columns: [
            { id: 1, cards: [] },
            { id: 2, cards: [] },
            { id: 3, cards: [] }
        ],
        formColumnId: null,
        newCardTitle: '',
        newCardItems: ['', '', '']
    },
    created() {
        const savedData = localStorage.getItem('noteAppData');
        if (savedData) {
            this.columns = JSON.parse(savedData);
        }
    },
    methods: {
        openForm(columnId) {
            this.formColumnId = columnId;
            this.newCardTitle = '';
            this.newCardItems = ['', '', ''];
        },
        closeForm() {
            this.formColumnId = null;
        },
        addItem() {
            this.newCardItems.push('');
        },
        removeItem(index) {
            this.newCardItems.splice(index, 1);
        },
        submitForm() {
            const column = this.columns.find(col => col.id === this.formColumnId);
            if (this.newCardTitle && this.newCardItems.every(item => item.trim())) {
                column.cards.push({
                    id: Date.now(),
                    title: this.newCardTitle,
                    items: this.newCardItems.map(text => ({ text, completed: false })),
                    completedAt: null
                });
                this.saveData();
                this.closeForm();
            } else {
                alert('Заполните все поля!');
            }
        },
        updateCard() {
            this.columns.forEach(column => {
                column.cards.forEach(card => {
                    const completedCount = card.items.filter(item => item.completed).length;
                    const totalItems = card.items.length;
                    const completionPercentage = (completedCount / totalItems) * 100;
                    if (completionPercentage > 50 && column.id === 1) {
                        this.moveCard(card, 1, 2);
                    }
                    if (completionPercentage === 100) {
                        card.completedAt = new Date().toLocaleString();
                        this.moveCard(card, column.id, 3);
                    }
                });
            });
            this.saveData();
        },
        moveCard(card, fromColumnId, toColumnId) {// Метод для перемещения карточки между столбцами
            const fromColumn = this.columns.find(col => col.id === fromColumnId);// Находим исходный столбец
            const toColumn = this.columns.find(col => col.id === toColumnId);// Находим нужный столбец
            const cardIndex = fromColumn.cards.indexOf(card);// Получаем индекс карточки в исходном столбце
            if (toColumn.cards.length < (toColumnId === 2 ? 5 : Infinity)) {// Проверяем ограничения на количество карточек
                toColumn.cards.push(card);// Добавляем карточку в нужный столбец
                fromColumn.cards.splice(cardIndex, 1);// Удаляем карточку из исходного столбца
            }
        },
        saveData() {
            localStorage.setItem('noteAppData', JSON.stringify(this.columns));
        },
        isColumnBlocked(columnId) {
            if (columnId === 1) {
                const secondColumnFull = this.columns[1].cards.length >= 5;
                const firstColumnOver50 = this.columns[0].cards.some(card => {
                    const completedCount = card.items.filter(item => item.completed).length;
                    return (completedCount / card.items.length) * 100 > 50;
                });
                return secondColumnFull && firstColumnOver50;
            }
            return false;
        },
    }
});
