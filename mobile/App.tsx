import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { io } from "socket.io-client";

const socket = io("http://172.18.20.65:3000");

export default function App() {
  const [userID, setUserID] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMesagge] = useState("");
  const [messages, setMesagges] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const refFlatList = useRef<FlatList>(null);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => setUserID(() => socket.id!));
    socket.on("globalMessage", (message) =>
      setMesagges((prev) => [...prev, message])
    );
    socket.on("users:list", (users: string[]) => {
      setUsers(() => users.filter((user) => user != socket.id));
    });

    socket.on("privateMessage", ({ from, message }) => {
      setMesagges((prev) => [...prev, `[Private] ${from} : ${message}`]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSendMessageGlobal = () => {
    if (message.trim().length === 0) {
      return;
    }
    socket.emit("globalMessage", { from: userID, message });
    setMesagge("");
  };

  const handleSendMessagePrivate = () => {
    if (message.trim().length === 0) {
      return;
    }
    if (!selectedUser?.trim()) {
      alert("No hay usuario selecionado");
      return;
    }

    socket.emit("privateMessage", { to: selectedUser, message });
    setMesagge("");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text>ID usuario: {userID}</Text>
      {selectedUser && <Text>Usuario selecionado: {selectedUser}</Text>}
      <View style={{ height: 200 }}>
        <ScrollView>
          {users.map((user) => (
            <Pressable
              key={user}
              onPress={() => setSelectedUser(user)}
              style={{
                width: "100%",
                padding: 20,
                backgroundColor: selectedUser === user ? "#00df" : "#000",
                marginVertical: 5,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#fff" }}>{user}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <FlatList
        ref={refFlatList}
        data={messages}
        style={{ flex: 1 }}
        keyExtractor={(_, index) => (Date.now() + index).toString()}
        renderItem={({ item }) => <Text>{item}</Text>}
        onContentSizeChange={() =>
          refFlatList.current?.scrollToEnd({ animated: true })
        }
      />
      <TextInput
        onChangeText={setMesagge}
        placeholder="Escribir un mensaje"
        style={{
          borderBottomWidth: 2,
          borderColor: "#000",
          width: "80%",
          marginVertical: 10,
        }}
        value={message}
      />
      <View
        style={{
          flex: 0,
          flexDirection: "row",
          justifyContent: "space-around",
          width: "100%",
        }}
      >
        <Button
          title="Enviar Global"
          onPress={handleSendMessageGlobal}
          disabled={message.trim().length === 0}
        />
        <Button
          title="Enviar Privado"
          onPress={handleSendMessagePrivate}
          disabled={message.trim().length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 50,
  },
});
