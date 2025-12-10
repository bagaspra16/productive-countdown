import React, { useState } from 'react';
import { PomodoroMethod, POMODORO_PRESETS, createCustomMethod } from '../types/pomodoro';

interface PomodoroMethodSelectorProps {
    onSelectMethod: (method: PomodoroMethod) => void;
}

const PomodoroMethodSelector: React.FC<PomodoroMethodSelectorProps> = ({ onSelectMethod }) => {
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customFocus, setCustomFocus] = useState('25');
    const [customRest, setCustomRest] = useState('5');
    const [customName, setCustomName] = useState('');

    const handlePresetSelect = (preset: PomodoroMethod) => {
        onSelectMethod(preset);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const focusNum = parseInt(customFocus) || 25;
        const restNum = parseInt(customRest) || 5;
        const customMethod = createCustomMethod(focusNum, restNum, customName || undefined);
        onSelectMethod(customMethod);
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-3">
                    Choose Your Pomodoro Method
                </h2>
                <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto">
                    Select a preset method or create your own custom focus and rest intervals
                </p>
            </div>

            {!showCustomForm ? (
                <>
                    {/* Preset Methods */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                        {POMODORO_PRESETS.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => handlePresetSelect(preset)}
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-surface/80 to-dark-surface/60 backdrop-blur-lg border border-dark-accent/30 p-6 sm:p-8 text-left transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-glow"
                            >
                                <div className="relative z-10">
                                    <h3 className="text-xl sm:text-2xl font-bold text-gradient mb-3">
                                        {preset.name}
                                    </h3>
                                    <p className="text-text-secondary text-sm mb-4">
                                        {preset.description}
                                    </p>

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex-1">
                                            <div className="text-xs text-text-muted mb-1">Focus Time</div>
                                            <div className="text-2xl sm:text-3xl font-bold text-primary">
                                                {preset.focusDuration}
                                                <span className="text-sm text-text-secondary ml-1">min</span>
                                            </div>
                                        </div>

                                        <div className="text-text-muted text-2xl">→</div>

                                        <div className="flex-1">
                                            <div className="text-xs text-text-muted mb-1">Rest Time</div>
                                            <div className="text-2xl sm:text-3xl font-bold text-secondary">
                                                {preset.restDuration}
                                                <span className="text-sm text-text-secondary ml-1">min</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-primary text-sm font-medium">
                                        Start Session
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Animated gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>
                        ))}
                    </div>

                    {/* Custom Method Button */}
                    <div className="text-center">
                        <button
                            onClick={() => setShowCustomForm(true)}
                            className="btn btn-outline btn-lg group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Custom Method
                        </button>
                    </div>
                </>
            ) : (
                /* Custom Method Form */
                <div className="max-w-md mx-auto">
                    <div className="rounded-2xl bg-gradient-to-br from-dark-surface/80 to-dark-surface/60 backdrop-blur-lg border border-dark-accent/30 p-6 sm:p-8">
                        <h3 className="text-xl sm:text-2xl font-bold text-gradient mb-6">
                            Custom Pomodoro Method
                        </h3>

                        <form onSubmit={handleCustomSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="customName" className="block text-sm font-medium text-text-primary mb-2">
                                    Method Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="customName"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    placeholder="e.g., My Focus Method"
                                    className="w-full px-4 py-3 rounded-lg bg-dark-accent/20 border border-dark-accent/30 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="focusDuration" className="block text-sm font-medium text-text-primary mb-2">
                                    Focus Duration (minutes)
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    id="focusDuration"
                                    value={customFocus}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Allow empty string
                                        if (val === '') {
                                            setCustomFocus('');
                                            return;
                                        }
                                        // Only allow digits
                                        if (!/^\d+$/.test(val)) {
                                            return;
                                        }
                                        // Validate range
                                        const num = parseInt(val);
                                        if (num >= 1 && num <= 180) {
                                            setCustomFocus(val);
                                        }
                                    }}
                                    onBlur={() => {
                                        // Set default if empty on blur
                                        if (customFocus === '') {
                                            setCustomFocus('25');
                                        }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-dark-accent/20 border border-dark-accent/30 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-lg font-semibold"
                                    placeholder="25"
                                />
                                <p className="text-xs text-text-muted mt-1">1-180 minutes</p>
                            </div>

                            <div>
                                <label htmlFor="restDuration" className="block text-sm font-medium text-text-primary mb-2">
                                    Rest Duration (minutes)
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    id="restDuration"
                                    value={customRest}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Allow empty string
                                        if (val === '') {
                                            setCustomRest('');
                                            return;
                                        }
                                        // Only allow digits
                                        if (!/^\d+$/.test(val)) {
                                            return;
                                        }
                                        // Validate range
                                        const num = parseInt(val);
                                        if (num >= 1 && num <= 60) {
                                            setCustomRest(val);
                                        }
                                    }}
                                    onBlur={() => {
                                        // Set default if empty on blur
                                        if (customRest === '') {
                                            setCustomRest('5');
                                        }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-dark-accent/20 border border-dark-accent/30 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-lg font-semibold"
                                    placeholder="5"
                                />
                                <p className="text-xs text-text-muted mt-1">1-60 minutes</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCustomForm(false)}
                                    className="flex-1 btn btn-outline"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn btn-primary"
                                >
                                    Start Custom Method
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PomodoroMethodSelector;
