Vue.component('card', {
    props: ['card'],
    template: `
    <div class="card">
      <h3>{{ card.title }}</h3>
      <ul>
        <li v-for="(item, index) in card.items" :key="index">
          <input type="checkbox" v-model="item.completed">
          <span :class="{ completed: item.completed }">{{ item.text }}</span>
        </li>
      </ul>
    </div>
  `
});

new Vue({
    el: '#app',
    data: {
        columns: [
            { id: 1, cards: [] },
            { id: 2, cards: [] },
            { id: 3, cards: [] }
        ]
    },
    methods: {
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



    }
});
