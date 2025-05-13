# 📡 WebSockets en React Native

Este proyecto demuestra cómo utilizar **WebSockets** para implementar comunicación en tiempo real en una aplicación React Native con `socket.io-client`.

---

## 🔍 ¿Qué es WebSocket?

**WebSocket** es un protocolo de red que permite una **comunicación bidireccional persistente** entre cliente y servidor sobre una única conexión TCP.

🔁 A diferencia del modelo tradicional HTTP (request/response), WebSocket permite al servidor **enviar mensajes al cliente** en cualquier momento, sin que el cliente lo solicite.

---

## 🧠 ¿Cómo funciona WebSocket?

1. El cliente establece una conexión WebSocket con el servidor.
2. Si el servidor acepta, se abre un canal persistente.
3. Ambos pueden enviarse mensajes en tiempo real (sin nuevas solicitudes).
4. Cuando se desconecta, se cierra la conexión.

---

## 📦 Librerías usadas

### Cliente:

- [`socket.io-client`](https://www.npmjs.com/package/socket.io-client)

### Servidor (ejemplo):

- [`socket.io`](https://socket.io)

---

## 🚀 Instalación

```bash
npm install socket.io-client
```

---

## 💻 Integración en React Native

### 📁 `App.tsx` (Cliente React Native)

```tsx
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  TextInput,
  Button,
  FlatList,
  Text,
  View,
  useColorScheme,
  Pressable,
} from "react-native";
import { io } from "socket.io-client";

const SOCKET_URL = "http://<TU_IP>:3000"; // Usa tu IP local

const socket = io(SOCKET_URL);

export default function Chat() {
  const [userId, setUserId] = useState("");
  const [toUser, setToUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      setUserId(socket.id); // Ahora sí tienes el ID correcto
    });

    socket.on("globalMessage", (data) => {
      setMessages((prev) => [
        ...prev,
        { text: `[Global] ${data.user}: ${data.message}`, type: "global" },
      ]);
    });

    socket.on("privateMessage", (data) => {
      setMessages((prev) => [
        ...prev,
        { text: `[Privado] ${data.from}: ${data.message}`, type: "private" },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendGlobal = () => {
    socket.emit("globalMessage", { user: userId, message });
    setMessage("");
  };

  const sendPrivate = () => {
    socket.emit("joinPrivateRoom", { userId1: userId, userId2: toUser });
    socket.emit("privateMessage", { from: userId, to: toUser, message });
    setMessage("");
  };

  return (
    <SafeAreaView style={{ padding: 20, flex: 1 }}>
      <Text>ID actual: {userId}</Text>
      <TextInput
        placeholder="Mensaje"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Enviar global" onPress={sendGlobal} />
      <Button title="Enviar privado" onPress={sendPrivate} />
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => <Text>{item.text}</Text>}
      />
    </SafeAreaView>
  );
}
```

---

## 🧪 Ejemplo de servidor (`Node.js + socket.io`)

```js
const { Server } = require("socket.io");
const io = new Server(3000, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  // Mensaje global
  socket.on("globalMessage", (data) => {
    io.emit("globalMessage", data);
  });

  // Mensaje privado
  socket.on("joinPrivateRoom", ({ userId1, userId2 }) => {
    const roomName = [userId1, userId2].sort().join("-");
    socket.join(roomName);
  });

  socket.on("privateMessage", ({ from, to, message }) => {
    io.to([from, to]).emit("privateMessage", { from, message });
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});
```

---

## 📱 Características implementadas

✅ Conexión WebSocket con `socket.io`
✅ Emisión y escucha de mensajes globales
✅ Chats privados mediante `joinRoom`
✅ Identificación dinámica del socket ID del usuario
✅ Actualización de UI en tiempo real

---

## 📁 Organización sugerida del cliente

```
/src
  /screens
    ChatScreen.tsx
  /services
    socket.ts      ← conexión y lógica de socket
  /components
    MessageList.tsx
```

---

## 🧠 Buenas prácticas

- Usa `socket.on("connect")` para obtener el `socket.id`.
- Desconecta el socket en `useEffect cleanup` (`socket.disconnect()`).
- Evita hardcodear IDs; usa dinámicos para producción.
- Para múltiples pantallas, abstrae la lógica a un **hook personalizado**.

---
