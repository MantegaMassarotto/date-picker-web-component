import React, { useState } from 'react';

import DatePicker from './DatePicker';

function App() {
  const [date, setDate] = useState('');

  return (
    <div>
      <h1 style={{ textAlign: 'center', fontSize: 50 }}>{date}</h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <DatePicker
          onChange={(date: string) => {
            setDate(date);
          }}
        />
      </div>
    </div>
  );
}

export default App;
