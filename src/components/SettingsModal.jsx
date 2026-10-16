import Modal from 'react-modal'
import { useState} from 'react';

Modal.setAppElement('#root'); 

export default function SettingsModal({currentSettings, updateGameSettings}) {
    const [updatedSettings, setUpdatedSettings] = useState(structuredClone(currentSettings));
    const [isOpen, setIsOpen] = useState(false);

    function openModal() {
        setIsOpen(true);
    }

    function discardChanges() {
        setUpdatedSettings(currentSettings);
        setIsOpen(false);
    }

    function submitChanges() {
        updateGameSettings(updatedSettings);
        setIsOpen(false);
    }

    function updateSettings(newVal, whatsUpdating) {
        let updatedThisCall = structuredClone(updatedSettings);
        switch(whatsUpdating) {
            case 'poolSize':
                updatedThisCall.poolSize = newVal;
                break;
        }

        setUpdatedSettings(updatedThisCall);
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
                    value={updatedSettings.poolSize}
                    onChange={(e)=>{updateSettings(Number(e.target.value), 'poolSize')}}>
                </input>
                <div id='modalSubmitOrDiscardButtonsContainer'>
                    <button onClick={()=>{discardChanges()}}>Discard Changes</button>
                    <button onClick={()=>{submitChanges()}}>Submit Changes</button>
                </div>
            </Modal>
        </div>
    )
}