import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, FlatList, StyleSheet, Modal, KeyboardAvoidingView, Platform} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Message from "./components/Message";

interface MessageProps {
  id: number;
  username: string;
  password: string;
  chats: any;
}

export default function App() {
  const [username, setUsername] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showUsernameModal, setShowUsernameModal] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>("");

  // استعادة اسم المستخدم
  const loadUsername = async () => {
    try {
      const stored = await AsyncStorage.getItem("username");
      if (stored) setUsername(stored);
      else setShowUsernameModal(true); // اعرض مودال ادخال الاسم
    } catch (err) {
      console.log("Error loading username:", err);
      setShowUsernameModal(true);
    }
  };

  // حفظ اسم المستخدم
  const saveUsername = async () => {
    const trimmed = tempName.trim();
    if (!trimmed) return;
    try {
      await AsyncStorage.setItem("username", trimmed);
      setUsername(trimmed);
      setShowUsernameModal(false);
    } catch (err) {
      console.log("Error saving username:", err);
    }
  };

  // ارسال رسالة
  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await fetch("https://chatapp-server-u9b2.onrender.com/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Date.now(),
          username,
          content: text.trim(),
        }),
      });
      setText("");
      loadMessages();
    } catch (err) {
      console.log("Error sending message:", err);
    }
  };

  // جلب الرسائل
  const loadMessages = async () => {
    try {
      const res = await fetch("https://chatapp-server-u9b2.onrender.com/messages");
      const data = await res.json();
      setMessages(data);
      setLoading(false);
    } catch (err) {
      console.log("Error loading messages:", err);
    }
  };

  useEffect(() => {
    loadUsername();
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // تحديث كل 5 ثواني
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* مودال طلب الاسم */}
      <Modal visible={showUsernameModal} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>ادخل اسم المستخدم:</Text>
            <TextInput
              style={styles.modalInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="الاسم هنا"
            />
            <Pressable style={styles.modalButton} onPress={saveUsername}>
              <Text style={{ color: "#fff", fontSize: 16 }}>حفظ</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        <View style={styles.messageBox}>
          {loading ? (
            <Text style={{ color: "#fff", textAlign: "center" }}>جاري التحميل...</Text>
          ) : (
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Message
                  content={item.content}
                  from={item.username === username ? "sender" : "receiver"}
                />
              )}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="اكتب رسالة..."
            value={text}
            onChangeText={setText}
          />
          <Pressable onPress={sendMessage} style={styles.sendButton}>
            <Image
              style={styles.sendIcon}
              source={{
                uri: "https://media.istockphoto.com/id/1290684294/vector/send-message-icon.jpg?s=612x612&w=0&k=20&c=8vwd4PDMzEELKMUrTQ7LZnpngAN5Bzs55sRJ09sA8FU=",
              }}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222" },
  messageBox: { flex: 1, padding: 10 },
  inputContainer: {
    flexDirection: "row",
    padding: 5,
    borderTopWidth: 1,
    borderTopColor: "#555",
    backgroundColor: "#333",
  },
  input: {
    flex: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    fontSize: 18,
    borderRadius: 5,
  },
  sendButton: {
    flex: 1,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: { width: 40, height: 40 },

  // مودال
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#888",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  modalButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});
