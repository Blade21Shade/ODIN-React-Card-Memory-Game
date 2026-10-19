import Modal from 'react-modal'
import { useState} from 'react';

Modal.setAppElement('#root'); 

export default function SettingsModal({currentSettings, updateGameSettings}) {
    const [updatedSettings, setUpdatedSettings] = useState(structuredClone(currentSettings));
    const [isOpen, setIsOpen] = useState(false);

    // Pokemon cannot have both the same primary and secondary type, so when the primary type is named the same secondary typed needs to be disabled
    const [disabledSecondaryType, setDisabledSecondaryType] = useState('noDisable');
    let types = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock',
        'ghost', 'dragon', 'dark', 'steel', 'fairy'
    ];
    let primaryTypes = ['any', ...types]; // any matches all types
    let secondaryTypes = ['any', 'none', ...types]; // none excludes all types, meaning the pool will only include single-type Pokemon

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
            case 'primaryType': // Prevent the user from selecting the same primary and secondary type if a specific type is given
                updatedThisCall.primaryType = newVal;
                if (newVal !== 'any') {
                    setDisabledSecondaryType(newVal);
                    if (updatedThisCall.secondaryType === newVal) {
                        updatedThisCall.secondaryType = 'any';
                    }
                } else {
                    setDisabledSecondaryType('noDisable');
                }
                break;
            case 'secondaryType':
                if (newVal !== updatedThisCall.primaryType) { // This should always evaluate to false, but check just in case
                    updatedThisCall.secondaryType = newVal;
                }
                break;
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
                
                <label
                    htmlFor='primaryType'
                    title='The primary type all pokemon in the pool must have.'
                >
                    Select a type:
                </label>
                <select
                    name='primaryType'
                    id='primaryType'
                    value={updatedSettings.primaryType}
                    onChange={(e)=>{updateSettings(e.target.value, 'primaryType')}}
                >
                    {primaryTypes.map((type)=>{
                        return <option key={'primary' + type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    })};
                </select>

                <label
                    htmlFor='secondaryType'
                    title='The secondary type all pokemon in the pool must have.
                    Any includes Pokemon with only a primary type.
                    None excludes Pokemon with a secondary type.'
                >
                    Select a type:
                </label>
                <select
                    name='secondaryType'
                    id='secondaryType'
                    value={updatedSettings.secondaryType}
                    onChange={(e)=>{updateSettings(e.target.value, 'secondaryType')}}
                >
                    {secondaryTypes.map((type)=>{
                        return <option key={'secondary' + type} value={type} disabled={type === disabledSecondaryType ? true : false}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    })};
                </select>

                <div id='modalSubmitOrDiscardButtonsContainer'>
                    <button onClick={()=>{discardChanges()}}>Discard Changes</button>
                    <button onClick={()=>{submitChanges()}}>Submit Changes</button>
                </div>
            </Modal>
        </div>
    )
}