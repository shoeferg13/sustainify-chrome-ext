// Citation: https://www.youtube.com/watch?v=wv7pvH1O5Ho
let drag_start_idx;
const list_items = [];
let user_preferences = [];
handleRankingOrder();

function handleRankingOrder() {
    const draggables = document.querySelectorAll('.draggable');
    const sustainability_practices = document.querySelectorAll('.draggable-list li');
    sustainability_practices.forEach(item => list_items.push(item)); 

    draggables.forEach(d => { d.addEventListener('dragstart', dragStart); })

    sustainability_practices.forEach(item => {
        item.addEventListener('dragover', event => {
            event.preventDefault(); 
            console.log('drag over');
        });
        item.addEventListener('drop', dragDrop);
        item.addEventListener('dragenter', dragEnter);
        item.addEventListener('dragleave', dragLeave);
    });
}

function getUserPreferences() {
    user_preferences.length = 0;
    const practices_ranking = document.querySelectorAll('.sustainable-practice');
    practices_ranking.forEach(elem => user_preferences.push(elem.textContent));
    sessionStorage.setItem('user_preferences', JSON.stringify(user_preferences));
    console.log(user_preferences);
    return user_preferences;
}

function dragStart() {
    drag_start_idx = +this.closest('li').getAttribute('value')-1;
    console.log('start');
}

function dragEnter() {
    this.classList.add('over');
    console.log('enter');
}

function dragLeave() {
    this.classList.remove('over');
    console.log('leave');
}

function dragDrop() {
    const drag_end_idx = +this.getAttribute('value')-1;
    swap(drag_start_idx, drag_end_idx);
    this.classList.remove('over');
    getUserPreferences();
}

function swap(start_idx, end_idx) {
    const first = list_items[start_idx].querySelector('.draggable');
    const second = list_items[end_idx].querySelector('.draggable');
    list_items[end_idx].appendChild(first);
    list_items[start_idx].appendChild(second);
}
