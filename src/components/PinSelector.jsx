import React from 'react';
import clsx from 'clsx';
import './PinSelector.css';

/**
 * PinSelector Component
 * Renders a visual representation of 10 bowling pins.
 * 
 * @param {Object} props
 * @param {number[]} props.selectedPins - Array of pin numbers (1-10) that are currently selected (knocked down).
 * @param {function} props.onPinToggle - Callback when a pin is clicked. Receives the pin number.
 * @param {boolean} props.disabled - Whether interaction is disabled.
 */
const PinSelector = ({ selectedPins, onPinToggle, disabled = false }) => {
    const isSelected = (pin) => selectedPins.includes(pin);

    const renderPin = (pinNumber) => (
        <button
            key={pinNumber}
            className={clsx('pin', { 'is-knocked': isSelected(pinNumber) })}
            onClick={() => !disabled && onPinToggle(pinNumber)}
            disabled={disabled}
            aria-label={`Pin ${pinNumber} ${isSelected(pinNumber) ? 'Knocked Down' : 'Standing'}`}
        >
            <span className="pin-number">{pinNumber}</span>
        </button>
    );

    return (
        <div className="pin-selector-container">
            {/* Row 4 (Back) */}
            <div className="pin-row row-4">
                {renderPin(7)}
                {renderPin(8)}
                {renderPin(9)}
                {renderPin(10)}
            </div>

            {/* Row 3 */}
            <div className="pin-row row-3">
                {renderPin(4)}
                {renderPin(5)}
                {renderPin(6)}
            </div>

            {/* Row 2 */}
            <div className="pin-row row-2">
                {renderPin(2)}
                {renderPin(3)}
            </div>

            {/* Row 1 (Front) */}
            <div className="pin-row row-1">
                {renderPin(1)}
            </div>
        </div>
    );
};

export default PinSelector;
