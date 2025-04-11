import React, { useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import CollaborativeEditor from "@/components/CustomEditor/CollaborativeEditor";
import UserInfo from "@/components/CustomEditor/UserInfo";
import "./index.css";

function App() {
  const [doc, setDoc] = useState(null);
  const [provider, setProvider] = useState(null);
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [userColor, setUserColor] = useState(
    "#" + Math.floor(Math.random() * 16777215).toString(16)
  );

  // 初始化Yjs文档和WebSocket连接
  useEffect(() => {
    // 创建新的Yjs文档
    const yDoc = new Y.Doc();

    // 连接到WebSocket服务器
    // 使用y-websocket提供的内存模式，不需要后端服务器
    const wsProvider = new WebsocketProvider(
      "ws://localhost:1234", // 使用Yjs官方提供的公共演示服务器
      "frontend-yjs-demo-room",
      yDoc
    );

    // 设置连接状态监听
    wsProvider.on("status", (event) => {
      setIsConnected(event.status === "connected");
    });

    // 保存文档和提供者的引用
    setDoc(yDoc);
    setProvider(wsProvider);

    // 组件卸载时断开连接
    return () => {
      wsProvider.disconnect();
      yDoc.destroy();
    };
  }, []);

  // 处理用户名变更
  const handleUsernameChange = (newUsername) => {
    setUsername(newUsername);
    if (provider && newUsername) {
      // 设置用户信息到awareness
      provider.awareness.setLocalStateField("user", {
        name: newUsername,
        color: userColor,
      });
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Yjs协同文本编辑器</h1>
        <div className="connection-status">
          {isConnected ? (
            <span className="connected">已连接</span>
          ) : (
            <span className="disconnected">未连接</span>
          )}
        </div>
      </header>

      <UserInfo
        username={username}
        onUsernameChange={handleUsernameChange}
        userColor={userColor}
        onColorChange={setUserColor}
      />

      <main className="editor-container">
        {doc && provider && username ? (
          <CollaborativeEditor
            doc={doc}
            provider={provider}
            username={username}
            userColor={userColor}
          />
        ) : (
          <div className="editor-placeholder">
            <p>请输入您的用户名以开始协同编辑</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>基于Yjs的实时协同编辑应用 | {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
