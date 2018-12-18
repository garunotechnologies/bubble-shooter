socket.on('connect', function () {
    let socketId = socket.id;
    console.log('Connected! ID: ' + socketId);

    socketConnected = true;
    if (socketConnected) {
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
        });

        socket.on('table', function (room) {

            //console.log('================');
            //console.log(room);

            $('.tableNumber').text(room.tableNumber);

            socket.emit('player number', room);
        });

        socket.on('connectToRoom', function(room) {
            _room = room;
            console.log(room);

            console.log("Мой id " + socketId);
            console.log("Мой room id " + room.id);


            const playerNumber = room.players.indexOf(socketId);
            if(playerNumber !== -1) {

                players.map(player => {
                    tileContainer.append('<div id="player_' + player.number + '" class="point" data-id="' + player.positionCell + '"><span></span></div>');
                    if (player.number === playerNumber) {
                        me = player;
                    } else {
                        opponent = player;
                        _opponentPositionCell = player.positionCell;
                    }
                });

                if (playerNumber === 0) {
                    status.text('Ваш ход!');
                    $('#player_' + playerNumber).empty().append(pointBlock);
                } else {
                    status.text('ЖДИТЕ! Ход соперника');
                }
            }
        });

        // Получаем номер игрока
        // socket.on('player-number', function (playerNumber) {
        //
        //     console.log(playerNumber);
        //
        //     playerNumber = Number(playerNumber);
        //
        //     if (playerNumber === -1) {
        //         console.log('Only two players');
        //     } else {
        //         players.map(player => {
        //             tileContainer.append('<div id="player_' + player.number + '" class="point" data-id="' + player.positionCell + '"><span></span></div>');
        //             if (player.number === playerNumber) {
        //                 me = player;
        //             } else {
        //                 opponent = player;
        //                 _opponentPositionCell = player.positionCell;
        //             }
        //         });
        //
        //         if (playerNumber === 0) {
        //             status.text('Ваш ход!');
        //             $('#player_' + playerNumber).empty().append(pointBlock);
        //         } else {
        //             status.text('ЖДИТЕ! Ход соперника');
        //         }
        //     }
        // });

        // Отображаем ход соперника
        socket.on('show turn opponent', function (turn) {
            _opponentTurn = turn;

            $('#player_' + opponent.number).empty().append('<span></span>');
            $('#player_' + me.number).empty().append(pointBlock);

            // Фиксируем ход противника
            opponent.positionCell = turn;

            // Если ходы игроков совпали определяем победителя
            if (opponent.positionCell === me.positionCell) {
                showPopup('.popup', '.popupGameOver', '.btnPlayAgain', 300, 'inline-block');
                status.hide();
                tileContainer.empty();
            } else {
                status.text('Ваш ход!');
            }
        });
    }

});