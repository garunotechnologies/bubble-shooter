// SHOP POPUP
$.fn.showPopupClick = function(parent, children, close, speed, func) {
    $(children).find(close).on('click', function () {
        $(parent).fadeOut(speed).removeClass('show');
        $(children).fadeOut(speed);
    });

    return this.on('click', function () {
        (func) ? func() : '';
        $(parent).fadeIn(speed).addClass('show');
        $(children).fadeIn(speed).css("display", "inline-block");
        $('body').addClass('hidden');
    });
};

function showPopup(parent, children, close, speed, display) {
    if(display == '') {
        $(children).fadeIn(speed);
    } else {
        $(children).fadeIn(speed).css("display",display);
    }
    $(parent).fadeIn(speed).addClass('show');
    $('body').addClass('hidden');
    var closePopup = $(children).find(close);

    $(closePopup).on('click', function() {
        $('body').removeClass('hidden');
        $(parent).fadeOut(speed).removeClass('show');
        $(children).fadeOut(speed);
    });
}

$(document).ready(function() {
    let socket = io(); // Инициализируем сокет
    let socketConnected = false;

    let btnStartGame = $('.btnStartGame');
    let btnPlayAgain = $('.btnPlayAgain');
    let tileContainer = $('.tile-container');
    let status = $('.status');
    let pointBlock = '<span></span><span></span><span></span>' +
        '<span></span><span></span><span></span>' +
        '<span></span><span></span><span></span>';
    let pointBlockOpponent = '<span></span><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b>';

    let players = [
        {
            id: 'blue',
            number: 0,
            name: 'Синий игрок',
            color: 'blue',
            positionCell: 1
        },
        {
            id: 'red',
            number: 1,
            name: 'Красный игрок',
            color: 'red',
            positionCell: 16
        }
    ];

    let me = null;
    let opponent = null;
    let _opponentPositionCell = null;
    let _opponentTurn = null;
    let _room = null;

    //Подсчет количества подключенных клиентов
    socket.on('broadcast', function (data) {
        $('.countClients').text(data.description);
    });

    socket.on('disconnect', function () {
        socketConnected = false;
        console.log('Disconnected!');
    });

    socket.on('connect', function () {
        let socketId = socket.id;
        console.log('Connected! ID: ' + socketId);

        // Начинаем игру после нажатия кнопки
        btnStartGame.on('click', function () {
            socket.emit('start game');
            status.show();
            btnStartGame.hide();
        });

        btnPlayAgain.on('click', function () {
            status.show();
            tileContainer.empty();
            btnStartGame.hide();

            me = null;
            opponent = null;
            _opponentPositionCell = null;
            _opponentTurn = null;
            _room = null;

            players[0]['positionCell'] = 1;
            players[1]['positionCell'] = 16;
            socket.emit('start game');
        });

        socket.on('table', function (room) {
            _room = room;
            console.log("Мой id - " + socketId + '\n' + "Мой room id - " + room.id + '\n' + "Номер стола - " + room.tableNumber + '\n' + "Кол-во пользователей - " + room.players.length + '\n');

            $('.tableNumber').text(room.tableNumber);
            const playerNumber = room.players.indexOf(socketId);

            if (me === null) {
                if (playerNumber !== -1) {
                    tileContainer.append('<div id="player_' + playerNumber + '" class="point" data-id="' + players[playerNumber].positionCell + '"><span></span></div>');
                    me = players[playerNumber];
                }
            }

            if (room.players.length < 2) {
                status.text('Ожидание соперника');
            } else {
                players.map(player => {
                    if (player.number !== playerNumber) {
                        tileContainer.append('<div id="player_' + player.number + '" class="point opponent" data-id="' + player.positionCell + '"><span></span></div>');

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
        });

        // Отображаем ход соперника
        socket.on('show turn opponent', function (turn) {
            console.log(turn);
            _opponentTurn = turn;

            $('#player_' + opponent.number).empty().append(pointBlockOpponent);
            $('#player_' + me.number).empty().append(pointBlock);

            // Фиксируем ход противника
            opponent.positionCell = turn;

            // Если ходы игроков совпали определяем победителя
            console.log(opponent.positionCell);
            console.log(me.positionCell);
            if (opponent.positionCell === me.positionCell) {
                showPopup('.popup', '.popupGameOver', '.btnPlayAgain', 300, 'inline-block');
                status.hide();
                tileContainer.empty();
            } else {
                status.text('Ваш ход!');
            }
        });

        //Делаем ход
        $(document).on('click', '.point > span', function () {
            let $this = $(this);
            let dataIdCell = $this.parent().data('id');
            let position = $this.index();
            let newDataId = dataIdCell;

            switch (position) {
                case 1:
                    newDataId = dataIdCell - 5;
                    break;
                case 2:
                    newDataId = dataIdCell - 4;
                    break;
                case 3:
                    newDataId = dataIdCell - 3;
                    break;
                case 4:
                    newDataId = dataIdCell - 1;
                    break;
                case 5:
                    newDataId = dataIdCell + 1;
                    break;
                case 6:
                    newDataId = dataIdCell + 3;
                    break;
                case 7:
                    newDataId = dataIdCell + 4;
                    break;
                case 8:
                    newDataId = dataIdCell + 5;
                    break;
            }

            $this.parent().attr('data-id', newDataId);
            $this.parent().data('id', newDataId);

            socket.emit('turn', {newDataId: newDataId, room: _room});

            $('#player_' + opponent.number).empty().append('<span></span>');
            $('#player_' + me.number).empty().append('<span></span>');

            // Фиксируем свой ход
            me.positionCell = newDataId;

            if (_opponentTurn !== null) {
                $('#player_' + opponent.number).attr('data-id', _opponentTurn).data('id', _opponentTurn);
            }

            // Если ходы игроков совпали определяем победителя
            if (opponent.positionCell === me.positionCell) {
                showPopup('.popup', '.popupGameWin', '.btnPlayAgain', 300, 'inline-block');
                status.hide();
                tileContainer.empty();
                socket.emit('finish game');
            } else {
                status.text('Ход соперника.');
            }
        });
    });

});