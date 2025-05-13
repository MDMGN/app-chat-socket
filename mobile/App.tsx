import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
  const [message, setMesagge] = useState("");
  const [messages, setMesagges] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => setUserID(() => socket.id!));
    socket.on("globalMessage", (message) =>
      setMesagges((prev) => [...prev, message])
    );
    socket.on("users:list", (users) => {
      console.log({ users });
      setUsers(users);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    socket.emit("globalMessage", { from: userID, message });
  };

  return (
    <View style={styles.container}>
      <Text>ID usuario: {userID}</Text>
      <TextInput
        onChangeText={setMesagge}
        placeholder="Escribir un mensaje"
        style={{
          borderBottomWidth: 2,
          borderColor: "#000",
          width: "80%",
          marginVertical: 10,
        }}
      />
      <Button title="Enviar" onPress={handleSendMessage} />
      <ScrollView>
        {users.map((user) => (
          <Pressable key={user}>
            <Text>{user}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <FlatList
        data={messages}
        style={{ flex: 1 }}
        keyExtractor={(_, index) => (Date.now() + index).toString()}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
      <StatusBar style="auto" />
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
  },
});
