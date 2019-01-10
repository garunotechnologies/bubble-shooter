socket.on('start game', function (player) {
    const socketId = socket.id;

    let room = {
        id: _uuidv4,
        tableNumber: tableNumber,
        players: [],
        maxPlayers: 2
    };

    let isRoom = rooms.find(r => r.id === _uuidv4);

    if (isRoom !== undefined) {
        if (isRoom.players.length < room.maxPlayers) {
            isRoom.players.push(socketId);
            console.log(isRoom);
            socket.join(_uuidv4);
            io.sockets.in(_uuidv4).emit('table', isRoom);
        } else {
            _uuidv4 = uuidv4();
            room.id = _uuidv4;

            tableNumber = helper.getRandomInRange();
            room.tableNumber = tableNumber;

            room.players = [];
            room.players.push(socketId);
            socket.join(_uuidv4);
            rooms.push(room);

            socket.emit('table', room);
        }
    } else {
        room.players.push(socketId);
        socket.join(_uuidv4);
        rooms.push(room);
        socket.emit('table', room);
    }
});

// socket.on('player number', function (room) {
//     _room = room;
//     let idRoom = room.id;
//
//     //Increase roomno 2 clients are present in a room.
//     if(io.nsps['/'].adapter.rooms["room-"+idRoom] && io.nsps['/'].adapter.rooms["room-"+idRoom].length > 1) idRoom++;
//     socket.join("room-"+idRoom);
//
//     //Send this event to everyone in the room.
//     io.sockets.in("room-"+idRoom).emit('connectToRoom', room);
// });
//

_room = room;

console.log(room);
console.log("Мой id - " + socketId + '\n' + "Мой room id - " + room.id + '\n' + "Номер стола - " + room.tableNumber + '\n' + "Имя пользователя - " + room.names + '\n' + "Кол-во пользователей - " + room.players.length + '\n');

const $players = Object.keys(room.players);
const playerNumber = players.indexOf(socketId);
//nicknameMe = players[playerNumber]
//nicknameOpponent

tableNumber.text(room.tableNumber);


if (me === null) {
    if (playerNumber !== -1) {
        tileContainer.append('<div id="player_' + playerNumber + '" class="point" data-name="'+ nicknameMe +'" data-id="' + players[playerNumber].positionCell + '"><span></span></div>');
        me = players[playerNumber];
    }
}

if ($players.length < 2) {
    status.text('Ожидание соперника');
} else {
    players.map(player => {
        if (player.number !== playerNumber) {
            tileContainer.append('<div id="player_' + player.number + '" class="point opponent" data-name="'+ room.names[player.number] +'" data-id="' + player.positionCell + '"><span></span></div>');

            opponent = player;
            _opponentPositionCell = player.positionCell;
        }
    });

    if (playerNumber === 0) {
        status.text('Ваш ход!');
        $('#player_' + playerNumber).empty().append(pointBlock);
    } else {
        status.text('Ход соперника');
    }
}



if (dataIdCell !== newDataId) {
    $this.parent().attr('data-id', newDataId);
    $this.parent().data('id', newDataId);

    socket.emit('turn', {newDataId: newDataId, room: _room});

    $('#player_' + opponent).empty().append('<span></span>');
    $('#player_' + me).empty().append('<span></span>');

    // Фиксируем свой ход
    me.positionCell = newDataId;

    if (_opponentTurn !== null) {
        $('#player_' + opponent.number).attr('data-id', _opponentTurn).data('id', _opponentTurn);
    }

    // Если ходы игроков совпали определяем победителя

    if (opponent.positionCell === me.positionCell) {
        setTimeout(function () {
            showPopup('.popup', '.popupGameWin', '.btnPlayAgain', 300, 'inline-block');
            status.hide();
            tileContainer.empty();
            socket.emit('finish game');
        }, 1000);
    } else {
        status.text('Ход соперника.');
    }
}

if ($players.length === 1) {
    $('.popup').showPopup('.popupPlayerSearch', '.btnPlayAgain', 500, 'inline-block');

    console.log('--------------');
    console.log((me === null) ? opponent.number :  me.number);
    console.log('--------------');

    playerSearch.empty();
    playerSearch.append('<div class="half player_' + ((me === null) ? opponent.number :  me.number) + '"><div class="avatarBlock"></div><div class="name">' + ((me === null) ? opponent.name :  me.name) + '</div></div>');
    playerSearch.append('<div class="half player_2 is-find"><div class="avatarBlock"></div><div class="name">???</div></div>');
}

if ($players.length === 2) {

    console.log('--------------');
    console.log((me === null) ? opponent.number :  me.number);
    console.log('--------------');

    $('.popup').showPopup('.popupPlayerSearch', '.btnPlayAgain', 500, 'inline-block');
    playerSearch.empty();
    playerSearch.append('<div class="half player_' + me.number + '"><div class="avatarBlock"></div><div class="name">' + me.name + '</div></div>');
    playerSearch.append('<div class="half player_' + opponent.number + '"><div class="avatarBlock"></div><div class="name">' + opponent.name + '</div></div>');
}