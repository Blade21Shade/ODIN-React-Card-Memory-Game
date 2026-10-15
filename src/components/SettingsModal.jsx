import Modal from 'react-modal'
import { useState} from 'react';

Modal.setAppElement('#root'); 

export default function SettingsModal({currentPoolSize, updatePoolSize}) {
    const [poolSizeInputValue, setPoolSizeInputValue] = useState(currentPoolSize);
    const [isOpen, setIsOpen] = useState(false);

    function openModal() {
        setIsOpen(true);
    }

    function discardChanges() {
        setPoolSizeInputValue(currentPoolSize);
        setIsOpen(false);
    }

    function submitChanges() {
        updatePoolSize(poolSizeInputValue);
        setIsOpen(false);
    }

    return (
        <div>
            <button onClick={()=>{openModal()}}>Open Settings</button>
            <Modal
                isOpen = {isOpen}
                shouldCloseOnEsc = {false}
            >
                <label 
                    htmlFor='updatePoolSizeCountInput'
                    title='The number of pokemon you want to guess from. A larger number will be harder game. Minimum of 10, Maximum of 1000'
                >
                    Pokemon Pool Size: 
                </label>
                <input
                    name='updatePoolSizeCountInput'
                    id='updatePoolSizeCountInput'
                    type='number'
                    min='10'
                    max='1000'
                    value={poolSizeInputValue}
                    onChange={(e)=>{setPoolSizeInputValue(Number(e.target.value))}}>
                </input>
                <div id='modalSubmitOrDiscardButtonsContainer'>
                    <button onClick={()=>{discardChanges()}}>Discard Changes</button>
                    <button onClick={()=>{submitChanges()}}>Submit Changes</button>
                </div>
            </Modal>
        </div>
    )
}