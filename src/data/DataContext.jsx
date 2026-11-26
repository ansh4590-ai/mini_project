// DataContext.jsx — global state: data, filters, refresh
import React, {
  createContext, useContext, useState, useEffect, useCallback, useMemo,
} from 'react';
import { SHEET_CSV_URL, APPS_SCRIPT_URL, REFRESH_INTERVAL_MS } from '../config.js';
import { loadSheetData } from './dataLoader.js';
import { DEMO_DATA } from './demoData.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [rawRows, setRawRows]           = useState([]);
  const [matchReport, setMatchReport]   = useState({ matched: {}, unmatched: [], missing: [] });
  const [source, setSource]             = useState('demo'); // 'demo' | 'csv' | 'apps-script'
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [lastUpdated, setLastUpdated]   = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    age: [],
    gender: [],
    status: [],
    ever: [],
    freq: [],
    dateFrom: '',
    dateTo: '',
  });

  const [mergeSparse, setMergeSparse] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!SHEET_CSV_URL && !APPS_SCRIPT_URL) throw new Error('NO_URL');
      const result = await loadSheetData(SHEET_CSV_URL, APPS_SCRIPT_URL);
      setRawRows(result.rows);
      setMatchReport(result.matchReport);
      setSource(result.source);
    } catch (e) {
      if (e.message === 'NO_URL') {
        setRawRows(DEMO_DATA);
        setSource('demo');
        setMatchReport({ matched: {}, unmatched: [], missing: [] });
      } else {
        setError(e.message);
        // Fall back to demo on error
        setRawRows(DEMO_DATA);
        setSource('demo');
      }
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-refresh
  useEffect(() => {
    const timer = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rawRows.filter(row => {
      if (filters.age.length && !filters.age.includes(row._age)) return false;
      if (filters.gender.length && !filters.gender.includes(row._gender)) return false;
      if (filters.status.length && !filters.status.includes(row._status)) return false;
      if (filters.ever.length && !filters.ever.includes(row._ever)) return false;
      if (filters.freq.length && !filters.freq.includes(row._freq)) return false;
      if (filters.dateFrom && row._timestamp && row._timestamp < filters.dateFrom) return false;
      if (filters.dateTo && row._timestamp && row._timestamp > filters.dateTo + 'T23:59:59') return false;
      return true;
    });
  }, [rawRows, filters]);

  // Data quality: Rank1 = Rank2 duplicates
  const rankDuplicates = useMemo(() =>
    filteredRows.filter(r => r._rank1Id && r._rank2Id && r._rank1Id === r._rank2Id).length,
    [filteredRows]
  );

  // Consistency flags: says "never volunteer" but freq ≠ Never
  const consistencyIssues = useMemo(() => {
    return filteredRows.filter(r => {
      const neverVol = r._ever === 'No, I have never volunteered';
      const freqNever = r._freq === 'Never' || r._freqNum === 1;
      const currentVol = r._ever === 'Yes, I currently volunteer';
      return (neverVol && !freqNever) || (currentVol && freqNever);
    }).length;
  }, [filteredRows]);

  const resetFilters = useCallback(() => {
    setFilters({ age: [], gender: [], status: [], ever: [], freq: [], dateFrom: '', dateTo: '' });
  }, []);

  const value = {
    rawRows, filteredRows, matchReport,
    source, loading, error, lastUpdated,
    filters, setFilters, resetFilters,
    mergeSparse, setMergeSparse,
    rankDuplicates, consistencyIssues,
    refresh: load,
    n: filteredRows.length,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

