import React, { useState } from 'react';
import CustomEditor from '@/components/CustomEditor'
import QuillEditor from '@/components/QuillEditor'

export default function  Layout() {
  const [tab, setTab] = useState('custom');
  
  return  <div>
    <button onClick={() => setTab('custom')} className=''>自定义编辑器</button>
    <button onClick={() => setTab('quill')} className=''>quill编辑器</button>
    {tab === 'custom' ? <CustomEditor /> : <QuillEditor />}
  </div>
}