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

$.fn.showPopup = function(children, close, speed, display) {
    let $this = $(this);
    if (display === '') {
        $(children).fadeIn(speed);
    } else {
        $(children).fadeIn(speed).css("display", display);
    }
    $this.fadeIn(speed).addClass('show');
    $('body').addClass('hidden');
    let closePopup = $(children).find(close);

    $(closePopup).on('click', function () {
        $('body').removeClass('hidden');
        $this.fadeOut(speed).removeClass('show');
        $(children).fadeOut(speed);
    });
}

$.fn.hidePopup = function(children, speed) {
    $('body').removeClass('hidden');
    $(this).fadeOut(speed).removeClass('show');
    $(children).fadeOut(speed);
};
// END

$(document).ready(function() {
    let socket = io(); // Инициализируем сокет
    let socketConnected = false;

    let welcomePage = $('.cf_welcome');
    let mainPage = $('.cf_main');
    let serverPage = $('.cf_server');
    let serverContent = $('.server__content');

    let nickname = $('#nickname');
    let numberPlayer = Math.floor(1000 + Math.random() * 9000);
    nickname.val('Player '+numberPlayer);

    let btnShowServer = $('.btnShowServer');
    let btnToUpdate = '.btnToUpdate';
    let btnPlayByPort = $('.btnPlayByPort');

    let btnStartGame = $('.btnStartGame');
    let btnPlayAgain = $('.btnPlayAgain');
    let popupPlayerSearch = $('.popupPlayerSearch');
    let playerSearch = $('.playerSearch');
    let tileContainer = $('.tile-container');
    let tableNumber = $('.tableNumber');
    let status = $('.status');
    let pointBlock = '<span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>';
    let pointBlockOpponent = '<span></span><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b>';

    let me = null;
    let opponent = null;
    let _opponentPositionCell = null;
    let _opponentTurn = null;
    let _room = null;
    let game_process = true;


    //Подсчет количества подключенных клиентов
    socket.on('broadcast', function (data) {
        $('.countClients').text(data.description);
    });

    socket.on('disconnect', function () {
        socketConnected = false;
        console.log('Disconnected!');
        //socket.emit('server game');
    });

    socket.on('connect', function () {
        let socketId = socket.id; console.log('Connected! ID: ' + socketId);
        let settings = {
            name: null,
            replay: false,
            players: 2
        };

        btnShowServer.on('click', function () {
            welcomePage.hide();
            serverPage.show();
            socket.emit('server game');
        });

        $(document).on('click', btnToUpdate, function () {
            socket.emit('server game');
        });

        socket.on('msg exit player', function (data) {
            console.log('----------------=');
            console.log(data);

            if(data.code === 101 && game_process) {
                status.text('.....');

                $('.popup').showPopup('.popupExitPlayer', '.btnPlayAgain', 500, 'inline-block');
            }
        });

        // Отображаем ход соперника
        socket.on('show server', function (rooms) {
            console.log(rooms);

            const $rooms = Object.keys(rooms);
            serverContent.empty();

            console.log('-----------');
            console.log($rooms.length);
            console.log($rooms.length === 0);

            if($rooms.length !== 0) {
                $rooms.map(room => {
                    let value = rooms[room];
                    let $players = Object.keys(value.players);
                    let model = 'model';

                    serverContent.append('<li>' +
                        '<div class="cell game">' + value.id + '</div>' +
                        '<div class="cell players">' + model + '</div>' +
                        '<div class="cell map">' + $players.length + " / " + value.maxPlayers + '</div>' +
                        '<div class="cell tableNumber">' + value.tableNumber + '</div></li>');
                });
            } else {
                serverContent.append('<li class="msg">Обновите страницу!</li>');
            }
        });

        // Начинаем игру после нажатия кнопки
        btnStartGame.on('click', function () {
            welcomePage.hide();
            mainPage.show();
            settings.name = nickname.val();
            socket.emit('start game', settings);
            status.show();
        });

        btnPlayAgain.on('click', function () {
            status.show();
            tileContainer.empty();

            settings.name = nickname.val();
            settings.replay = true;

            me = null;
            opponent = null;
            _opponentPositionCell = null;
            _opponentTurn = null;
            _room = null;
            game_process = true;

            socket.emit('start game', settings);
        });

        socket.on('table', function (room) {
            _room = room;

            settings.replay = false;
            console.log(room);
            console.log("Мой id - " + socketId + '\n' + "Мой room id - " + room.id + '\n' + "Номер стола - " + room.tableNumber + '\n' + "Имя пользователя - " + Object.keys(room.players) + '\n' + "Кол-во пользователей - " + Object.keys(room.players).length + '\n');

            const $players = Object.keys(room.players);
            const $playerNumber = $players.indexOf(socketId) + 1;

            tableNumber.text(room.tableNumber);

            if ($playerNumber !== -1) {

                if ($players.length < 2) {
                    status.text('Ожидание соперника');
                } else {
                    if ($playerNumber === 1) {
                        status.text('Ваш ход!');
                        $('#player_' + $playerNumber).empty().append(pointBlock);
                    } else {
                        status.text('Ход соперника');
                    }
                }

                $players.map(player => {
                    let value = room.players[player];

                    if ($playerNumber === value.number && me === null) {
                        tileContainer.append('<div id="player_' + value.number + '" class="point" data-name="' + value.name + '" data-id="' + value.positionCell + '"><span></span></div>');
                        me = value;
                    }

                    if ($playerNumber !== value.number && opponent === null) {
                        tileContainer.append('<div id="player_' + value.number + '" class="point opponent" data-name="' + value.name + '" data-id="' + value.positionCell + '"><span></span></div>');
                        opponent = value;
                        _opponentPositionCell = value.positionCell;
                    }
                });



                $('.popup').showPopup('.popupPlayerSearch', '.btnPlayAgain', 500, 'inline-block');

                let $pl = me;
                (me !== null) ? $pl = me : $pl = opponent;

                console.log('-----------------1');
                console.log($pl);
                console.log('-----------------pl');
                console.log(me);
                console.log(opponent);
                console.log('-----------------1');

                if ($players.length === 1 && me != null || opponent !== null) {



                    playerSearch.empty();
                    playerSearch.append('<div class="half player_' + $pl.number + '"><div class="avatarBlock"></div><div class="name">' + $pl.name + '</div></div>');
                    playerSearch.append('<div class="half player_2 is-find"><div class="avatarBlock"></div><div class="name">???</div></div>');
                }

                if ($players.length === 2 && me != null && opponent !== null) {

                    // console.log('-----------------2');
                    // console.log($pl);
                    // console.log(me);
                    // console.log(opponent);
                    console.log('-----------------2');

                    playerSearch.empty();
                    playerSearch.append('<div class="half player_' + me.number + '"><div class="avatarBlock"></div><div class="name">' + me.name + '</div></div>');
                    playerSearch.append('<div class="half player_' + opponent.number + '"><div class="avatarBlock"></div><div class="name">' + opponent.name + '</div></div>');
                }


                if (me != null && opponent !== null) {
                    popupPlayerSearch.find('.title').addClass('is-start');
                    setTimeout(function () {
                        popupPlayerSearch.find('.title').removeClass('is-start');
                        playerSearch.empty();
                        $('.popup').hidePopup('.popupPlayerSearch', 500);
                    }, 3000);
                }
            }
        });

        // Отображаем ход соперника
        socket.on('show turn opponent', function (turn) {
            _opponentTurn = turn;

            $('#player_' + opponent.number).empty().append(pointBlockOpponent);
            $('#player_' + me.number).empty().append(pointBlock);

            // Фиксируем ход противника
            opponent.positionCell = turn;

            // Если ходы игроков совпали определяем победителя
            if (opponent.positionCell === me.positionCell) {

                if (_opponentTurn !== null) {
                    $('#player_' + me.number).addClass('loser').empty().append('<span></span>');
                    $('#player_' + opponent.number).addClass('winner').empty().append('<span></span>').attr('data-id', _opponentTurn).data('id', _opponentTurn);
                }

                setTimeout(function () {
                    game_process = false;
                    $('.popup').showPopup('.popupGameOver', '.btnPlayAgain', 500, 'inline-block');
                    status.text('YOU LOST');
                    tileContainer.empty();
                }, 700);
            } else {
                status.text('Ваш ход!');
            }
        });

        //Делаем ход
        $(document).on('click', '.point:not(.opponent) > span', function () {
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

            if (dataIdCell !== newDataId) {
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
                    setTimeout(function () {
                        game_process = false;
                        $('.popup').showPopup('.popupGameWin', '.btnPlayAgain', 500, 'inline-block');
                        status.text('YOU WIN');
                        tileContainer.empty();
                        socket.emit('finish game');
                    }, 700);
                } else {
                    status.text('Ход соперника.');
                }
            }
        });
    });

});