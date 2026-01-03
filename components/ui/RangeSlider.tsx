'use client';

import React, { useState, useEffect, useRef } from 'react';

interface RangeSliderProps {
    min: number;
    max: number;
    step?: number;
    value: { min: number; max: number };
    onChange: (value: { min: number; max: number }) => void;
    formatLabel?: (value: number) => string;
}

export function RangeSlider({ min, max, step = 1, value, onChange, formatLabel }: RangeSliderProps) {
    const [localMin, setLocalMin] = useState(value.min);
    const [localMax, setLocalMax] = useState(value.max);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalMin(value.min);
        setLocalMax(value.max);
    }, [value]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = Math.min(Number(e.target.value), localMax - step);
        if (newVal >= min) {
            setLocalMin(newVal);
            onChange({ min: newVal, max: localMax });
        }
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = Math.max(Number(e.target.value), localMin + step);
        if (newVal <= max) {
            setLocalMax(newVal);
            onChange({ min: localMin, max: newVal });
        }
    };

    const getPercent = (value: number) => Math.round(((value - min) / (max - min)) * 100);

    return (
        <div className="w-full space-y-3">
            <div className="flex items-center justify-between gap-4">
                <input
                    type="number"
                    value={localMin}
                    onChange={handleMinChange}
                    className="w-16 p-1.5 bg-secondary border border-border rounded-lg text-[10px] font-bold text-center outline-none focus:border-primary/50"
                    min={min}
                    max={max}
                />
                <div className="flex-1 relative h-6 flex items-center group">
                    {/* Track Background */}
                    <div className="absolute w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-75"
                            style={{
                                left: `${getPercent(localMin)}%`,
                                width: `${getPercent(localMax) - getPercent(localMin)}%`,
                                position: 'absolute'
                            }}
                        />
                    </div>

                    {/* Range Inputs (Infinite Invisible Styling) */}
                    <input
                        type="range"
                        min={min} max={max} step={step}
                        value={localMin}
                        onChange={handleMinChange}
                        className="absolute w-full h-full opacity-0 cursor-pointer z-20 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 appearance-none"
                    />
                    <input
                        type="range"
                        min={min} max={max} step={step}
                        value={localMax}
                        onChange={handleMaxChange}
                        className="absolute w-full h-full opacity-0 cursor-pointer z-20 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 appearance-none"
                    />

                    {/* Visible Thumbs for Visual Feedback */}
                    <div
                        className="absolute w-4 h-4 bg-background border-2 border-primary rounded-full shadow-md transition-all duration-75 pointer-events-none z-10"
                        style={{ left: `calc(${getPercent(localMin)}% - 8px)` }}
                    />
                    <div
                        className="absolute w-4 h-4 bg-background border-2 border-primary rounded-full shadow-md transition-all duration-75 pointer-events-none z-10"
                        style={{ left: `calc(${getPercent(localMax)}% - 8px)` }}
                    />
                </div>
                <input
                    type="number"
                    value={localMax}
                    onChange={handleMaxChange}
                    className="w-16 p-1.5 bg-secondary border border-border rounded-lg text-[10px] font-bold text-center outline-none focus:border-primary/50"
                    min={min}
                    max={max}
                />
            </div>
        </div>
    );
}
