const createError = require('http-errors');
const express = require('express');
let socket_io = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const uuidv4 = require('uuid/v4');

const indexRouter = require('./routes/index');
const helper = require('./helpers/date');

const app = express();

// Socket.io
let io = socket_io();
app.io = io;

let _uuidv4 = uuidv4();
let tableNumber = helper.getRandomInRange();
let rooms = [];

let clients = 0;
let _room = null;

io.on('connection', function (socket) {
    console.log('a user connected' + socket.id);

    clients++;
    io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
    socket.on('disconnect', function () {
        clients--;
        io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
    });

    socket.on('start game', function () {
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

                //socket.emit('table', isRoom);
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

    socket.on('turn', function (data) {
        socket.broadcast.to(data.room.id).emit('show turn opponent', data.newDataId);
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

module.exports = app;
