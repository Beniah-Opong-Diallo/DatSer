import React, { useState, useEffect } from 'react'
import { ArrowLeft, Eye, Zap, Monitor, Volume2, Keyboard, Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const AccessibilityPage = ({ onBack }) => {
  const { isDarkMode, toggleTheme, fontSize, setFontSize, fontFamily, setFontFamily } = useTheme()
  
  // Animation settings
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const saved = localStorage.getItem('animationsEnabled')
    return saved !== 'false' // Default to true
  })
  
  const [reducedMotion, setReducedMotion] = useState(() => {
    const saved = localStorage.getItem('reducedMotion')
    return saved === 'true'
  })
  
  const [highContrast, setHighContrast] = useState(() => {
    const saved = localStorage.getItem('highContrast')
    return saved === 'true'
  })
  
  const [focusVisible, setFocusVisible] = useState(() => {
    const saved = localStorage.getItem('focusVisible')
    return saved !== 'false' // Default to true
  })
  
  // Performance settings
  const [performanceMode, setPerformanceMode] = useState(() => {
    const saved = localStorage.getItem('performanceMode')
    return saved === 'true'
  })
  
  // Apply animation settings
  useEffect(() => {
    localStorage.setItem('animationsEnabled', String(animationsEnabled))
    localStorage.setItem('reducedMotion', String(reducedMotion))
    localStorage.setItem('highContrast', String(highContrast))
    localStorage.setItem('focusVisible', String(focusVisible))
    localStorage.setItem('performanceMode', String(performanceMode))
    
    // Apply to document
    document.documentElement.classList.toggle('animations-disabled', !animationsEnabled)
    document.documentElement.classList.toggle('reduced-motion', reducedMotion)
    document.documentElement.classList.toggle('high-contrast', highContrast)
    document.documentElement.classList.toggle('focus-visible', focusVisible)
    document.documentElement.classList.toggle('performance-mode', performanceMode)
    
    // Add custom CSS for performance mode
    if (performanceMode) {
      // Disable all transitions and animations for maximum performance
      document.documentElement.style.setProperty('--transition-duration', '0ms')
      document.documentElement.style.setProperty('--animation-duration', '0ms')
    } else {
      document.documentElement.style.setProperty('--transition-duration', '')
      document.documentElement.style.setProperty('--animation-duration', '')
    }
  }, [animationsEnabled, reducedMotion, highContrast, focusVisible, performanceMode])
  
  const fontSizes = [
    { label: 'Small', value: '14' },
    { label: 'Medium', value: '16' },
    { label: 'Large', value: '18' },
    { label: 'Extra Large', value: '20' },
    { label: 'XXL', value: '24' }
  ]
  
  const fontFamilies = [
    { label: 'Inter (Default)', value: 'Inter' },
    { label: 'System', value: 'system-ui' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Courier New', value: 'Courier New, monospace' }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accessibility</h1>
            <p className="text-gray-600 dark:text-gray-400">Customize your experience</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Performance Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h2>
            </div>
            
            <div className="space-y-4">
              {/* Performance Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">Performance Mode</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Disable all animations for maximum speed</p>
                </div>
                <button
                  onClick={() => setPerformanceMode(!performanceMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    performanceMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      performanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Animations Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">Animations</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enable visual animations and transitions</p>
                </div>
                <button
                  onClick={() => setAnimationsEnabled(!animationsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    animationsEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">Reduced Motion</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Minimize animations for users with motion sensitivity</p>
                </div>
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    reducedMotion ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Visual Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Visual</h2>
            </div>
            
            <div className="space-y-4">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">High Contrast</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Increase contrast for better visibility</p>
                </div>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    highContrast ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Focus Visible */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">Focus Indicators</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Show clear focus outlines for keyboard navigation</p>
                </div>
                <button
                  onClick={() => setFocusVisible(!focusVisible)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    focusVisible ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      focusVisible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">Dark Mode</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reduce eye strain in low-light environments</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDarkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Typography Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Typography</h2>
            </div>
            
            <div className="space-y-4">
              {/* Font Size */}
              <div>
                <label className="font-medium text-gray-900 dark:text-white mb-2 block">Font Size</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setFontSize(size.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        fontSize === size.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Font Family */}
              <div>
                <label className="font-medium text-gray-900 dark:text-white mb-2 block">Font Family</label>
                <div className="space-y-2">
                  {fontFamilies.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => setFontFamily(font.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                        fontFamily === font.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setPerformanceMode(true)
                  setAnimationsEnabled(false)
                  setReducedMotion(true)
                }}
                className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                ⚡ Maximum Performance
              </button>
              <button
                onClick={() => {
                  setPerformanceMode(false)
                  setAnimationsEnabled(true)
                  setReducedMotion(false)
                  setHighContrast(false)
                }}
                className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                ✨ Full Animations
              </button>
              <button
                onClick={() => {
                  setHighContrast(true)
                  setFontSize('20')
                  setFocusVisible(true)
                }}
                className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                👁️ High Visibility
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('animationsEnabled')
                  localStorage.removeItem('reducedMotion')
                  localStorage.removeItem('highContrast')
                  localStorage.removeItem('focusVisible')
                  localStorage.removeItem('performanceMode')
                  localStorage.removeItem('fontSize')
                  localStorage.removeItem('fontFamily')
                  window.location.reload()
                }}
                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                🔄 Reset All Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessibilityPage
