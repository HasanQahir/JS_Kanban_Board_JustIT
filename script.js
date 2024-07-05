import {Kanbon_Card} from "./modules/card.js";

//Store data about the selected card and give it a special class
function dragStartHandler(ev) {
    ev.dataTransfer.setData("text/id", ev.target.id);
    ev.dataTransfer.setData("text/html", ev.target.outerHTML);
    ev.currentTarget.classList.add('dragging');
}

//onDragover calls this when a dragged element is held over it
export function dragOverHandler(ev) {
    ev.preventDefault();
    ev.target.classList.add('drop');
    ev.dataTransfer.dropEffect = "move";
}

//Releasing the dragged element onto a valid target calls this
export function dropHandler(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text/id");
    let target = ev.target;
    const mousePos = ev.clientY;
    

    while (target) {
        let location;

        //Gets the centre of all cards and checks where to place a new one
        for (const elem of target.querySelectorAll('.card')) {
            const cardPos = elem.offsetTop + (elem.offsetHeight / 2);
            if (cardPos > mousePos) {
                location = elem;
                break;
            }
        }

        //Error mitigation - sometimes a card is the target instead of the column
        //Ignores card targets and moves up DOM tree as necessary
        if (target.classList.contains("column")){
            target.insertBefore(document.getElementById(data), location);
            document.querySelectorAll('.drop').forEach( (elem) => {
                elem.classList.remove('drop');
            });
            return;
        }
        target = target.parentNode
    }
}

//Revert the style of the dragged element
function dragEnd(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('dragging');
}

// Convoluted way to get ID of card and open edit boxes
function editCardText(ev) {
    const btn = ev.target;
    const ID = String(btn.id).slice(11);
    const card = document.getElementById(`card${ID}`);
    const titleBox = document.getElementById('editTitleBox');
    const taskBox = document.getElementById('editTaskBox');
    currentEditCard = card.id;

    //Place existing contents into text areas
    titleBox.value = card.querySelector('h3').innerText;
    taskBox.value = card.querySelector('p').innerText;
    document.querySelector('.editArea').style.display = 'flex';
    
}

//Places the contents of BOTH text areas into the selected card
function changeCardText() {
    const boxes = document.getElementsByClassName('editBoxes');
    const card = document.getElementById(currentEditCard);

    //avoids errors if currentEditCard is null - although this should not occur.
    if (card) {
        const titleElem = card.querySelector('h3');
        const taskElem = card.querySelector('p');
        titleElem.innerText = boxes.editTitleBox.value;
        taskElem.innerText = boxes.editTaskBox.value;
    }
}

//Seperated card's head/title creation to reduce length
//Also appends new card to the list of card IDs
function createCardHead(title, cardID) {
    const head = document.createElement('div');
    head.classList.add('cardHead');
    const editButton = document.createElement('span');
    editButton.classList.add('material-symbols-outlined');
    editButton.addEventListener('click', editCardText);

    let newIDs = cardIDs;
    newIDs.card = cardID;
    newIDs.editBtn = editButton.setAttribute('id', `cardEditBtn${listCardIDs.length+1}`);
    listCardIDs.push(newIDs);

    head.append(document.createElement('h3'), editButton);
    head.querySelector('h3').innerText = title;
    head.querySelector('span').innerHTML = 'edit';    

    return head;
}

//Returns a new card to be entered into a column
function createNewCard(ev, title = "Title", task = "Description of your task...") {
    const newCard = document.createElement('article')
    const cardNum = listCardIDs.length + 1;
    newCard.draggable = true;
    newCard.id = `card${cardNum}`
    newCard.classList.add('card');
    newCard.addEventListener('dragstart', dragStartHandler)
    newCard.addEventListener('dragend', dragEnd);

    const head = createCardHead(title, newCard.id);
    const p = document.createElement('p');
    p.innerText = task
    newCard.append(head, p);

    return newCard;
}

//Appends new card to the target column, immediately opens it in edit area
function insertNewCard(ev) {
    const newGenCard = createNewCard(ev);
    const title = newGenCard.querySelector('h3').innerText;
    const titleBox = document.getElementById('editTitleBox');
    const task = newGenCard.querySelector('p').innerText;
    const taskBox = document.getElementById('editTaskBox');

    const col = ev.currentTarget.parentNode.parentNode;
    
    col.append(newGenCard);
    currentEditCard = newGenCard.id;

    titleBox.value = title;
    taskBox.value = task;
    document.querySelector('.editArea').style.display = 'flex';
}

function deleteCard() {
    const currCard = document.getElementById(currentEditCard);
    currCard.remove();
    currentEditCard = null;
    document.querySelector('.editArea').style.display = 'none';
}

//Object for conveniently storing the IDs of everything
const cardIDs = {
    card: String,
    editBtn: String,
}

let listCardIDs = [cardIDs];
let currentEditCard = null;

// ALL cards and columns require these classes and listeners
// This initialises the pre-created elements so they may function
window.addEventListener("DOMContentLoaded", function () {
    let cards = [];
    const columns = document.getElementsByClassName('column');

    if (this.window.localStorage.getItem('cardData')) {
        const storedCards = JSON.parse(this.window.localStorage.getItem('cardData'))
        storedCards.forEach( (elem) => {
            let kanbonElem = new Kanbon_Card(elem.title, elem.task, elem.columnType, elem.columPos)
            cards.push(kanbonElem.convertToDOMObject())
        });
        console.log('Local Storage', cards);
    }
    
    cards = document.getElementsByClassName('card');
    let storeData = []

    //Functionality for cards
    for (let i = 0; i < cards.length; i++) {
        const element = cards[i];
        const editButton = element.querySelector( '.material-symbols-outlined');
        let IDs = cardIDs;
        IDs.card = element.setAttribute('id', `card${i+1}`);
        IDs.editBtn = editButton.setAttribute('id', `cardEditBtn${i+1}`)
        listCardIDs.push(IDs);

        element.addEventListener("dragstart", dragStartHandler);
        element.addEventListener("dragend", dragEnd);
        editButton.addEventListener('click', editCardText);

        let col;
        if (element.classList.item(1) === 'toDo') {
            col = 'ToDo';
        } else if (element.classList.item(1) === 'inProgress') {
            col = 'InProgress';
        } else if (element.classList.item(1) === 'complete') {
            col = 'Complete';
        }

        let cardObj = new Kanbon_Card(element.querySelector('h3').innerText, element.querySelector('p').innerText, col, i % 3);
        storeData.push(cardObj);
        
    }
    let cardJSONdata = JSON.stringify(storeData);
    this.window.localStorage.setItem('cardData', cardJSONdata);


    //Functionality for columns
    for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        col.addEventListener('dragleave', function dragLeave(ev) {
            ev.currentTarget.classList.remove('drop');
        });
        col.querySelector('.newCard').addEventListener('click', insertNewCard)
    }

    //Functionality for submit/cancel editing buttons
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteBtn = this.document.getElementById('deleteBtn');

    submitBtn.addEventListener('click', changeCardText);
    cancelBtn.addEventListener('click', () => {
        document.querySelector('.editArea').style.display = 'none';
        currentEditCard = "";
    });
    deleteBtn.addEventListener('click', deleteCard);
});

