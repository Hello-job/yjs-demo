import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import 'quill/dist/quill.snow.css';
import * as Y from 'yjs'
import { QuillBinding } from 'y-quill'
import { useEffect } from 'react';
import { WebsocketProvider } from "y-websocket";



export default function App() {

   useEffect(() => {
    Quill.register('modules/cursors', QuillCursors)

    const quill = new Quill(document.querySelector('#quill'), {
      modules: {
        cursors: true,
        toolbar: [
          // adding some basic Quill content features
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['image', 'code-block'],
        ],
        history: {
          // Local undo shouldn't undo changes
          // from remote users
          userOnly: true,
        },
      },
      placeholder: 'Start collaborating...',
      theme: 'snow',
    })

    // Yjs文档，保存共享数据shared data
    const ydoc = new Y.Doc()
    // 在文档上定义共享文本类型
    const ytext = ydoc.getText('quill')

    const wsProvider = new WebsocketProvider(
      "ws://localhost:1234", // 使用Yjs官方提供的公共演示服务器
      "frontend-yjs-demo-room",
      ydoc
    );

    // 创建一个编辑器绑定 将quill编辑器“绑定”到 Y.Text 类型。
    const binding = new QuillBinding(ytext, quill, wsProvider.awareness)
   }, [])

  return (
    <div id='quill'></div>
  )
}


