import '@testing-library/jest-dom';
import React from 'react';

// RTL 16 / React 19 fix
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

if (!React.act) {
  // Try to find act elsewhere or polyfill
  try {
    const { act } = require('react');
    (React as any).act = act;
  } catch (e) {
    (React as any).act = (cb: any) => cb();
  }
}
