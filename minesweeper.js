let tablero = [];
let rows = 8;
let columns = 8;

let minesCount = 10;
let flagsCount = minesCount;
let minesLocation = []; // "2-2", "3-4", "2-1"

let tilesClicked = 0; //goal to click all tiles except the ones containing mines
let flagbool =false;

let gameOver = false;

window.onload = function() {
    startGame();
}

const audio_perder = new Audio("perder-incorrecto-no-valido.mp3");
const audio_banderita = new Audio("banderita.mp3");

function setMines() {
    // minesLocation.push("2-2");
    // minesLocation.push("2-3");
    // minesLocation.push("5-6");
    // minesLocation.push("3-4");
    // minesLocation.push("1-1");

    let minesLeft = minesCount;
    while (minesLeft > 0) { 
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = r.toString() + "-" + c.toString();

        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft -= 1;
        }
    }
}


function startGame() {
    document.getElementById("flags-count").innerText = flagsCount;
    setMines();

    //populate our tablero
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            //<div id="0-0"></div>
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            tile.addEventListener("contextmenu", RightClick);
            document.getElementById("tablero").append(tile);
            row.push(tile);
        }
        tablero.push(row);
    }

    console.log(tablero);
}


function RightClick(){
    if (gameOver) {
        return;
    }
    event.preventDefault();
    let tile = this;
    if (tile.classList.contains("tile-clicked")) {
        return;
    }
    if (tile.classList.contains("tile-flagged")) {
        tile.classList.remove("tile-flagged");
        tile.innerText = "";
        flagsCount += 1;
        if (minesLocation.includes(tile.id)) {
            minesCount += 1;
        }
        document.getElementById("flags-count").innerText = flagsCount;
    }
    else {
        tile.classList.add("tile-flagged");
        tile.innerText = "🚩";
        audio_banderita.play();
        flagsCount -= 1;

        if (minesLocation.includes(tile.id)) {
            minesCount -= 1;
        }
        document.getElementById("flags-count").innerText =flagsCount;
    }
    if (flagsCount == 0) {
        document.getElementById("flags-count").innerText = "No flags left";
        if (minesCount == 0) {
            document.getElementById("mines-count").innerText = "Congratulations! You won!";
            gameOver = true;
        }
    }
}

function clickTile() {
    if (gameOver || this.classList.contains("tile-clicked") || this.classList.contains("tile-flagged")){
        return;
    }

    let tile = this;

    if (minesLocation.includes(tile.id)) {
        // alert("GAME OVER");
        gameOver = true;
        revealMines();
        return;
    }


    let coords = tile.id.split("-"); // "0-0" -> ["0", "0"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkMine(r, c);

}

function revealMines() {
    for (let r= 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = tablero[r][c];
            if (minesLocation.includes(tile.id)) {
                tile.innerText = "💣";
                tile.style.backgroundColor = "red";
                audio_perder.play();
            }
        }
    }
}

function checkMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }
    if (tablero[r][c].classList.contains("tile-clicked")) {
        return;
    }

    tablero[r][c].classList.add("tile-clicked");
    tilesClicked += 1;

    let minesFound = 0;

    //top 3
    minesFound += checkTile(r-1, c-1);      //top left
    minesFound += checkTile(r-1, c);        //top 
    minesFound += checkTile(r-1, c+1);      //top right

    //left and right
    minesFound += checkTile(r, c-1);        //left
    minesFound += checkTile(r, c+1);        //right

    //bottom 3
    minesFound += checkTile(r+1, c-1);      //bottom left
    minesFound += checkTile(r+1, c);        //bottom 
    minesFound += checkTile(r+1, c+1);      //bottom right

    if (minesFound > 0) {
        tablero[r][c].innerText = minesFound;
        tablero[r][c].classList.add("x" + minesFound.toString());
    }
    else {
        tablero[r][c].innerText = "";
        
        //top 3
        checkMine(r-1, c-1);    //top left
        checkMine(r-1, c);      //top
        checkMine(r-1, c+1);    //top right

        //left and right
        checkMine(r, c-1);      //left
        checkMine(r, c+1);      //right

        //bottom 3
        checkMine(r+1, c-1);    //bottom left
        checkMine(r+1, c);      //bottom
        checkMine(r+1, c+1);    //bottom right
    }

    if (tilesClicked == rows * columns - minesCount) {
        document.getElementById("mines-count").innerText = "Cleared";
        gameOver = true;
    }
}

function checkTile(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return 0;
    }
    if (minesLocation.includes(r.toString() + "-" + c.toString())) {
        return 1;
    }
    return 0;
}
