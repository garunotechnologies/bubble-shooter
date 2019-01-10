const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const uuidv4 = require('uuid/v4');

const indexRouter = require('./routes/index');
const helper = require('./helpers/date');

// Socket.io
let app  = require('express')();
let http = require('http').Server(app);
let io   = require('socket.io')(http);
let port = process.env.port || 5000;

let _uuidv4 = uuidv4();
let tableNumber = helper.getRandomInRange();
let rooms = [];

let clients = 0;
let _room = null;

io.on('connection', function (socket) {
    //console.log('a user connected' + socket.id);

    clients++;
    io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
    socket.on('disconnect', function () {
        clients--;

        //delete socket.namespace.sockets[this.id];

        //Удаляем комнату
        let idRoom = rooms.find(r => Object.keys(r.players).indexOf(socket.id) !== -1);
        if (idRoom !== undefined) {
            delete idRoom.players[socket.id];

            if (Object.keys(idRoom.players).length === 1) {
                console.log('Соперник вышел из игры!');
                socket.leave(idRoom.id);
                socket.broadcast.to(idRoom.id).emit('msg exit player', {code: 101});
            }

            if (Object.keys(idRoom.players).length === 0) {
                let delRoom = rooms.map(r => { return r.id}).indexOf(idRoom.id);
                rooms.splice(delRoom, 1);
            }
        }
        //socket.emit('show server', rooms);

        // console.log( socket.id);
        io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
    });


    socket.on('start game', function (settings) {
        const socketId = socket.id;

        let players = [
            {
                id: 'blue',
                number: 1,
                name: 'Синий игрок',
                color: 'blue',
                positionCell: 1
            },
            {
                id: 'red',
                number: 2,
                name: 'Красный игрок',
                color: 'red',
                positionCell: 16
            },
            {
                id: 'green',
                number: 3,
                name: 'Зеленый игрок',
                color: 'green',
                positionCell: 4
            },
            {
                id: 'yellow',
                number: 4,
                name: 'Желтый игрок',
                color: 'yellow',
                positionCell: 13
            }
        ];

        let room = {
            id: _uuidv4,
            tableNumber: tableNumber,
            players: {},
            maxPlayers: 2
        };

        let isRoom = rooms.find(r => r.id === _uuidv4);

        if (isRoom !== undefined) {
            let keys = Object.keys(isRoom.players).length;
            if (keys < room.maxPlayers) {
                //console.log(2);

                isRoom.players[socketId] = {
                    number: 2,
                    name: settings.name,
                    color: 'red',
                    positionCell: 16
                };

                socket.join(isRoom.id);
                io.sockets.in(isRoom.id).emit('table', isRoom);
            } else {
                //console.log(3);
                _uuidv4 = uuidv4();
                room.id = _uuidv4;
                tableNumber = helper.getRandomInRange();
                room.tableNumber = tableNumber;
                room.players = {};
                room.players[socketId] = {
                    number: 1,
                    name: settings.name,
                    color: 'blue',
                    positionCell: 1
                };
                socket.join(_uuidv4);
                rooms.push(room);
                socket.emit('table', room);
            }
        } else {
            //console.log(1);
            room.players[socketId] = {
                number: 1,
                name: settings.name,
                color: 'blue',
                positionCell: 1
            };
            socket.join(_uuidv4);
            rooms.push(room);
            socket.emit('table', room);
        }

        if(settings.replay) {
            let idRoom = rooms.find(r => Object.keys(r.players).indexOf(socket.id) !== -1);

            console.log(idRoom);
            if (idRoom !== undefined) {
                let delRoom = rooms.map(r => { return r.id }).indexOf(idRoom.id);
                rooms.splice(delRoom, 1);
            }

            settings.replay = false;
            console.log(settings);
            console.log('REPLAY');

        }
        //console.log('rooms ---------------');
        //console.log(rooms);
    });


    console.log('rooms ---------------');
    console.log(rooms);
    //console.log('io ---------------');
    //console.log(socket.adapter.rooms);

    socket.on('turn', function (data) {
        socket.broadcast.to(data.room.id).emit('show turn opponent', data.newDataId);
    });

    socket.on('server game', function() {
        socket.emit('show server', rooms);
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

http.listen(port, () => {
    console.log('Сервер слушает порт ' + port);
});


module.exports = app;
