import React from 'react';
import PropTypes from 'prop-types';

/**
 * Accessible reusable toggle switch component.
 * Props:
 *  - checked: boolean
 *  - onChange: (checked:boolean)=>void
 *  - label: string (visual/aria label)
 *  - description?: string (additional context, announced by screen readers)
 *  - id?: string (auto-generated fallback)
 *  - disabled?: boolean
 *  - className?: string (wrapper)
 */
const ToggleSwitch = ({
  checked,
  onChange,
  label,
  description,
  id,
  disabled = false,
  className = ''
}) => {
  const switchId = id || React.useId();
  const descId = description ? `${switchId}-desc` : undefined;
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex-1 min-w-0">
        <label htmlFor={switchId} className="font-medium text-gray-900 cursor-pointer select-none flex items-start gap-2">
          <span>{label}</span>
          <span className="sr-only">toggle</span>
        </label>
        {description && (
          <p id={descId} className="text-sm text-gray-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={descId}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ring-1 ring-black/5 ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

ToggleSwitch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default ToggleSwitch;
