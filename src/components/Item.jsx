//Item.jsx
import React, { useState, useEffect } from 'react';
import fetchMotivation from '../gemini';

function Item({ index, item, list, setList }) {
  const [removing, setRemoving] = useState(false); // To track if the item is being removed
  const [strikethroughIndex, setStrikethroughIndex] = useState(0); // To track which letter to strike out
  const [marker, setMarker] = useState('☐')
  const [editOption, setEditOption] = useState(false);
  const [editBox, setEditBox] = useState(false);
  const [newItem, setNewItem] = useState(item);
  const [motivationOption, setMotivationOption] = useState(false);
  const [motivationBox, setMotivationBox] = useState(false);
  const [motivation, setMotivation] = useState("");
  
  let sound = new Audio('/tear.mp3');

  useEffect(() => {
    let timer;
    if (removing && strikethroughIndex < item.length) {
      // Animate one letter at a time
      timer = setTimeout(() => {
        setStrikethroughIndex(strikethroughIndex + 1);
      }, 300/item.length); // Adjust the speed of the animation here (100ms per letter)
    } else if (strikethroughIndex === item.length) {
      sound.pause();
      sound.currentTime = 0;
      // After the animation, remove the item from the list
      const newList = list.filter((_, i) => i !== index);
      setList(newList);
      setRemoving(false);
      setMarker('☐');
      setStrikethroughIndex(0);
    }
    return () => clearTimeout(timer); // Clean up the timer
  }, [removing, strikethroughIndex]);

  const handleRemove = () => {
    sound.play();
    setRemoving(true); // Start the removal process
    setMarker('✅');
  };

  const handleOptionsOver = () => {
    setEditOption(true);
    setMotivationOption(true);
  };

  let timer;
  const handleOptionsLeave = () => {
    setEditOption(true);
    setMotivationOption(true);
    timer = setTimeout(() => {
      setEditOption(false);
      setMotivationOption(false);
    }, 3000);
    return () => clearTimeout(timer);
  };


  const handleEditSubmit = () => {
    if(newItem !== "") {
      const newList = [...list];
      newList[index]=newItem;
      setList(newList);
      setEditOption(false);
      setEditBox(false)
    }
  };

  const handleMotivationSubmit = async () => {
    try {
        const prompt = `While taking in second person (using words like you and emojis like 😤) and without any context, give me motivation for completing the following task in a few lines : ${item}`; // Customize your prompt as needed
        const response = await fetchMotivation({prompt, setMotivation});
        setMotivation(response);
    } catch (error) {
        console.error("Error fetching motivation:", error);
        setMotivation("Could not fetch motivation, please try again.");
    }
    setMotivationBox(true);
};

  return (
    <div className='flex gap-5'>
      <button
        onClick={handleRemove}
        className='text-2xl -ml-2'
      >
        {marker}
      </button>

      {editBox ? 
        <div className='flex items-center gap-6 ml-0.5'>
          <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={item} className='rounded border border-grey-400 text-black w-48 h-9 px-2' />
          <div className='flex -ml-2.5'>
            <button onClick={handleEditSubmit} className='ml-2 text-xl font-extralight' >Save</button>
            <button onClick={handleEditSubmit} className='ml-2 text-lg font-extralight' >✅</button>
          </div>
          <div className='flex gap-2'>
            <button onClick={() => setEditBox(false)} className='text-xl font-extralight' >Cancel</button>
            <button onClick={() => setEditBox(false)} className='text-lg font-extralight' >❌</button>
          </div>
        </div>
      :
      <div className='flex gap-6 ml-2'>
        <div 
        onMouseOver={handleOptionsOver}
        onMouseLeave={handleOptionsLeave}
        className='flex items-center text-2xl font-thin break-all flex-grow'
        >
          {item.split('').map((char, i) => (
            <span
              key={i}
              className={i < strikethroughIndex && removing ? 'line-through' : ''}
            >
              {char}
            </span>
          ))}
        </div>
        {motivationBox ?
            <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
              <div className='flex flex-col items-center bg-white p-8 rounded-lg shadow-lg transform transition-all ease-out duration-300 scale-100'>
                <h2 className='text-2xl text-black mb-4 font-semibold'>Motivational Message</h2>
                <p className='text-lg text-black mb-6'>{motivation}</p>
                <button onClick={() => setMotivationBox(false)} className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200'>
                  Close
                </button>
              </div>
            </div>
        :
        <div className='flex gap-5 w-full flex-wrap ml-6'>
          {editOption && (
            <div>
              <button onClick={() => setEditBox(true)} className='text-xl font-extralight' >Edit</button>
            </div>
          )}
          {motivationOption && (
            <div>
              <button onClick={handleMotivationSubmit} className='text-xl font-extralight' >Motivation</button>
            </div>
          )}
        </div>
        }
      </div>
      }
    </div>
  );
}

export default Item;
