Vue.component('card', {
    props: ['card'],
    template:
        `<div class="card">
      <h3>{{ card.title }}</h3>
      <ul>
        <li v-for="(item, index) in card.items" :key="index">
          <input type="checkbox" v-model="item.completed">
          <span :class="{ completed: item.completed }">{{ item.text }}</span>
        </li>
      </ul>
    </div>`,
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
    methods: {
        openForm(columnId) {
            this.formColumnId = columnId;
            this.newCardTitle = '';
            this.newCardItems = ['', '', ''];
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
        saveData() {
            localStorage.setItem('noteAppData', JSON.stringify(this.columns));
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
        closeForm() {
            this.formColumnId = null;
        },
        addItem() {
            this.newCardItems.push('');
        },
        removeItem(index) {
            this.newCardItems.splice(index, 1);
        },
    }
});
