import { useState, useCallback, useEffect } from 'react';
import { PomodoroMethod, PomodoroSession, PomodoroState, SessionType } from '../types/pomodoro';

interface UsePomodoroProps {
    onSessionComplete?: (session: PomodoroSession) => void;
    onMethodChange?: (method: PomodoroMethod | null) => void;
}

export const usePomodoro = ({ onSessionComplete, onMethodChange }: UsePomodoroProps = {}) => {
    const [state, setState] = useState<PomodoroState>({
        currentMethod: null,
        currentSession: null,
        sessionHistory: [],
        cycleCount: 0,
    });

    // Load saved method from localStorage on mount
    useEffect(() => {
        const savedMethod = localStorage.getItem('pomodoroMethod');
        if (savedMethod) {
            try {
                const method = JSON.parse(savedMethod) as PomodoroMethod;
                setState(prev => ({ ...prev, currentMethod: method }));
            } catch (error) {
                console.error('Error loading saved Pomodoro method:', error);
            }
        }
    }, []);

    // Save method to localStorage when it changes
    useEffect(() => {
        if (state.currentMethod) {
            localStorage.setItem('pomodoroMethod', JSON.stringify(state.currentMethod));
        } else {
            localStorage.removeItem('pomodoroMethod');
        }
    }, [state.currentMethod]);

    const setMethod = useCallback((method: PomodoroMethod | null) => {
        setState(prev => ({
            ...prev,
            currentMethod: method,
            currentSession: null,
            sessionHistory: [],
            cycleCount: 0,
        }));
        onMethodChange?.(method);
    }, [onMethodChange]);

    const startFocusSession = useCallback(() => {
        if (!state.currentMethod) return;

        const session: PomodoroSession = {
            type: SessionType.FOCUS,
            duration: state.currentMethod.focusDuration,
            startTime: new Date(),
            completed: false,
        };

        setState(prev => ({
            ...prev,
            currentSession: session,
        }));
    }, [state.currentMethod]);

    const startRestSession = useCallback(() => {
        if (!state.currentMethod) return;

        const session: PomodoroSession = {
            type: SessionType.REST,
            duration: state.currentMethod.restDuration,
            startTime: new Date(),
            completed: false,
        };

        setState(prev => ({
            ...prev,
            currentSession: session,
        }));
    }, [state.currentMethod]);

    const completeCurrentSession = useCallback(() => {
        if (!state.currentSession) {
            console.log('completeCurrentSession: No current session');
            return;
        }

        const completedSession: PomodoroSession = {
            ...state.currentSession,
            endTime: new Date(),
            completed: true,
        };

        console.log('completeCurrentSession: Completing session type:', completedSession.type);

        setState(prev => {
            const newHistory = [...prev.sessionHistory, completedSession];
            // Increment cycle count only after REST session completes (FOCUS + REST = 1 cycle)
            const newCycleCount = completedSession.type === SessionType.REST
                ? prev.cycleCount + 1
                : prev.cycleCount;

            return {
                ...prev,
                sessionHistory: newHistory,
                cycleCount: newCycleCount,
                currentSession: null,
            };
        });

        onSessionComplete?.(completedSession);

        // DO NOT auto-start next session - wait for user to stop alarm
    }, [state.currentSession, onSessionComplete]);

    // Start the next session after alarm is stopped
    // Pass the completed session type to determine what's next
    const startNextSession = useCallback((completedSessionType?: SessionType) => {
        console.log('=== START NEXT SESSION DEBUG ===');
        console.log('completedSessionType parameter:', completedSessionType);
        console.log('SessionType.FOCUS value:', SessionType.FOCUS);
        console.log('SessionType.REST value:', SessionType.REST);
        console.log('Are they equal?', completedSessionType === SessionType.FOCUS);

        if (!state.currentMethod) {
            console.log('ERROR: No method selected');
            return;
        }

        // Simple, direct logic
        if (completedSessionType === SessionType.FOCUS) {
            console.log('✅ FOCUS session completed → Starting REST session');
            startRestSession();
        } else if (completedSessionType === SessionType.REST) {
            console.log('✅ REST session completed → Starting FOCUS session');
            startFocusSession();
        } else {
            // Fallback - check history
            console.log('⚠️ No completedSessionType, checking history...');
            const lastSession = state.sessionHistory[state.sessionHistory.length - 1];
            if (lastSession?.type === SessionType.FOCUS) {
                console.log('History shows FOCUS → Starting REST');
                startRestSession();
            } else {
                console.log('Defaulting to FOCUS session');
                startFocusSession();
            }
        }
        console.log('=== END DEBUG ===');
    }, [state.currentMethod, state.sessionHistory, startFocusSession, startRestSession]);

    const resetPomodoro = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentSession: null,
            sessionHistory: [],
            cycleCount: 0,
        }));
    }, []);

    const clearMethod = useCallback(() => {
        setState({
            currentMethod: null,
            currentSession: null,
            sessionHistory: [],
            cycleCount: 0,
        });
        localStorage.removeItem('pomodoroMethod');
        onMethodChange?.(null);
    }, [onMethodChange]);

    return {
        currentMethod: state.currentMethod,
        currentSession: state.currentSession,
        sessionHistory: state.sessionHistory,
        cycleCount: state.cycleCount,
        setMethod,
        startFocusSession,
        startRestSession,
        completeCurrentSession,
        startNextSession,
        resetPomodoro,
        clearMethod,
    };
};
