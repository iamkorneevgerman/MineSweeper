// Получаем элементы из HTML
const grid = document.getElementById("grid"); // Сетка для игры
const difficultySelect = document.getElementById("difficulty"); // Выбор сложности
const startButton = document.getElementById("startButton"); // Кнопка для начала игры

let lockGame = false; // Переменная для блокировки игры (true, если игра завершена)
let minesLeft = 10; // Количество оставшихся мин
let minesCount = 0; // Счетчик установленных флажков
let timer; // Таймер для отслеживания времени
let seconds = 0; // Количество секунд, прошедших с начала игры
const testMode = false; // Режим отладки (для отображения мин)
const GRID_SIZE = 10; // Размер сетки (10x10)

// Обработчик события для кнопки "Старт"
startButton.addEventListener("click", startGame);

// Инициализация игры с выбором сложности
function startGame() {
    // Определяем количество мин в зависимости от выбранной сложности
    let difficulty = difficultySelect.value;
    minesLeft = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 40;

    // Сбрасываем таймер и счетчики
    clearInterval(timer); // Очищаем предыдущий таймер
    seconds = 0; // Сбрасываем секунды
    minesCount = 0; // Сбрасываем счетчик флажков
    generateGrid(); // Генерируем сетку
    startTimer(); // Запускаем таймер
    updateMinesLeft(); // Обновляем отображение оставшихся мин
}

// Таймер
function startTimer() {
    // Устанавливаем интервал для обновления времени каждую секунду
    timer = setInterval(() => {
        seconds++; // Увеличиваем секунды на 1
        document.getElementById("timer").innerHTML = `Time: ${seconds}s`; // Обновляем отображение времени
    }, 1000);
}

// Остановка таймера
function stopTimer() {
    clearInterval(timer); // Очищаем таймер
}

// Генерация сетки
function generateGrid() {
    lockGame = false; // Разрешаем игру
    grid.innerHTML = ""; // Очищаем предыдущую сетку

    // Создаем 10 строк сетки
    for (let i = 0; i < GRID_SIZE; i++) {
        let row = grid.insertRow(i); // Создаем строку
        // Создаем 10 ячеек в каждой строке
        for (let j = 0; j < GRID_SIZE; j++) {
            let cell = row.insertCell(j); // Создаем ячейку
            // Устанавливаем обработчики событий для клика и правого клика
            cell.onclick = function () { init(this); }; // Обработка клика на ячейке
            cell.oncontextmenu = function (e) { e.preventDefault(); placeFlag(this); }; // Обработка правого клика
            // Устанавливаем атрибуты ячейки
            cell.setAttribute("mine", "false"); // Нет мины
            cell.setAttribute("flagged", "false"); // Нет флажка
        }
    }
    generateMines(); // Генерируем мины
    updateMinesLeft(); // Обновляем отображение оставшихся мин
}

// Генерация мин
function generateMines() {
    const cells = []; // Массив для хранения всех ячеек

    // Заполняем массив всеми ячейками
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            cells.push({ row: i, col: j }); // Добавляем координаты ячейки
        }
    }
    cells.sort(() => Math.random() - 0.5); // Перемешиваем массив ячеек

    let minesPlaced = 0; // Счетчик установленных мин
    // Устанавливаем мины
    while (minesPlaced < minesLeft) {
        const { row, col } = cells[minesPlaced]; // Берем координаты ячейки
        const cell = grid.rows[row].cells[col]; // Получаем ячейку по координатам
        cell.setAttribute("mine", "true"); // Устанавливаем атрибут мины
        if (testMode) cell.innerHTML = "X"; // Для отладки, отображаем мину
        minesPlaced++; // Увеличиваем счетчик установленных мин
    }
}

// Установка флажка
function placeFlag(cell) {
    // Проверяем, можно ли установить флажок
    if (lockGame || cell.classList.contains("active")) return; // Если игра заблокирована или ячейка уже активна, выходим
    // Устанавливаем флажок
    if (!cell.classList.contains("flagged")) {
        cell.classList.add("flagged"); // Добавляем класс флажка
        cell.setAttribute("flagged", "true"); // Устанавливаем атрибут флажка
        minesCount++; // Увеличиваем счетчик флажков
    } else {
        cell.classList.remove("flagged"); // Убираем флажок
        cell.setAttribute("flagged", "false"); // Устанавливаем атрибут флажка в false
        minesCount--; // Уменьшаем счетчик флажков
    }
    updateMinesLeft(); // Обновляем отображение оставшихся мин
}

