const ROWS_PER_PAGE = 10;
const START_ITEM_INDEX_OF_DATA = 0;
const START_PAGE = 1;

// Получаем данные из data.json и передаем в функции
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        addRows(ROWS_PER_PAGE);
        fillTable(data, START_ITEM_INDEX_OF_DATA);
        showForm(data);
        submitForm(data);
        changePage(data);
    });

// Добавляем пустые строки для заполнения их данными из data.json (согласно количеству строк на странице)

const tBody = document.querySelector('tbody');

function addRows(rowsPerPage) {
    for (let i = 0; i < rowsPerPage; i += 1) {
        const tRow = document.createElement('tr');
        tRow.className = 'tRow';
        tBody.appendChild(tRow);
    }
}

//Заполняем строки таблицы созданные выше

let rows;

function fillTable(data, start) {
    let currentPerson = start;

    rows = [...tBody.querySelectorAll("tr")];
    rows.forEach((item) => {
        item.appendChild(document.createElement('td')).innerHTML = data[currentPerson].name.firstName;
        item.appendChild(document.createElement('td')).innerHTML = data[currentPerson].name.lastName;
        item.appendChild(document.createElement('td')).innerHTML = data[currentPerson].about;
        item.appendChild(document.createElement('td')).innerHTML = data[currentPerson].eyeColor;

        //заполнение цветом ячейки eyeColor
        item.lastElementChild.style.background = `${data[currentPerson].eyeColor}`;
        item.lastElementChild.style.color = `${data[currentPerson].eyeColor}`;

        //сохраняем id элемента для последующего редактирования
        item.setAttribute('id', data[currentPerson].id);

        currentPerson += 1;
    });

    const tDataItems = [...document.querySelectorAll('td')];
    tDataItems.forEach(item => item.className = 'tData');

}

// Удаление строк

function deleteRows() {
    rows.forEach(item => {
        while (item.firstChild) {
            item.removeChild(item.firstChild);
        }
    })
}


// Пагинация (постраничный вывод данных)

const pagination = document.querySelector('#pagination');
let items = [];
let page = START_PAGE;

function changePage(data) {
    let active;
    let countOfItems = Math.ceil(data.length / ROWS_PER_PAGE);
    for (let i = 1; i <= countOfItems; i++) {
        let li = document.createElement('li');
        li.innerHTML = i;
        if (i === 1) {
            li.classList.add('active');
            active = li
        }
        pagination.appendChild(li);
        items.push(li);
    }
    for (let item of items) {

        item.addEventListener('click', () => {
            //Убираем сортировку при переходе по страницам
            document.querySelectorAll('.tTitle').forEach(title => title.classList.remove("sort-max", "sort-min"));
            //добавление класса active на активный элемент пагинации
            if (active) {
                active.classList.remove('active');
            }
            item.classList.add('active');
            active = item;
            deleteRows();
            page = (item.innerHTML - 1) * 10;

            fillTable(data, page)

        });
    }
}



// Получаем данные из json по id

function getObjectById(jsonObj, id) {
    return jsonObj.filter(item => {
        return (item['id'] === id);
    })[0];
}

// Показывает форму для редактирования

const formContainer = document.querySelector('.form-container');
const editName = document.querySelector('.edit_name');
const editSurname = document.querySelector('.edit_surname');
const editAbout = document.querySelector('.edit_about');
const editColor = document.querySelector('.edit_color');

let rowId;

function showForm(data) {
    rows.forEach(item => {
        item.addEventListener('click', () => {
            //находим элемент по id
            rowId = getObjectById(data, item.id);

            formContainer.classList.remove('hidden');


            editName.value = getObjectById(data, item.id).name.firstName;
            editSurname.value = getObjectById(data, item.id).name.lastName;
            editAbout.value = getObjectById(data, item.id).about;
            editColor.value = getObjectById(data, item.id).eyeColor;

        });
    });

    function closeForm(){
        const closeButton = document.querySelector('.form__exit');

        closeButton.addEventListener('click', () => {
            formContainer.classList.add('hidden');
        })
    }

    closeForm();
}

// Сохраняет изменения из формы

function submitForm(data) {
    const saveButton = document.querySelector('.form__submit');

    saveButton.addEventListener('click', () => {
        //передаем данные, очищаем поля и скрываем форму
        if (editName.value) {
            rowId.name.firstName = editName.value;
            editName.value = '';
            formContainer.classList.add('hidden');
        }

        if (editSurname.value) {
            rowId.name.lastName = editSurname.value;
            editSurname.value = '';
            formContainer.classList.add('hidden');
        }

        if (editAbout.value) {
            rowId.about = editAbout.value;
            editAbout.value = '';
            formContainer.classList.add('hidden');
        }

        if (editColor.value) {
            rowId.eyeColor = editColor.value;
            editColor.value = '';
            formContainer.classList.add('hidden');
        }

        //Отчищаем таблицу

        deleteRows();

        //Отрисовываем заново в зависимости от актуального номера страницы

        fillTable(data, page);

    });
}



// Сортировка строк

const table = document.querySelector('table');
const titles = [...document.querySelectorAll('.tTitle')];

function sortColumn(table, column, max = true) {
    const direction = max ? 1 : -1;
    const rowsArr = Array.from(rows);

    const sortedRows = rowsArr.sort((a, b) => {
        const aColumnText = a.querySelector(`td:nth-of-type(${column + 1})`).textContent.toLowerCase();
        const bColumnText = b.querySelector(`td:nth-of-type(${column + 1})`).textContent.toLowerCase();

        return aColumnText > bColumnText ? (direction) : (-direction);
    });

    //Удаляем несортированные строки

    while (tBody.firstChild) {
        tBody.removeChild(tBody.firstChild);
    }

    //Заполняем отсортированными строками

    tBody.append(...sortedRows);

    //Применяет стили для заголовка столбца

    titles.forEach(title => title.classList.remove("sort-max", "sort-min"));
    table.querySelector(`th:nth-child(${column + 1})`).classList.toggle("sort-max", max);
    table.querySelector(`th:nth-child(${column + 1})`).classList.toggle("sort-min", !max);
}
//добавляем слушатель клика на название колонки
titles.forEach(title => {
    title.addEventListener("click", () => {
        const titleIndex = titles.indexOf(title);
        const isMax = title.classList.contains("sort-max");

        sortColumn(table, titleIndex, !isMax);
    });
});