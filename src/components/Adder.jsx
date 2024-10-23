//Adder.jsx
import React from 'react';

function Adder({ input, setInput, handleAdd }) {
  return (
    <div className='flex gap-6'>
        <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            className='p-1.5 border border-gray-300 rounded text-black w-60'
            placeholder='Enter Item' 
        />
        <button 
            onClick={handleAdd}
            className='text-xl font-extralight -mr-20'
        >
          Add 🪄
        </button>
    </div>
  )
}

export default Adder