// Обновление количества оставшихся мин
function updateMinesLeft() {
    document.getElementById("minesLeft").innerHTML = `Mines Left: ${minesLeft - minesCount}`; // Обновляем количество оставшихся мин
}

// Проверка, является ли ячейка миной
function isMine(cell) {
    return cell.getAttribute("mine") === "true"; // Возвращаем true, если ячейка содержит мину
}

// Инициализация ячейки
function init(cell) {
    // Проверяем, закончена ли игра
    if (lockGame || cell.classList.contains("active")) return; // Если игра заблокирована или ячейка уже активна, выходим

    // Проверяем, кликнули ли на мину
    if (isMine(cell)) {
        revealMines(); // Раскрываем все мины
        alert("Game Over! You clicked on a mine."); // Уведомление о проигрыше
        lockGame = true; // Блокируем игру
        return; // Выходим
    }

    cell.className = "active"; // Помечаем ячейку как активную
    const mineCount = countAdjacentMines(cell); // Подсчитываем количество соседних мин
    cell.setAttribute("data-mine-count", mineCount); // Устанавливаем атрибут с количеством мин
    cell.innerHTML = mineCount > 0 ? mineCount : ""; // Показываем число, если оно больше 0

    // Если вокруг нет мин, раскрываем соседние ячейки
    if (mineCount === 0) {
        revealAdjacentCells(cell); // Раскрываем соседние ячейки
    }

    checkGameComplete(); // Проверяем, закончена ли игра
}

// Подсчет мин вокруг ячейки
function countAdjacentMines(cell) {
    let mineCount = 0; // Счетчик мин
    const adjacentCells = getAdjacentCells(cell); // Получаем соседние ячейки
    adjacentCells.forEach(adjCell => {
        if (isMine(adjCell)) {
            mineCount++; // Увеличиваем счетчик, если ячейка является миной
        }
    });
    return mineCount; // Возвращаем количество мин
}

// Получение соседних ячеек
function getAdjacentCells(cell) {
    const cells = []; // Массив для хранения соседних ячеек
    let cellRow = cell.parentNode.rowIndex; // Получаем индекс строки ячейки
    let cellCol = cell.cellIndex; // Получаем индекс колонки ячейки

    // Получаем ячейки, которые находятся вокруг данной ячейки
    for (let i = Math.max(cellRow - 1, 0); i <= Math.min(cellRow + 1, GRID_SIZE - 1); i++) {
        for (let j = Math.max(cellCol - 1, 0); j <= Math.min(cellCol + 1, GRID_SIZE - 1); j++) {
            cells.push(grid.rows[i].cells[j]); // Добавляем соседнюю ячейку в массив
        }
    }
    return cells; // Возвращаем массив соседних ячеек
}

// Открытие соседних ячеек, если вокруг нет мин
function revealAdjacentCells(cell) {
    const adjacentCells = getAdjacentCells(cell); // Получаем соседние ячейки
    adjacentCells.forEach(adjCell => {
        if (adjCell.innerHTML === "" && !adjCell.classList.contains("active")) {
            init(adjCell); // Рекурсивно инициализируем ячейку
        }
    });
}

// Раскрытие всех мин при проигрыше
function revealMines() {
    const allCells = document.querySelectorAll("#grid td"); // Получаем все ячейки в сетке
    allCells.forEach(cell => {
        if (isMine(cell)) {
            cell.classList.add("mine"); // Помечаем ячейку как мину
        }
    });
}

// Проверка окончания игры
function checkGameComplete() {
    let complete = true; // Предполагаем, что игра завершена
    const allCells = document.querySelectorAll("#grid td"); // Получаем все ячейки
    allCells.forEach(cell => {
        // Проверяем, есть ли неактивные ячейки без мин
        if (cell.getAttribute("mine") === "false" && !cell.classList.contains("active")) {
            complete = false; // Если нашли такую ячейку, игра не завершена
        }
    });
    // Если игра завершена
    if (complete) {
        stopTimer(); // Останавливаем таймер
        lockGame = true; // Блокируем игру
        alert("Congratulations! You've won!"); // Уведомление о победе
    }
}