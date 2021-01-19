import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View
} from 'react-native'

import { GiftedChat } from 'react-native-gifted-chat'

class Discuss extends Component {
  constructor(props) {
    super(props)
    this.state = {messages: []}
    this.onSend = this.onSend.bind(this)
  }
  componentWillMount() {
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(Date.UTC(2021, 0, 18, 13, 40, 50)),
          user: {
            _id: 2,
            name: 'React Native',
          },
        },
      ],
    })
  }
  onSend(messages = []) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, messages),
      }
    })
  }
  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={this.onSend}
        user={{
          _id: 1,
        }}
      />
    )
  }
}

export default function Discussion(){
    return(
        <Discuss/>
    )
}