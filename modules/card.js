export class Kanbon_Card {

    constructor(title = "", task = "", column_Type = "", column_Position = -1) {

        this.title = title;
        this.task = task;
        this.columnType = column_Type;
        this.columnPos = column_Position;
    }

    convertToDOMObject() {
        const newDOMCard = document.createElement('article')
        const head = document.createElement('div');
        const h3 = document.createElement('h3');
        const editButton = document.createElement('span');
        const p = document.createElement('p');

        h3.innerText = this.title;
        editButton.innerHTML = 'edit';
        p.innerText = this.task

        head.append(h3, editButton);
        newDOMCard.append(head, p);

        return newDOMCard;
    }
}
