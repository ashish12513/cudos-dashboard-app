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
      <label className="block text-sm font-semibold text-white mb-2">{label}</label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border-2 border-white/30 rounded-lg bg-white/10 text-white text-left flex justify-between items-center hover:border-white/50 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white transition-all"
      >
        <span className="text-sm font-medium text-white">
          {selected.length === 0 
            ? 'Select...' 
            : selected.length === 1 
            ? selected[0] 
            : `${selected.length} selected`}
        </span>
        <span className={`text-white transition-transform font-bold ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-[#1B7D3F] rounded-lg shadow-xl z-50">
          <div className="p-2 border-b-2 border-[#1B7D3F]/20 bg-gradient-to-r from-[#1B7D3F]/5 to-[#2BA84F]/5">
            <button
              onClick={handleSelectAll}
              className="w-full px-3 py-2 text-sm text-left hover:bg-[#1B7D3F]/20 rounded transition-colors font-bold text-[#1B7D3F]"
            >
              {selected.length === options.length ? '✓ Deselect All' : '✓ Select All'}
            </button>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-[#1B7D3F]/10 hover:to-[#2BA84F]/10 cursor-pointer transition-colors border-b border-[#1B7D3F]/10 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => handleToggle(option)}
                  className="w-4 h-4 text-[#1B7D3F] border-[#1B7D3F] rounded focus:ring-[#1B7D3F] cursor-pointer accent-[#1B7D3F]"
                />
                <span className="ml-3 text-sm font-medium text-gray-800">{option}</span>
                {selected.includes(option) && (
                  <span className="ml-auto text-[#1B7D3F] font-bold">✓</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-white/70 mt-1">Click to select multiple options</p>
    </div>
  )
}
