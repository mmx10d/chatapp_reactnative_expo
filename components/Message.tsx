import { StyleSheet, Text, View } from "react-native";
interface Props {
  content: string;
  from: string;
}
const Message = ({ content, from }: Props) => {
  return (
    <View style={[ styles.box,from === "sender" ? styles.sender : styles.reciver]}>
      <Text style={styles.text}>
        {content}
      </Text>
    </View> 
  )
}
export default Message; 
const styles = StyleSheet.create({
  box: {
    width: "50%",
    borderRadius: 20,
    boxShadow: "0 3px 1px black",
    marginVertical: 5
  },
  text: {
    fontSize: 24,
    padding: 6,
    textAlign: "right",
    paddingRight: 20
  },
  sender: {
    backgroundColor: "#1f0",
    justifyContent: "center",
  },
  reciver: {
    backgroundColor: "white",
    alignSelf: "flex-end"
  }
})