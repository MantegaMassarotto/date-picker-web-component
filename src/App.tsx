import React, { useState } from 'react';

import DatePicker from './DatePicker';

function App() {
  const [date, setDate] = useState('');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {date && (
        <h1
          style={{ textAlign: 'center', fontSize: 20 }}
        >{`${date}`}</h1>
      )}
      <button
        onClick={() => {
          setIsDatePickerVisible(!isDatePickerVisible);
        }}
        style={{
          width: 150,
          height: 50,
          alignSelf: 'center',
          backgroundColor: '#001489',
          color: 'white',
        }}
      >
        {`${isDatePickerVisible ? 'HIDE' : 'SHOW'} DATE PICKER`}
      </button>
      <DatePicker
        isVisible={isDatePickerVisible}
        onCancel={() => {
          setIsDatePickerVisible(false);
        }}
        onSave={(date: string) => {
          setDate(date);
        }}
      />
    </div>
  );
}

export default App;
