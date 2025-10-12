/**
 * Slice Redux pour les attractions
 */

import { createSlice, type PayloadAction, type WritableDraft } from '@reduxjs/toolkit';
import type { AttractionsState, Attraction, SearchFilters } from '@/types';

const initialState: AttractionsState = {
  items: [],
  selectedAttraction: null,
  loading: false,
  error: null,
  filters: {},
};

export const attractionsSlice = createSlice({
  name: 'attractions',
  initialState,
  reducers: {
    setAttractions: (state, action: PayloadAction<Attraction[]>) => {
      state.items = action.payload as WritableDraft<Attraction>[];
    },
    setSelectedAttraction: (state, action: PayloadAction<Attraction | null>) => {
      state.selectedAttraction = action.payload as WritableDraft<Attraction> | null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload as WritableDraft<SearchFilters>;
    },
  },
});

export const { setAttractions, setSelectedAttraction, setLoading, setError, setFilters } = attractionsSlice.actions;
export default attractionsSlice.reducer;