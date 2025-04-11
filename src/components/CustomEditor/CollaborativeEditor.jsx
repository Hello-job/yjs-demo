import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import './CollaborativeEditor.css';

function CollaborativeEditor({ doc, provider, username, userColor }) {
  const editorRef = useRef(null);
  const [text, setText] = useState('');
  const [cursors, setCursors] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const selectionRef = useRef(null);
  
  // 初始化编辑器
  useEffect(() => {
    if (!doc || !provider) return;
    
    // 获取共享文本
    const yText = doc.getText('shared-text');
    
    // 设置初始文本
    setText(yText.toString());
    
    // 监听文本变化
    const textObserver = (event) => {
      setText(yText.toString());
    };
    
    yText.observe(textObserver);
    
    // 监听其他用户的光标位置
    const awarenessObserver = (changes) => {
      const states = provider.awareness.getStates();
      const newCursors = {};
      
      states.forEach((state, clientId) => {
        if (state.user && state.cursor && clientId !== doc.clientID) {
          newCursors[clientId] = {
            name: state.user.name,
            color: state.user.color,
            position: state.cursor.position
          };
        }
      });
      
      setCursors(newCursors);
    };
    
    provider.awareness.on('change', awarenessObserver);
    
    return () => {
      yText.unobserve(textObserver);
      provider.awareness.off('change', awarenessObserver);
    };
  }, [doc, provider]);
  
  // 处理文本输入
  const handleTextChange = (e) => {
    const newText = e.target.value;
    const yText = doc.getText('shared-text');
    
    // 获取光标位置
    const cursorPosition = e.target.selectionStart;
    
    // 计算差异并应用更改
    doc.transact(() => {
      // 清除现有文本并设置新文本
      yText.delete(0, yText.length);
      yText.insert(0, newText);
    });
    
    // 更新光标位置到awareness
    provider.awareness.setLocalStateField('cursor', {
      position: cursorPosition
    });
  };
  
  // 处理光标移动
  const handleSelectionChange = (e) => {
    if (!provider) return;
    
    const cursorPosition = e.target.selectionStart;
    
    // 更新光标位置到awareness
    provider.awareness.setLocalStateField('cursor', {
      position: cursorPosition
    });
  };
  
  // 处理焦点事件
  const handleFocus = () => {
    setIsTyping(true);
  };
  
  const handleBlur = () => {
    setIsTyping(false);
  };
  
  return (
    <div className="collaborative-editor">
      <div className="editor-header">
        <h3>实时协同编辑</h3>
        <div className="active-users">
          <span>当前在线用户: </span>
          <span style={{ color: userColor }}>{username}</span>
          {Object.values(cursors).map((cursor, index) => (
            <span key={index} style={{ color: cursor.color }}>
              , {cursor.name}
            </span>
          ))}
        </div>
      </div>
      
      <div className="editor-content">
        <textarea
          ref={editorRef}
          value={text}
          onChange={handleTextChange}
          onSelect={handleSelectionChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="开始输入内容进行协同编辑..."
        />
        
        {/* 显示其他用户的光标 */}
        {Object.values(cursors).map((cursor, index) => {
          // 计算光标位置
          const textBeforeCursor = text.substring(0, cursor.position);
          const lines = textBeforeCursor.split('\n');
          const lineNumber = lines.length - 1;
          const charPosition = lines[lineNumber].length;
          
          // 计算光标的像素位置（使用更精确的计算方法）
          // 获取文本区域的样式信息
          const textarea = editorRef.current;
          const computedStyle = textarea ? window.getComputedStyle(textarea) : null;
          console.log('>>>>>computedStyle', computedStyle)
          
          // 使用计算样式获取实际行高和字符宽度
          const lineHeight = computedStyle ? parseInt(computedStyle.lineHeight, 10) || 20 : 20;
          const fontSizeInPx = computedStyle ? parseInt(computedStyle.fontSize, 10) || 16 : 16;
          // 使用字体大小的1倍作为平均字符宽度的估计值
          const charWidth = fontSizeInPx * 1;
          console.log('>>>>>charWidth',fontSizeInPx, charWidth)
          
          // 计算实际位置，考虑内边距
          const paddingTop = computedStyle ? parseInt(computedStyle.paddingTop, 10) || 0 : 0;
          const paddingLeft = computedStyle ? parseInt(computedStyle.paddingLeft, 10) || 0 : 0;
          
          const top = lineNumber * lineHeight + paddingTop;
          const left = charPosition * charWidth + paddingLeft;
          
          return (
            <div
              key={index}
              className="remote-cursor"
              style={{
                top: `${top}px`,
                left: `${left}px`,
                backgroundColor: cursor.color
              }}
            >
              <div 
                className="cursor-label"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CollaborativeEditor;