import React from 'react';
// import './App.css';

import DatePicker from './DatePicker';

function App() {
  return (
    <div style={{ backgroundColor: '#d4d4d4', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <text>TITLE</text>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <DatePicker />
      </div>
    </div>
  );
}

export default App;
