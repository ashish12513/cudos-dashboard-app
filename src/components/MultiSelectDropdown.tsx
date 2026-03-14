import { useState, useRef, useEffect } from 'react'

interface MultiSelectDropdownProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([])
    } else {
      onChange([...options])
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-left flex justify-between items-center hover:border-[#1B7D3F] focus:outline-none focus:ring-2 focus:ring-[#1B7D3F] transition-all"
      >
        <span className="text-sm">
          {selected.length === 0 
            ? 'Select...' 
            : selected.length === 1 
            ? selected[0] 
            : `${selected.length} selected`}
        </span>
        <span className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-2 border-b border-gray-200">
            <button
              onClick={handleSelectAll}
              className="w-full px-3 py-2 text-sm text-left hover:bg-[#1B7D3F]/10 rounded transition-colors font-semibold text-[#1B7D3F]"
            >
              {selected.length === options.length ? '✓ Deselect All' : '✓ Select All'}
            </button>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-4 py-2 hover:bg-[#1B7D3F]/5 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => handleToggle(option)}
                  className="w-4 h-4 text-[#1B7D3F] border-gray-300 rounded focus:ring-[#1B7D3F] cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">Click to select multiple options</p>
    </div>
  )
}
