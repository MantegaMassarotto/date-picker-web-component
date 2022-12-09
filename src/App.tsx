import React, { useState } from 'react';

import DatePicker from './DatePicker';

function App() {
  const [date, setDate] = useState<Date>();

  return (
    <div>
      {date && (
        <h1
          style={{ textAlign: 'center', fontSize: 30 }}
        >{`${date.toISOString()}`}</h1>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <DatePicker
          onChange={(date: Date) => {
            setDate(date);
          }}
        />
      </div>
    </div>
  );
}

export default App;
