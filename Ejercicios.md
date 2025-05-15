# WebSockets y React Native

## ✅ Ejercicio 1: **Hola WebSocket**

### 🎯 Objetivo

Mostrar el ID del socket al conectarse.

### 🖥️ Servidor

```js
io.on("connection", (socket) => {
  // Nuevo usuario conectado, mostrar su socket ID
  console.log("Usuario conectado:", socket.id);
  // Enviar al cliente el ID asignado
  socket.emit("connected", { id: socket.id });
});
```

### 📱 Cliente

Conectarse al servidor y mostrar el ID recibido en pantalla.

---

## ✅ Ejercicio 2: **Chat Global**

### 🎯 Objetivo

Enviar y recibir mensajes visibles por todos los usuarios conectados.

### 🖥️ Servidor

```js
io.on("connection", (socket) => {
  // Escuchar mensajes globales enviados por un cliente
  socket.on("globalMessage", (data) => {
    // Reenviar el mensaje a todos los clientes conectados
    io.emit("globalMessage", data);
  });
});
```

### 📱 Cliente

Emitir el mensaje con `globalMessage`, y mostrar los mensajes recibidos.

---

## ✅ Ejercicio 3: **Chat Privado**

### 🎯 Objetivo

Enviar mensajes privados a un socket específico.

### 🖥️ Servidor

```js
io.on("connection", (socket) => {
  // Escuchar mensaje privado con destinatario específico
  socket.on("privateMessage", ({ to, from, message }) => {
    // Enviar solo al socket con id "to"
    io.to(to).emit("privateMessage", { from, message });
  });
});
```

### 📱 Cliente

Permitir elegir un usuario (socket ID) y enviarle un mensaje privado.

---

## ✅ Ejercicio 4: **Filtrado de Palabras**

### 🎯 Objetivo

Bloquear mensajes con palabras ofensivas.

### 🖥️ Servidor

```js
const forbiddenWords = ["malo", "feo"];

io.on("connection", (socket) => {
  // Escuchar mensaje global
  socket.on("globalMessage", ({ user, message }) => {
    // Revisar si el mensaje contiene palabras prohibidas
    const found = forbiddenWords.find((w) => message.includes(w));
    if (found) {
      // Si hay palabra prohibida, avisar al usuario que su mensaje fue bloqueado
      socket.emit("messageBlocked", { reason: "Contenido inapropiado" });
    } else {
      // Si el mensaje es limpio, reenviar a todos
      io.emit("globalMessage", { user, message });
    }
  });
});
```

### 📱 Cliente

Mostrar alerta si se recibe un `messageBlocked`.

---

## ✅ Ejercicio 5: **"Está escribiendo..."**

### 🎯 Objetivo

Notificar a otros usuarios cuando alguien está escribiendo.

### 🖥️ Servidor

```js
io.on("connection", (socket) => {
  // Escuchar evento cuando el usuario está escribiendo
  socket.on("typing", (userId) => {
    // Informar a todos excepto el que escribe que alguien está escribiendo
    socket.broadcast.emit("typing", userId);
  });
});
```

### 📱 Cliente

Emitir `typing` mientras escribe, y mostrar quién está escribiendo.

---

## 🧩 Ejercicio Final: **Chat con Salas (Rooms)**

### 🎯 Objetivo

Crear un chat con salas privadas, ingreso dinámico, y mensajes aislados por sala.

### 🖥️ Servidor

```js
io.on("connection", (socket) => {
  // Usuario pide unirse a una sala con nombre y usuario
  socket.on("joinRoom", ({ username, room }) => {
    // Añadir socket a la sala indicada
    socket.join(room);
    // Guardar datos en el socket para futuras referencias
    socket.data.username = username;
    socket.data.room = room;
    // Avisar a los demás usuarios en la sala que alguien entró
    socket.broadcast
      .to(room)
      .emit("userJoined", `${username} se unió a la sala ${room}`);
    socket.emit("joinedRoom", room);
  });

  socket.on("roomMessage", ({ message }) => {
    const username = socket.data.username;
    const room = socket.data.room;
    if (room) {
      io.to(room).emit("roomMessage", { user: username, text: message });
    }
  });

  socket.on("disconnect", () => {
    const { username, room } = socket.data;
    if (room) {
      socket.to(room).emit("userLeft", `${username} salió de la sala.`);
    }
  });
});
```

### 📱 Cliente

- Pedir nombre de usuario y sala.
- Unirse a la sala.
- Mostrar mensajes solo de esa sala.
- Notificar entradas y salidas de usuarios.

---

# Flujo para el Cliente (React Native)

### 1. **Inicializar el socket y conectar**

- Crear la conexión al servidor Socket.IO con la URL correcta.
- Ejemplo: `const socket = io("http://<TU_IP>:6000");`

---

### 2. **Unirse a una sala**

- El usuario ingresa su **nombre de usuario** y el **nombre de la sala**.
- Se emite el evento `joinRoom` con estos datos al servidor.

  ```js
  socket.emit("joinRoom", { username, room });
  ```

- Escuchar el evento `joinedRoom` para confirmar que el usuario entró correctamente a la sala.
- Mostrar en la interfaz que está dentro de la sala.

---

### 3. **Recibir notificaciones de la sala**

- Escuchar eventos para mostrar en la UI mensajes como:

  - `userJoined`: para mostrar que alguien más entró a la sala.
  - `userLeft`: para mostrar que alguien salió.
  - `roomMessage`: para recibir mensajes enviados por otros usuarios en la misma sala.

- Por ejemplo:

  ```js
  socket.on("userJoined", (msg) => {
    // Mostrar mensaje en chat: alguien entró
  });
  socket.on("userLeft", (msg) => {
    // Mostrar mensaje en chat: alguien salió
  });
  socket.on("roomMessage", (msg) => {
    // Mostrar mensaje normal de chat
  });
  ```

---

### 4. **Enviar mensajes dentro de la sala**

- El usuario escribe un mensaje en un campo de texto.
- Al pulsar "Enviar", se emite el evento `roomMessage` con el texto.

  ```js
  socket.emit("roomMessage", message);
  ```

- El mensaje será recibido por todos los usuarios en la sala, incluido el emisor, mediante el evento `roomMessage`.

---

### 5. **Gestionar desconexiones**

- Cuando el usuario cierra la app o se desconecta, el servidor emitirá el evento `userLeft` a los otros usuarios de la sala.
- La app puede mostrar una notificación o actualizar la lista de usuarios conectados.

---

### 6. **Opcionales y recomendaciones**

- Guardar localmente (en estado o contexto) el nombre de la sala y el usuario para evitar inconsistencias.
- Mostrar el nombre de la sala y usuario activo en la interfaz para mejorar la experiencia.
- Manejar errores, por ejemplo, si no se puede conectar o si el nombre de sala/usuario es inválido.
- Desconectar el socket cuando el componente se desmonte para liberar recursos.
