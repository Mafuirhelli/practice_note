Vue.component('card', {
    props: ['card'],
    template: `
        <div class="card">
            <h3>{{ card.title }}</h3>
            <ul>
                <li v-for="(item, index) in card.items" :key="index">
                    <input type="checkbox" :checked="item.completed" @change="handleCheckboxChange(item)"  :disabled="item.completed">
                    <span :class="{ completed: item.completed }">{{ item.text }}</span>
                </li>
            </ul>
            <p v-if="card.completedAt">Завершено: {{ card.completedAt }}</p>
            <button @click="$emit('delete', card.id)">Удалить</button> <!-- Кнопка для удаления карточки -->
        </div>
    `,
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
        newCardItems: ['', '', ''],
        searchQuery: '' // Добавлено поле для поиска карточек
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
        moveCard(card, fromColumnId, toColumnId) {
            const fromColumn = this.columns.find(col => col.id === fromColumnId);
            const toColumn = this.columns.find(col => col.id === toColumnId);
            const cardIndex = fromColumn.cards.indexOf(card);
            if (toColumn.cards.length < (toColumnId === 2 ? 5 : Infinity)) {
                toColumn.cards.push(card);
                fromColumn.cards.splice(cardIndex, 1);
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
        filteredCards(cards) { // Метод для фильтрации карточек по заголовкам
            if (!this.searchQuery) return cards; // Если нет запроса на поиск, возвращаем все карточки
            const query = this.searchQuery.toLowerCase();
            return cards.filter(card => card.title.toLowerCase().includes(query)); // Фильтруем карточки
        },
        deleteCard(cardId) { // Метод для удаления карточек
            this.columns.forEach(column => {
                const cardIndex = column.cards.findIndex(card => card.id === cardId);
                if (cardIndex !== -1) {
                    column.cards.splice(cardIndex, 1); // Удаляем карточку
                }
            });
            this.saveData(); // Сохраняем изменения
        },
    }
});